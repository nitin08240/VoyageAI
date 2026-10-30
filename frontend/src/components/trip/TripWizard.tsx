import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { ICreateTripPayload } from '@/types/trip.types';

import Step1Destination from './steps/Step1Destination';
import Step2Dates from './steps/Step2Dates';
import Step3Travellers from './steps/Step3Travellers';
import Step4Budget from './steps/Step4Budget';
import Step5Interests from './steps/Step5Interests';
import Step6Accommodation from './steps/Step6Accommodation';
import Step7Transport from './steps/Step7Transport';
import Step8Food from './steps/Step8Food';
import Step9Additional from './steps/Step9Additional';
import TripSummary from './TripSummary';

const TOTAL_STEPS = 10; // 9 configuration steps + 1 summary step

const STEP_TITLES = [
  'Destination',
  'Dates',
  'Travelers',
  'Budget',
  'Interests',
  'Accommodation',
  'Transport',
  'Food & Dining',
  'Pacing & Details',
  'Final Review',
];

interface TripWizardProps {
  initialData?: Partial<ICreateTripPayload>;
  onSubmit: (data: ICreateTripPayload) => Promise<void>;
  isLoading?: boolean;
}

export const TripWizard: React.FC<TripWizardProps> = ({ onSubmit, isLoading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Today and 7 days from now defaults
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const returnStr = nextWeek.toISOString().split('T')[0];

  const [formData, setFormData] = useState<ICreateTripPayload>({
    destination: {
      country: '',
      city: '',
      startingLocation: '',
      additionalDestinations: [],
    },
    dates: {
      departureDate: todayStr,
      returnDate: returnStr,
      duration: 7,
      isFlexible: false,
    },
    travellers: {
      type: 'couple',
      adults: 2,
      children: 0,
    },
    budget: {
      amount: 3000,
      currency: 'USD',
      isPerPerson: false,
      category: 'comfort',
    },
    preferences: {
      interests: ['culture', 'food', 'nature'],
      accommodation: 'standard_hotel',
      transport: ['train', 'public_transit'],
      food: {
        diet: 'no_preference',
        restrictions: '',
      },
      additional: {
        accessibilityRequired: false,
        childrenOrElderly: false,
        activityIntensity: 'moderate',
        specialRequests: '',
        sightseeingPace: 'medium',
      },
    },
  });

  const validateCurrentStep = (): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!formData.destination.country.trim() || !formData.destination.city.trim()) {
        setErrorMsg('Please specify both country and city destination.');
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.dates.departureDate || !formData.dates.returnDate) {
        setErrorMsg('Please select valid departure and return dates.');
        return false;
      }
    }
    if (currentStep === 4) {
      if (!formData.budget.amount || formData.budget.amount < 50) {
        setErrorMsg('Please specify a valid budget amount.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize trip generation.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header with step progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          <span>Step {currentStep} of {TOTAL_STEPS}: {STEP_TITLES[currentStep - 1]}</span>
          <span className="text-accent-400">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
        </div>
        <ProgressBar progress={(currentStep / TOTAL_STEPS) * 100} />
      </div>

      {/* Main Form Body */}
      <div className="p-6 sm:p-10 rounded-3xl glass-card border border-white/10 shadow-2xl relative">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 1 && (
              <Step1Destination
                data={formData.destination}
                onChange={(up) => setFormData({ ...formData, destination: { ...formData.destination, ...up } })}
              />
            )}
            {currentStep === 2 && (
              <Step2Dates
                data={formData.dates}
                onChange={(up) => setFormData({ ...formData, dates: { ...formData.dates, ...up } })}
              />
            )}
            {currentStep === 3 && (
              <Step3Travellers
                data={formData.travellers}
                onChange={(up) => setFormData({ ...formData, travellers: { ...formData.travellers, ...up } })}
              />
            )}
            {currentStep === 4 && (
              <Step4Budget
                data={formData.budget}
                onChange={(up) => setFormData({ ...formData, budget: { ...formData.budget, ...up } })}
              />
            )}
            {currentStep === 5 && (
              <Step5Interests
                data={formData.preferences}
                onChange={(up) => setFormData({ ...formData, preferences: { ...formData.preferences, ...up } })}
              />
            )}
            {currentStep === 6 && (
              <Step6Accommodation
                data={formData.preferences}
                onChange={(up) => setFormData({ ...formData, preferences: { ...formData.preferences, ...up } })}
              />
            )}
            {currentStep === 7 && (
              <Step7Transport
                data={formData.preferences}
                onChange={(up) => setFormData({ ...formData, preferences: { ...formData.preferences, ...up } })}
              />
            )}
            {currentStep === 8 && (
              <Step8Food
                data={formData.preferences}
                onChange={(up) => setFormData({ ...formData, preferences: { ...formData.preferences, ...up } })}
              />
            )}
            {currentStep === 9 && (
              <Step9Additional
                data={formData.preferences}
                onChange={(up) => setFormData({ ...formData, preferences: { ...formData.preferences, ...up } })}
              />
            )}
            {currentStep === 10 && (
              <TripSummary
                data={formData}
                onGenerate={handleFinalSubmit}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard Footer Controls */}
        {currentStep < TOTAL_STEPS && (
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1}
              onClick={handlePrev}
              className="text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              className="text-xs font-semibold shadow-lg shadow-accent-500/20"
            >
              Continue <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripWizard;
