/**
 * Bargain Loading Skeleton
 * Shows loading state only for first /session/start (subsequent rounds are instant)
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface BargainLoadingSkeletonProps {
  stage?: "initializing" | "analyzing" | "calculating" | "finalizing";
}

export function BargainLoadingSkeleton({
  stage = "initializing",
}: BargainLoadingSkeletonProps) {
  const stages = {
    initializing: {
      title: "Initializing AI Session",
      description: "Setting up your personalized bargaining environment...",
      progress: 25,
    },
    analyzing: {
      title: "Analyzing Market Data",
      description: "Checking real-time prices and demand patterns...",
      progress: 50,
    },
    calculating: {
      title: "Calculating Optimal Offer",
      description: "AI is determining the best starting price for you...",
      progress: 75,
    },
    finalizing: {
      title: "Finalizing Session",
      description: "Preparing your bargaining interface...",
      progress: 90,
    },
  };

  const currentStage = stages[stage];

  return (
    <div className="space-y-6 py-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-lg">AI</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {currentStage.title}
          </h3>
          <p className="text-sm text-gray-600">{currentStage.description}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${currentStage.progress}%` }}
        ></div>
      </div>

      {/* Product Info Skeleton */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="w-20 h-3 bg-blue-300 rounded animate-pulse"></div>
              </div>
              <div className="w-16 h-4 bg-blue-300 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-300 rounded-full animate-pulse"></div>
                <div className="w-24 h-3 bg-green-300 rounded animate-pulse"></div>
              </div>
              <div className="w-20 h-4 bg-green-300 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-300 rounded-full animate-pulse"></div>
                <div className="w-18 h-3 bg-purple-300 rounded animate-pulse"></div>
              </div>
              <div className="w-14 h-4 bg-purple-300 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading Messages */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <p className="text-xs text-gray-500">
          This may take a few seconds on first load
        </p>
      </div>
    </div>
  );
}

// Rotating stage component for dynamic loading
export function RotatingBargainSkeleton() {
  const [currentStage, setCurrentStage] = React.useState<
    "initializing" | "analyzing" | "calculating" | "finalizing"
  >("initializing");

  React.useEffect(() => {
    const stages: Array<
      "initializing" | "analyzing" | "calculating" | "finalizing"
    > = ["initializing", "analyzing", "calculating", "finalizing"];

    let stageIndex = 0;
    const interval = setInterval(() => {
      stageIndex = (stageIndex + 1) % stages.length;
      setCurrentStage(stages[stageIndex]);
    }, 1500); // Change stage every 1.5 seconds

    return () => clearInterval(interval);
  }, []);

  return <BargainLoadingSkeleton stage={currentStage} />;
}

export default BargainLoadingSkeleton;
