#!/usr/bin/env node
import { Command } from 'commander';
import { AtlasAPI } from '@atlas/api';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('atlas')
  .description('ATLAS Engineering Automation Platform CLI')
  .version('0.1.0');

// PROJECT COMMANDS
const projectCmd = program.command('project').description('Project management commands');

projectCmd
  .command('create')
  .description('Create a sample project JSON file')
  .action(() => {
    const sample = {
      version: '1.0',
      metadata: {
        name: 'Sample Industrial Building',
        description: 'Auto-generated sample'
      },
      building: {
        width: 50000,
        length: 70000,
        height: 8000,
        baySpacing: 5000,
        roofType: 'gable',
        roofSlope: 10,
        structuralProfile: 'IPN200',
        frontGates: 3,
        rearGates: 3,
        sideGates: 1
      }
    };
    fs.writeFileSync('sample-project.json', JSON.stringify(sample, null, 2));
    console.log('Created sample-project.json');
  });

projectCmd
  .command('validate <file>')
  .description('Validate a project JSON file')
  .action((file: string) => {
    try {
      AtlasAPI.loadAndValidate(path.resolve(file));
      console.log('Project file is valid.');
    } catch (e: any) {
      console.error(`Validation failed: ${e.message}`);
      process.exit(1);
    }
  });

projectCmd
  .command('build <file>')
  .description('Run the full ATLAS pipeline on a project file')
  .action(async (file: string) => {
    const result = await AtlasAPI.executeProject(path.resolve(file));
    if (result.success) {
      console.log('Build successful!');
      console.log('Summary:', JSON.stringify(result.summary, null, 2));
    } else {
      console.error('Build failed:');
      console.error(result.errors?.join('\n'));
      process.exit(1);
    }
  });

// MANUFACTURING COMMANDS
const mfgCmd = program.command('manufacturing').description('Manufacturing commands');

mfgCmd
  .command('bom <file>')
  .description('Generate BOM from a project file')
  .action(async (file: string) => {
    const result = await AtlasAPI.executeProject(path.resolve(file));
    if (result.success) {
      console.log('BOM Generated:');
      console.log(JSON.stringify(result.bom, null, 2));
    } else {
      console.error('Failed to generate BOM');
      process.exit(1);
    }
  });

mfgCmd
  .command('parts <file>')
  .description('List manufacturing parts extracted')
  .action(async (file: string) => {
    const result = await AtlasAPI.executeProject(path.resolve(file));
    if (result.success) {
      console.log(`Extracted ${result.summary.totalManufacturingParts} parts.`);
    } else {
      console.error('Failed to extract parts');
      process.exit(1);
    }
  });

// DOCUMENTS COMMANDS
const docCmd = program.command('documents').description('Document commands');

docCmd
  .command('build <file>')
  .description('Generate documents for a project file')
  .action(async (file: string) => {
    const result = await AtlasAPI.executeProject(path.resolve(file));
    if (result.success) {
      console.log(`Generated ${result.summary.totalDocuments} documents.`);
    } else {
      console.error('Failed to generate documents');
      process.exit(1);
    }
  });

// COST COMMANDS
const costCmd = program.command('cost').description('Cost estimation commands');

costCmd
  .command('quote <file>')
  .description('Generate cost quote from a project file')
  .action(async (file: string) => {
    const result = await AtlasAPI.executeProject(path.resolve(file));
    if (result.success && result.quote) {
      console.log('Quote Generated:');
      console.log(JSON.stringify(result.quote, null, 2));
    } else {
      console.error('Failed to generate quote');
      process.exit(1);
    }
  });

program.parse();
