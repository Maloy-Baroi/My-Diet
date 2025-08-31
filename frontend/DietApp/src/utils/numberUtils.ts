export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatWeight = (weight: number, unit: 'kg' | 'lbs' = 'kg'): string => {
  if (unit === 'lbs') {
    return `${formatNumber(weight * 2.20462, 1)} lbs`;
  }
  return `${formatNumber(weight, 1)} kg`;
};

export const formatHeight = (height: number, unit: 'cm' | 'ft' = 'cm'): string => {
  if (unit === 'ft') {
    const feet = Math.floor(height / 30.48);
    const inches = Math.round((height % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(height)} cm`;
};

export const formatCalories = (calories: number): string => {
  return `${Math.round(calories)} cal`;
};

export const formatMacros = (grams: number, unit: string = 'g'): string => {
  return `${formatNumber(grams, 1)}${unit}`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const roundToNearest = (num: number, nearest: number): number => {
  return Math.round(num / nearest) * nearest;
};

export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
};
