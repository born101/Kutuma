import type { OnboardingSlide } from '@/types';

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'dollar-sign',
    title: 'Welcome to Kutuma',
    subtitle: 'Zimbabwe\'s Task Marketplace',
    description:
      'Kutuma connects Zimbabweans who need help with trusted local runners ready to assist. Whether you need groceries delivered, documents picked up, or errands run - Kutuma makes it happen.',
    color: '#FF6B4A',
    iconBg: '#7C3F2F',
  },
  {
    id: '2',
    icon: 'message-circle',
    title: 'Post Your Task',
    subtitle: 'Need something done?',
    description:
      'Describe your task, set your budget, and let local runners bid. From grocery shopping to queue standing, document delivery to research - anything you need done.',
    color: '#06B6D4',
    iconBg: '#164E63',
  },
  {
    id: '3',
    icon: 'trending-up',
    title: 'Flexible Bidding',
    subtitle: 'You control the price',
    description:
      'Runners compete for your task with competitive bids. Review their profiles, ratings, and completed tasks. Choose who works for you at a price that works for you.',
    color: '#FBBF24',
    iconBg: '#713F12',
  },
  {
    id: '4',
    icon: 'shield',
    title: 'Safe & Trusted',
    subtitle: 'Built on reputation',
    description:
      'Every runner is verified with their phone number. Ratings and reviews keep everyone accountable. Payment is held securely until task completion. Your trust, our priority.',
    color: '#10B981',
    iconBg: '#064E3B',
  },
];
