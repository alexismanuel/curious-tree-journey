import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

export const ProgressDots = ({ totalSteps, currentStep, className }: ProgressDotsProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "rounded-full transition-all duration-200",
            index === currentStep - 1
              ? "w-3 h-3 bg-foreground"
              : "w-2 h-2 bg-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};
