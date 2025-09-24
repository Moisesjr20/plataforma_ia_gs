# Multi-stage build para otimizar o tamanho da imagem final
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Definir ARGs para receber variáveis de ambiente durante o build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_WEBHOOK_AUGUSTO
ARG VITE_WEBHOOK_SOFIA
ARG VITE_WEBHOOK_CAROL
ARG NODE_ENV=production

# Exportar como variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_WEBHOOK_AUGUSTO=$VITE_WEBHOOK_AUGUSTO
ENV VITE_WEBHOOK_SOFIA=$VITE_WEBHOOK_SOFIA
ENV VITE_WEBHOOK_CAROL=$VITE_WEBHOOK_CAROL
ENV NODE_ENV=$NODE_ENV

# Build da aplicação com as variáveis de ambiente
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine AS production

# Remover configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Criar configuração customizada do Nginx
RUN echo 'server { \
    listen 80; \
    listen [::]:80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Logs \
    access_log /var/log/nginx/access.log; \
    error_log /var/log/nginx/error.log warn; \
    \
    # Configuração para SPA - redirecionar todas as rotas para index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
    \
    # Cache para assets estáticos \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        access_log off; \
    } \
    \
    # Configurações de segurança \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
    \
    # Health check \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Configurar nginx.conf principal
RUN echo 'user nginx; \
worker_processes auto; \
error_log /var/log/nginx/error.log warn; \
pid /var/run/nginx.pid; \
\
events { \
    worker_connections 1024; \
    use epoll; \
    multi_accept on; \
} \
\
http { \
    include /etc/nginx/mime.types; \
    default_type application/octet-stream; \
    \
    # Logs \
    log_format main "$remote_addr - $remote_user [$time_local] \"$request\" " \
                    "$status $body_bytes_sent \"$http_referer\" " \
                    "\"$http_user_agent\" \"$http_x_forwarded_for\""; \
    \
    access_log /var/log/nginx/access.log main; \
    \
    # Performance \
    sendfile on; \
    tcp_nopush on; \
    tcp_nodelay on; \
    keepalive_timeout 65; \
    types_hash_max_size 2048; \
    \
    # Gzip \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_comp_level 6; \
    gzip_types \
        text/plain \
        text/css \
        text/xml \
        text/javascript \
        application/javascript \
        application/xml+rss \
        application/json \
        application/xml \
        image/svg+xml; \
    \
    # Include server configs \
    include /etc/nginx/conf.d/*.conf; \
}' > /etc/nginx/nginx.conf

# Copiar arquivos da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar diretórios de log se não existirem
RUN mkdir -p /var/log/nginx

# Expor porta 80
EXPOSE 80

# Instalar curl para health checks
RUN apk add --no-cache curl

# Health check otimizado para EasyPanel - resposta mais rápida
HEALTHCHECK --interval=5s --timeout=2s --start-period=1s --retries=2 \
  CMD curl -f http://localhost/health || exit 1

# Criar script de inicialização mais robusto
RUN echo '#!/bin/sh' > /docker-entrypoint-custom.sh && \
    echo 'echo "Starting Nginx..."' >> /docker-entrypoint-custom.sh && \
    echo 'nginx -t' >> /docker-entrypoint-custom.sh && \
    echo 'echo "Nginx configuration test successful"' >> /docker-entrypoint-custom.sh && \
    echo 'echo "Waiting for EasyPanel health check initialization..."' >> /docker-entrypoint-custom.sh && \
    echo 'sleep 2' >> /docker-entrypoint-custom.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint-custom.sh && \
    chmod +x /docker-entrypoint-custom.sh

# Usar o script customizado
CMD ["/docker-entrypoint-custom.sh"]