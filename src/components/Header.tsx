
import React from 'react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn(
      "w-full py-6 px-6 sm:px-8 glass fixed top-0 z-50 animate-slide-down", 
      className
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M7 7h.01" />
              <path d="M12 7h.01" />
              <path d="M17 7h.01" />
              <path d="M7 12h.01" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 17h.01" />
              <path d="M12 17h.01" />
              <path d="M17 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-display font-medium">YuGiOh Price Extractor</h1>
            <p className="text-xs text-muted-foreground">Powered by YGOProDeck API</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a 
            href="https://db.ygoprodeck.com/api-guide/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            API Docs
          </a>
          <a 
            href="https://ygoprodeck.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            YGOProDeck
          </a>
          <div className="h-8 w-px bg-border"></div>
          <a 
            href="https://github.com/yourusername/yugioh-price-extractor" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
