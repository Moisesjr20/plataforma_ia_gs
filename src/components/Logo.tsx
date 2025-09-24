import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '' }) => {
  return (
    <div 
      className={`rounded-full overflow-hidden shadow-lg shadow-gold/25 ring-2 ring-gold/30 hover:ring-gold/50 transition-all duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/logo-gs.png" 
        alt="GE IA Logo" 
        className="w-full h-full object-cover object-center"
        onError={(e) => {
          // Fallback caso a imagem não carregue
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold text-lg">GE</div>';
          }
        }}
      />
    </div>
  )
}

export const LogoText: React.FC<{ className?: string, size?: 'sm' | 'md' | 'lg' }> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const logoSizes = {
    sm: 32,
    md: 48,
    lg: 64
  }

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Logo size={logoSizes[size]} />
      <div>
        <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent`}>
          GE IA
        </h1>
        <p className="text-gold/60 text-xs font-light tracking-wide">PLATAFORMA PREMIUM</p>
      </div>
    </div>
  )
}