import { AtlasPipeline } from '../src/AtlasPipeline';
import { AtlasProjectFile } from '../src/types';

describe('AtlasPipeline Integration', () => {
  it('should successfully execute the full pipeline', () => {
    const pipeline = new AtlasPipeline();
    const projectFile: AtlasProjectFile = {
      version: '1.0',
      metadata: { name: 'Test' },
      building: {
        width: 10000,
        length: 20000,
        height: 5000,
        baySpacing: 5000,
        roofType: 'gable',
        roofSlope: 10,
        structuralProfile: 'IPN120'
      }
    };

    const result = pipeline.execute(projectFile);
    
    expect(result.success).toBe(true);
    expect(result.summary.totalAssemblies).toBeGreaterThan(0);
    expect(result.summary.totalManufacturingParts).toBeGreaterThan(0);
    expect(result.summary.totalDocuments).toBeGreaterThan(0);
    expect(result.bom).toBeDefined();
  });
});
