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

# Build da aplicação
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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]