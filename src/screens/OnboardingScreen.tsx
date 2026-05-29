import React from 'react';
import { OnboardingQuestionnaire } from './OnboardingQuestionnaire';
import { Screen } from '../types';

interface OnboardingScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate }) => {
  return <OnboardingQuestionnaire onNavigate={onNavigate} />;
};
