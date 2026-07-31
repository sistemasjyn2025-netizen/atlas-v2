// Formatters for ATLAS UI

export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatWeight = (valueKg: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'kilogram',
    maximumFractionDigits: 1,
  }).format(valueKg);
};

export const formatLength = (valueMm: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'millimeter',
    maximumFractionDigits: 0,
  }).format(valueMm);
};

export const formatArea = (valueM2: number): string => {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(valueM2)} m²`;
};

export const formatVolume = (valueM3: number): string => {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(valueM3)} m³`;
};

export const formatStress = (valuePa: number): string => {
  const MPa = valuePa / 1e6;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(MPa)} MPa`;
};

export const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatLargeNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
};
