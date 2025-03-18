import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { parseCSV, processCardNames, generateJsonFile } from '@/utils/fileUtils';
import { useIntersectionObserver } from '@/utils/animations';
import { Upload, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface CsvUploaderProps {
  className?: string;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ className }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px',
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if it's a CSV file
    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setFileName(file.name);
    
    // Read the file
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvContent = event.target?.result as string;
        const cardNames = parseCSV(csvContent);
        
        if (cardNames.length === 0) {
          toast({
            title: "Empty file",
            description: "The CSV file doesn't contain any card names",
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
        
        // Start processing
        setIsProcessing(true);
        setProcessingProgress(0);
        
        // Monitor progress
        const updateInterval = setInterval(() => {
          setProcessingProgress(prev => {
            const newValue = prev + (100 / cardNames.length / 10);
            return newValue > 99 ? 99 : newValue;
          });
        }, 100);
        
        // Process the card names
        const results = await processCardNames(cardNames);
        
        clearInterval(updateInterval);
        setProcessingProgress(100);
        
        // Generate the JSON file
        generateJsonFile(results);
        
      } catch (error) {
        console.error("Error processing CSV:", error);
        toast({
          title: "Error processing file",
          description: "Failed to process the CSV file",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        // Reset the file input
        e.target.value = '';
      }
    };
    
    reader.readAsText(file);
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
          Batch process cards from CSV
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Upload a CSV file with one card name per row to generate a JSON price report
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full">
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <Button 
              variant="outline" 
              disabled={isProcessing}
              className="w-full h-16 border-dashed border-2 flex flex-col gap-2 items-center justify-center"
            >
              <Upload size={20} />
              <span>{fileName || "Choose CSV file"}</span>
            </Button>
          </div>
          
          {isProcessing && (
            <div className="w-full space-y-2">
              <Progress value={processingProgress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Processing cards... {Math.round(processingProgress)}%
              </p>
            </div>
          )}
          
          <div className="text-sm mt-2 text-muted-foreground">
            <p>Format: One card name per row</p>
            <p className="text-xs mt-1">Example: "Blue-Eyes White Dragon"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploader;
