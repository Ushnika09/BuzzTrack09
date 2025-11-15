// client/src/hooks/useOnboarding.js
import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('buzztrack-onboarding-complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('buzztrack-onboarding-complete', 'true');
    setShowOnboarding(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return {
    showOnboarding,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    setShowOnboarding,
  };
}