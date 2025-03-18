
import React from 'react';
import { CardData, formatPrice } from '@/utils/api';
import { useImageLoading, useIntersectionObserver, getStaggeredDelay } from '@/utils/animations';
import { cn } from '@/lib/utils';

interface CardResultProps {
  card: CardData;
  index: number;
}

const CardResult: React.FC<CardResultProps> = ({ card, index }) => {
  const [isImageLoaded, imageSrc, imageRef] = useImageLoading(
    card.card_images[0]?.image_url
  );
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const animationStyle = {
    animationDelay: getStaggeredDelay(index),
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "glass-card rounded-2xl overflow-hidden transition-all duration-700 animate-scale-in",
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16",
      )}
      style={animationStyle}
    >
      <div className="flex flex-col h-full">
        <div className="relative pt-[56.25%] bg-secondary/30 overflow-hidden">
          {imageSrc && (
            <img
              ref={imageRef}
              src={imageSrc}
              alt={card.name}
              className={cn(
                "absolute inset-0 w-full h-full object-contain transition-all duration-700",
                isImageLoaded ? "blur-0 scale-100" : "blur-xl scale-105"
              )}
            />
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-medium line-clamp-2">{card.name}</h3>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {card.type}
            </span>
          </div>
          
          {card.archetype && (
            <p className="text-sm text-muted-foreground mb-4">
              Archetype: {card.archetype}
            </p>
          )}
          
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-medium">Market Prices:</h4>
            <div className="grid grid-cols-2 gap-3">
              <PriceItem 
                title="TCGPlayer" 
                price={formatPrice(card.card_prices[0]?.tcgplayer_price)} 
              />
              <PriceItem 
                title="Cardmarket" 
                price={formatPrice(card.card_prices[0]?.cardmarket_price)} 
              />
              <PriceItem 
                title="eBay" 
                price={formatPrice(card.card_prices[0]?.ebay_price)} 
              />
              <PriceItem 
                title="Amazon" 
                price={formatPrice(card.card_prices[0]?.amazon_price)} 
              />
            </div>
          </div>
          
          {card.card_sets && card.card_sets.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Card Sets:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {card.card_sets.slice(0, 3).map((set, idx) => (
                  <div 
                    key={`${set.set_code}-${idx}`}
                    className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
                  >
                    <span className="text-muted-foreground">{set.set_name}</span>
                    <span className="font-medium">{formatPrice(set.set_price)}</span>
                  </div>
                ))}
                {card.card_sets.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground pt-1">
                    +{card.card_sets.length - 3} more sets
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PriceItemProps {
  title: string;
  price: string;
}

const PriceItem: React.FC<PriceItemProps> = ({ title, price }) => (
  <div className="rounded-lg bg-secondary/50 p-2 flex flex-col">
    <span className="text-xs text-muted-foreground">{title}</span>
    <span className="text-sm font-medium">{price}</span>
  </div>
);

export default CardResult;
