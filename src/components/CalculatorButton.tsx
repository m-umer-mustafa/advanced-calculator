import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalculatorButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'function' | 'equals';
  className?: string;
  disabled?: boolean;
}

export const CalculatorButton = ({ 
  children, 
  onClick, 
  variant = 'number', 
  className,
  disabled = false 
}: CalculatorButtonProps) => {
  const variantStyles = {
    number: "bg-calculator-button hover:bg-calculator-button-hover text-calculator-number border-calculator-button",
    operator: "bg-calculator-operator hover:bg-calculator-operator/80 text-primary-foreground border-calculator-operator",
    function: "bg-calculator-function hover:bg-calculator-function/80 text-accent-foreground border-calculator-function",
    equals: "bg-gradient-primary hover:opacity-90 text-primary-foreground border-primary animate-glow"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-12 text-lg font-semibold border transition-all duration-200 hover:scale-105 active:scale-95",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </Button>
  );
};