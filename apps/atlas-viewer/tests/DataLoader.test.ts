import { DataLoader } from '../../src/utils/DataLoader';

describe('DataLoader', () => {
  it('should load golden dataset', () => {
    try {
      const result = DataLoader.loadGoldenDataset();
      expect(result).toBeDefined();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  });
});
