
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetchCardByName, CardData } from '@/utils/api';
import { Search, Download } from 'lucide-react';
import { useIntersectionObserver } from '@/utils/animations';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { generateJsonFile } from '@/utils/fileUtils';
import { Progress } from '@/components/ui/progress';

interface CardSearchProps {
  onResults: (cards: CardData[]) => void;
  className?: string;
}

const CardSearch: React.FC<CardSearchProps> = ({ onResults, className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
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
    
    // Check if we have multiple card names (comma-separated)
    if (searchTerm.includes(',')) {
      await handleBatchSearch();
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

  const handleBatchSearch = async () => {
    const cardNames = searchTerm
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (cardNames.length === 0) {
      toast({
        title: "No valid card names",
        description: "Please enter at least one valid card name",
        variant: "destructive",
      });
      return;
    }
    
    // Confirm with the user if there are many cards
    if (cardNames.length > 20) {
      const confirm = window.confirm(
        `You're about to process ${cardNames.length} cards. This might take some time and could result in API rate limits. Continue?`
      );
      
      if (!confirm) {
        return;
      }
    }
    
    setIsBatchProcessing(true);
    setProcessingProgress(0);
    setIsLoading(true);
    
    const results: Array<{card_name: string, price: string}> = [];
    let successCount = 0;
    let errorCount = 0;
    
    // Monitor progress
    const updateInterval = setInterval(() => {
      setProcessingProgress(prev => {
        const newValue = prev + (100 / cardNames.length / 10);
        return newValue > 99 ? 99 : newValue;
      });
    }, 100);
    
    // Process each card name
    for (let i = 0; i < cardNames.length; i++) {
      const cardName = cardNames[i];
      
      try {
        const cardData = await fetchCardByName(cardName);
        
        if (cardData.length > 0) {
          // Get the price from TCGPlayer
          const price = cardData[0].card_prices[0]?.tcgplayer_price || "0.00";
          
          results.push({
            card_name: cardData[0].name,
            price: price
          });
          
          successCount++;
        } else {
          results.push({
            card_name: cardName,
            price: "Not found"
          });
          
          errorCount++;
        }
      } catch (error) {
        results.push({
          card_name: cardName,
          price: "Error"
        });
        
        errorCount++;
      }
      
      // Short delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    clearInterval(updateInterval);
    setProcessingProgress(100);
    
    // Generate JSON file with the results
    generateJsonFile(results);
    
    if (errorCount > 0) {
      toast({
        title: "Processing complete",
        description: `Found ${successCount} cards, ${errorCount} not found or errors`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Processing complete",
        description: `Successfully processed all ${successCount} cards`,
      });
    }
    
    setIsLoading(false);
    setIsBatchProcessing(false);
    setProcessingProgress(0);
  };

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
          Search for cards
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter the name of a Yu-Gi-Oh! card or a comma-separated list of card names
        </p>
        
        <form onSubmit={handleSearch} className="relative">
          <div className="flex flex-col w-full items-center space-y-4">
            <div className="relative w-full">
              <Textarea
                placeholder="Card name(s) (e.g. Blue-Eyes White Dragon, Dark Magician)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 min-h-24 rounded-xl border-input bg-background pl-4"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-6 text-muted-foreground">
                <Search size={18} />
              </div>
            </div>
            
            {isBatchProcessing && (
              <div className="w-full space-y-2">
                <Progress value={processingProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Processing cards... {Math.round(processingProgress)}%
                </p>
              </div>
            )}
            
            <div className="text-sm text-center text-muted-foreground mb-4">
              <p>For multiple cards, separate with commas:</p>
              <p className="text-xs">Example: "Blue-Eyes White Dragon, Dark Magician, Kuriboh"</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="h-12 px-6 rounded-xl w-full sm:w-auto"
            >
              {isLoading ? "Processing..." : "Search"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CardSearch;
