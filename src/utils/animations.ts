
import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for handling image loading with blur effect
 */
export const useImageLoading = (src?: string): [boolean, string, React.RefObject<HTMLImageElement>] => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || '');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;
    
    setIsLoaded(false);
    setImageSrc(src);
    
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
    
    return () => {
      img.onload = null;
    };
  }, [src]);

  return [isLoaded, imageSrc, imageRef];
};

/**
 * Custom hook for element intersection observation (for animations)
 */
export const useIntersectionObserver = (options = {}, callback?: () => void) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      
      if (entry.isIntersecting && callback) {
        callback();
      }
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options, callback]);

  return { elementRef, isIntersecting };
};

/**
 * Generate staggered animation delay
 */
export const getStaggeredDelay = (index: number, baseDelay = 0.05): string => {
  return `${baseDelay * index}s`;
};
