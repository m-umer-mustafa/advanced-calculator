import React, { useEffect, useRef } from 'react';
import { evaluate } from 'mathjs';
import { useTheme } from './ThemeProvider';

// Dynamic import for Plotly to avoid SSR issues
const loadPlotly = async () => {
  const Plotly = await import('plotly.js-dist-min'); // smaller dist build, optional
  return Plotly;
};

interface GraphPlotterProps {
  expression: string;
  variable?: string;
  range?: [number, number];
  className?: string;
}

export const GraphPlotter = ({
  expression,
  variable = 'x',
  range = [-10, 10],
  className = ''
}: GraphPlotterProps) => {
  const plotRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!plotRef.current || !expression) return;

    const plotGraph = async () => {
      try {
        const Plotly = await loadPlotly();

        // Clean up previous plot if any
        Plotly.purge(plotRef.current);

        const step = (range[1] - range[0]) / 500;
        const xValues: number[] = [];
        const yValues: number[] = [];

        for (let x = range[0]; x <= range[1]; x += step) {
          try {
            // Use mathjs evaluate with scope instead of string replacement
            const y = evaluate(expression, { [variable]: x });

            if (typeof y === 'number' && isFinite(y)) {
              xValues.push(x);
              yValues.push(y);
            }
          } catch {
            // Skip invalid points
          }
        }

        if (xValues.length === 0) return;

        const trace = {
          x: xValues,
          y: yValues,
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: `y = ${expression}`,
          line: {
            color: 'hsl(142, 70%, 45%)',
            width: 3
          }
        };

        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        const layout = {
          title: {
            text: `Graph of y = ${expression}`,
            font: { color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 84%, 5%)' }
          },
          paper_bgcolor: isDark ? 'hsl(224, 20%, 9%)' : 'hsl(210, 40%, 98%)',
          plot_bgcolor: isDark ? 'hsl(217, 32%, 12%)' : 'hsl(210, 40%, 95%)',
          font: { color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 84%, 5%)' },
          xaxis: {
            title: { text: variable },
            gridcolor: isDark ? 'hsl(217, 32%, 17%)' : 'hsl(214, 32%, 91%)',
            zerolinecolor: 'hsl(142, 70%, 45%)',
            color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 84%, 5%)'
          },
          yaxis: {
            title: { text: 'y' },
            gridcolor: isDark ? 'hsl(217, 32%, 17%)' : 'hsl(214, 32%, 91%)',
            zerolinecolor: 'hsl(142, 70%, 45%)',
            color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 84%, 5%)'
          },
          margin: { t: 50, r: 20, b: 50, l: 50 }
        };

        const config = {
          responsive: true,
          displayModeBar: false
        };

        await Plotly.newPlot(plotRef.current, [trace], layout, config);
      } catch (error) {
        console.error('Error plotting graph:', error);
      }
    };

    plotGraph();

    // Cleanup on unmount or expression change
    return () => {
      if (plotRef.current) {
        loadPlotly().then((Plotly) => Plotly.purge(plotRef.current!));
      }
    };
  }, [expression, variable, range, theme]);

  if (!expression) {
    return (
      <div className={`${className} bg-calculator-display rounded-lg p-8 text-center`}>
        <p className="text-muted-foreground">Enter an expression with 'x' to see the graph</p>
        <p className="text-sm text-muted-foreground mt-2">
          Examples: x^2, sin(x), 2*x + 3
        </p>
      </div>
    );
  }

  return <div ref={plotRef} className={className} />;
};
