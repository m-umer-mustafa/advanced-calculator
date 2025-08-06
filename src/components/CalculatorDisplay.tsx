import { cn } from "@/lib/utils";

interface CalculatorDisplayProps {
  expression: string;
  result: string;
  error?: string;
  suggestion?: string;
  className?: string;
}

export const CalculatorDisplay = ({ 
  expression, 
  result, 
  error, 
  suggestion, 
  className 
}: CalculatorDisplayProps) => {
  return (
    <div className={cn(
      "bg-calculator-display rounded-lg p-4 border border-border space-y-2",
      className
    )}>
      {/* Expression Input */}
      <div className="text-right text-sm text-muted-foreground font-mono min-h-6">
        {expression || "Enter an expression..."}
      </div>
      
      {/* Result or Error */}
      <div className="text-right text-2xl font-bold font-mono min-h-8">
        {error ? (
          <span className="text-destructive text-lg">{error}</span>
        ) : (
          <span className="text-foreground">{result || "0"}</span>
        )}
      </div>
      
      {/* AI Suggestion */}
      {suggestion && !error && (
        <div className="text-left text-xs text-calculator-function bg-calculator-function/10 p-2 rounded border-l-2 border-calculator-function">
          💡 {suggestion}
        </div>
      )}
    </div>
  );
};