import { Quantity } from './Quantity';

export interface FormatOptions {
  decimals?: number;
  useGrouping?: boolean; // e.g. 1,000.5
}

export class QuantityFormatter {
  public static format(quantity: Quantity<any>, options?: FormatOptions): string {
    const decimals = options?.decimals !== undefined ? options.decimals : 3;
    const useGrouping = options?.useGrouping !== undefined ? options.useGrouping : true;

    // Use Intl.NumberFormat for proper internationalization
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
      useGrouping: useGrouping
    });

    const formattedValue = formatter.format(quantity.value);
    
    return `${formattedValue} ${quantity.unit.symbol}`;
  }
}
