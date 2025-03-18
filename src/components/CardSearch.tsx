
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchCardByName, CardData } from '@/utils/api';
import { Search } from 'lucide-react';
import { useIntersectionObserver } from '@/utils/animations';
import { cn } from '@/lib/utils';

interface CardSearchProps {
  onResults: (cards: CardData[]) => void;
  className?: string;
}

const CardSearch: React.FC<CardSearchProps> = ({ onResults, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
  });

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast({
        title: "Search term required",
        description: "Please enter a card name to search.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const cards = await fetchCardByName(searchTerm);
      onResults(cards);
      
      if (cards.length === 0) {
        toast({
          title: "No results found",
          description: `No cards matching "${searchTerm}" were found.`,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast, onResults]);

  return (
    <div 
      ref={elementRef}
      className={cn(
        "w-full max-w-2xl mx-auto transition-all duration-700",
        isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
    >
      <div className="glass-card rounded-2xl p-8 shadow-lg">
        <h2 className="text-xl sm:text-2xl font-display font-medium text-center mb-2">
          Search for a card
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter the name of a Yu-Gi-Oh! card to see its prices from various marketplaces
        </p>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Card name (e.g. Blue-Eyes White Dragon)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-12 rounded-xl border-input bg-background pl-4"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={18} />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-12 px-6 rounded-xl"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardSearch;
