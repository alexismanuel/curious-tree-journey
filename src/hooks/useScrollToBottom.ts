import { useCallback } from 'react';

export const useScrollToBottom = () => {
  const scrollToBottom = useCallback(() => {
    // Small delay to ensure the keyboard is open
    setTimeout(() => {
      // Try different scroll methods
      const scrollMethods = [
        // Method 1: window.scrollTo with smooth behavior
        () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }),
        // Method 2: window.scroll
        () => window.scroll(0, document.documentElement.scrollHeight),
        // Method 3: body scroll
        () => document.body.scrollIntoView({ behavior: 'smooth', block: 'end' }),
        // Method 4: documentElement scroll
        () => document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' }),
        // Method 5: Fallback - force scroll with JavaScript animation
        () => {
          const scrollHeight = Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
          );
          const start = window.pageYOffset;
          const target = scrollHeight;
          const duration = 300;
          const startTime = performance.now();

          const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeInOutQuad = (t: number) => {
              return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            };

            const currentPosition = start + (target - start) * easeInOutQuad(progress);
            window.scrollTo(0, currentPosition);

            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);
        }
      ];

      // Try each method until one works
      for (const method of scrollMethods) {
        try {
          method();
          // If the method executes without error, we can break
          break;
        } catch (error) {
          console.warn('Scroll method failed, trying next method:', error);
          // Continue to next method
          continue;
        }
      }
    }, 100);
  }, []);

  return scrollToBottom;
};
