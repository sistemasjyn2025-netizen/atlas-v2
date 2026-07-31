import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('CLI End-to-End', () => {
  const cliPath = path.resolve(__dirname, '../dist/cli.js');
  const tempProject = path.resolve(__dirname, 'temp-project.json');

  beforeAll(() => {
    // Compile CLI first? we assume turbo built it, but just in case, we test the script with ts-node if we can't find dist, or we test node dist/cli.js
    // For now we will just use the pre-built dist
  });

  afterAll(() => {
    if (fs.existsSync(tempProject)) {
      fs.unlinkSync(tempProject);
    }
    if (fs.existsSync('sample-project.json')) {
      fs.unlinkSync('sample-project.json');
    }
  });

  it('should generate a sample project file', () => {
    const output = execSync(`node ${cliPath} project create`).toString();
    expect(output).toContain('Created sample-project.json');
    expect(fs.existsSync('sample-project.json')).toBe(true);
  });

  it('should validate the sample project', () => {
    const output = execSync(`node ${cliPath} project validate sample-project.json`).toString();
    expect(output).toContain('Project file is valid.');
  });

  it('should run full build', () => {
    const output = execSync(`node ${cliPath} project build sample-project.json`).toString();
    expect(output).toContain('Build successful!');
    expect(output).toContain('totalAssemblies');
  });
});
