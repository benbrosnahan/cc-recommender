import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CreditTier, SpendBucket } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDollars(amount: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function creditTierLabel(tier: CreditTier): string {
  const map: Record<CreditTier, string> = {
    none: 'No credit history',
    poor: 'Under 580',
    fair: '580–669',
    good: '670–739',
    excellent: '740+',
    unknown: 'Undisclosed',
  };
  return map[tier];
}

export function spendBucketLabel(bucket: SpendBucket): string {
  const map: Record<SpendBucket, string> = {
    under_500: 'Under $500/mo',
    '500_1000': '$500–$1,000/mo',
    '1000_2000': '$1,000–$2,000/mo',
    over_2000: 'Over $2,000/mo',
  };
  return map[bucket];
}

export function spendBucketMonthlyMidpoint(bucket: SpendBucket): number {
  const map: Record<SpendBucket, number> = {
    under_500: 300,
    '500_1000': 750,
    '1000_2000': 1500,
    over_2000: 2500,
  };
  return map[bucket];
}
