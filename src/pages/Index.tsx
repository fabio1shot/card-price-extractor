
import React, { useState } from 'react';
import { CardData } from '@/utils/api';
import Header from '@/components/Header';
import CardSearch from '@/components/CardSearch';
import CardResult from '@/components/CardResult';
import { useIntersectionObserver } from '@/utils/animations';
import { cn } from '@/lib/utils';

const Index = () => {
  const [searchResults, setSearchResults] = useState<CardData[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  const handleSearchResults = (cards: CardData[]) => {
    setSearchResults(cards);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20 -z-10" />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div 
          ref={elementRef}
          className={cn(
            "max-w-3xl mx-auto text-center mb-16 transition-all duration-700",
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            YuGiOh Price Explorer
          </span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-foreground mb-6">
            Find the market value of any YuGiOh card
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simple tool to extract prices from various marketplaces using the YGOProDeck API.
          </p>
        </div>
        
        {/* Search component */}
        <CardSearch onResults={handleSearchResults} className="mb-16" />
        
        {/* Results */}
        {hasSearched && (
          <div className="mt-8">
            {searchResults.length > 0 ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-medium">
                    Found {searchResults.length} card{searchResults.length !== 1 ? 's' : ''}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((card, index) => (
                    <CardResult 
                      key={`${card.id}-${index}`} 
                      card={card} 
                      index={index}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 glass-card rounded-2xl animate-fade-in">
                <h2 className="text-2xl font-display font-medium mb-2">No cards found</h2>
                <p className="text-muted-foreground">
                  Try searching for another card name
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Empty state */}
        {!hasSearched && (
          <div className="text-center py-16 glass-card rounded-2xl mt-12 animate-fade-in">
            <h2 className="text-2xl font-display font-medium mb-2">Get started</h2>
            <p className="text-muted-foreground">
              Search for a card above to see pricing information
            </p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p>Built with YGOProDeck API • Data refreshed daily</p>
          <p className="mt-2">
            All Yu-Gi-Oh! cards and artwork © Konami Digital Entertainment
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
