import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingProgressProps {
  onComplete?: () => void;
}

export default function LoadingProgress({ onComplete }: LoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 1, label: 'Scraping website', duration: 3000 },
    { id: 2, label: 'Analyzing content with AI', duration: 5000 },
    { id: 3, label: 'Generating research report', duration: 2000 },
  ];

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    let totalTime = 0;

    steps.forEach((step, index) => {
      totalTime += step.duration;
      const timer = setTimeout(() => {
        setCurrentStep(index + 1);
        if (index === steps.length - 1 && onComplete) {
          setTimeout(onComplete, 500);
        }
      }, totalTime);
      timers.push(timer);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Analyzing Your URL
        </h3>
        <p className="text-gray-400">
          This usually takes 15-30 seconds
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = currentStep > index;
          const isActive = currentStep === index + 1;
          const isPending = currentStep < index + 1;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                isActive
                  ? 'bg-purple-500/20 border border-purple-500/50'
                  : isComplete
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-gray-900/30 border border-gray-700/50'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isComplete
                    ? 'bg-green-500'
                    : isActive
                    ? 'bg-purple-500'
                    : 'bg-gray-700'
                }`}
              >
                {isComplete ? (
                  <Check className="w-5 h-5 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <span className="text-white text-sm">{step.id}</span>
                )}
              </div>

              <div className="flex-1">
                <div
                  className={`font-medium transition-colors duration-500 ${
                    isComplete
                      ? 'text-green-400'
                      : isActive
                      ? 'text-purple-300'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                  {isComplete && (
                    <span className="ml-2 text-xs text-green-500">✓ Complete</span>
                  )}
                  {isActive && (
                    <span className="ml-2 text-xs text-purple-400">In progress...</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentStep / steps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          🔥 FireCrawl + 🤖 Gemini AI working together
        </p>
      </div>
    </div>
  );
}