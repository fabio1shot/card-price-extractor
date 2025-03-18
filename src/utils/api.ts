
import { toast } from "@/components/ui/use-toast";

export interface CardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

export interface CardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

export interface CardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped?: string;
}

export interface CardData {
  id: number;
  name: string;
  type: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  archetype?: string;
  card_sets?: CardSet[];
  card_images: CardImage[];
  card_prices: CardPrice[];
}

export interface CardResponse {
  data: CardData[];
}

/**
 * Fetch card data by name
 */
export const fetchCardByName = async (cardName: string): Promise<CardData[]> => {
  try {
    if (!cardName.trim()) {
      return [];
    }
    
    const url = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data: CardResponse = await response.json();
    return data.data || [];
  } catch (error) {
    if ((error as Error).message.includes("404")) {
      toast({
        title: "Card not found",
        description: "No cards match your search criteria.",
        variant: "destructive",
      });
      return [];
    }
    
    toast({
      title: "Error fetching card data",
      description: (error as Error).message,
      variant: "destructive",
    });
    console.error("Error fetching card:", error);
    return [];
  }
};

/**
 * Fetch all card sets
 */
export const fetchCardSets = async () => {
  try {
    const response = await fetch("https://db.ygoprodeck.com/api/v7/cardsets.php");
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    toast({
      title: "Error fetching card sets",
      description: (error as Error).message,
      variant: "destructive",
    });
    console.error("Error fetching card sets:", error);
    return [];
  }
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numPrice);
};
