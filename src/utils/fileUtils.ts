
/**
 * Utilities for handling file operations in the YuGiOh Price Extractor
 */

import { CardData, fetchCardByName } from "./api";
import { toast } from "@/components/ui/use-toast";

/**
 * Parse a CSV file and extract card names from each row
 */
export const parseCSV = (fileContent: string): string[] => {
  // Split by newlines and filter out empty rows
  const rows = fileContent
    .split("\n")
    .map(row => row.trim())
    .filter(row => row.length > 0);
  
  return rows;
};

/**
 * Process a list of card names and fetch their data
 */
export const processCardNames = async (cardNames: string[]): Promise<Array<{card_name: string, price: string}>> => {
  const results: Array<{card_name: string, price: string}> = [];
  let successCount = 0;
  let errorCount = 0;
  
  // Process cards one by one to avoid rate limiting
  for (let i = 0; i < cardNames.length; i++) {
    const cardName = cardNames[i].trim();
    if (!cardName) continue;
    
    try {
      // Fetch card data
      const cardData = await fetchCardByName(cardName);
      
      if (cardData.length > 0) {
        // Get the price from TCGPlayer (can be customized to use different price sources)
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
    
    // Update progress every 5 cards
    if (i % 5 === 0 || i === cardNames.length - 1) {
      toast({
        title: "Processing cards",
        description: `Processed ${i + 1} of ${cardNames.length} cards`,
      });
    }
  }
  
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
  
  return results;
};

/**
 * Generate and download a JSON file from card data
 */
export const generateJsonFile = (data: Array<{card_name: string, price: string}>): void => {
  // Convert data to JSON string
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = `yugioh-prices-${new Date().toISOString().split("T")[0]}.json`;
  
  // Append the link to the body, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the URL to free memory
  URL.revokeObjectURL(url);
  
  toast({
    title: "JSON file generated",
    description: "Your price data has been downloaded as a JSON file",
  });
};

