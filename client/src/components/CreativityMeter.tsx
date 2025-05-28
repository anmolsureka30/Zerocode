import React from 'react';
import { Sparkles, Zap, Scale, Shield, Trophy } from 'lucide-react';
import { CreativityMetrics } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreativityMeterProps {
  metrics?: CreativityMetrics;
  isLoading?: boolean;
  className?: string;
}

export default function CreativityMeter({ metrics, isLoading = false, className }: CreativityMeterProps) {
  // If metrics aren't provided yet or we're loading, show loading state
  if (isLoading || !metrics) {
    return (
      <Card className={cn("w-full shadow-md", className)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>Code Creativity</span>
            </CardTitle>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">Analyzing...</span>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="space-y-5 pb-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-1 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                </div>
                <Progress value={0} className="h-2 bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-purple-500 dark:text-purple-400";
    if (score >= 75) return "text-blue-500 dark:text-blue-400";
    if (score >= 60) return "text-emerald-500 dark:text-emerald-400";
    if (score >= 40) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
  };

  // Helper to get progress color based on score
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-purple-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-emerald-500"; 
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Helper to get the innovation level text
  const getInnovationLevel = (score: number) => {
    if (score >= 90) return "Groundbreaking";
    if (score >= 80) return "Innovative";
    if (score >= 70) return "Advanced";
    if (score >= 60) return "Creative";
    if (score >= 50) return "Solid";
    if (score >= 40) return "Standard";
    return "Basic";
  };

  // Define tooltips for each metric
  const metricDescriptions = {
    novelty: "How original and unique the approaches and patterns in the code are",
    usefulness: "How practical and functional the implementation is for solving the intended problem",
    elegance: "How well-organized, efficient, and aesthetically pleasing the code is",
    robustness: "How well the code handles edge cases and potential issues"
  };

  return (
    <Card className={cn("w-full shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className={cn("h-5 w-5", getScoreColor(metrics.score))} />
            <span>Code Creativity</span>
          </CardTitle>
          <span 
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full",
              metrics.score >= 75 ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
              metrics.score >= 60 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            {getInnovationLevel(metrics.score)}
          </span>
        </div>
        <CardDescription className="text-xs mt-1">{metrics.description}</CardDescription>
      </CardHeader>
      <CardContent className="py-3">
        {/* Overall creativity score */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={cn("text-sm font-bold", getScoreColor(metrics.score))}>
              {metrics.score}/100
            </span>
          </div>
          <Progress 
            value={metrics.score} 
            className={cn("h-2.5", getProgressColor(metrics.score))} 
          />
        </div>

        {/* Individual metrics */}
        <div className="space-y-3">
          <TooltipProvider>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium flex items-center gap-1 cursor-help">
                      <Zap className="h-3.5 w-3.5" /> Novelty
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60">{metricDescriptions.novelty}</p>
                  </TooltipContent>
                </Tooltip>
                <span className={cn("text-xs font-medium", getScoreColor(metrics.novelty))}>{metrics.novelty}%</span>
              </div>
              <Progress value={metrics.novelty} className={cn("h-1.5", getProgressColor(metrics.novelty))} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium flex items-center gap-1 cursor-help">
                      <Trophy className="h-3.5 w-3.5" /> Usefulness
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60">{metricDescriptions.usefulness}</p>
                  </TooltipContent>
                </Tooltip>
                <span className={cn("text-xs font-medium", getScoreColor(metrics.usefulness))}>{metrics.usefulness}%</span>
              </div>
              <Progress value={metrics.usefulness} className={cn("h-1.5", getProgressColor(metrics.usefulness))} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium flex items-center gap-1 cursor-help">
                      <Scale className="h-3.5 w-3.5" /> Elegance
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60">{metricDescriptions.elegance}</p>
                  </TooltipContent>
                </Tooltip>
                <span className={cn("text-xs font-medium", getScoreColor(metrics.elegance))}>{metrics.elegance}%</span>
              </div>
              <Progress value={metrics.elegance} className={cn("h-1.5", getProgressColor(metrics.elegance))} />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-medium flex items-center gap-1 cursor-help">
                      <Shield className="h-3.5 w-3.5" /> Robustness
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="w-60">{metricDescriptions.robustness}</p>
                  </TooltipContent>
                </Tooltip>
                <span className={cn("text-xs font-medium", getScoreColor(metrics.robustness))}>{metrics.robustness}%</span>
              </div>
              <Progress value={metrics.robustness} className={cn("h-1.5", getProgressColor(metrics.robustness))} />
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}