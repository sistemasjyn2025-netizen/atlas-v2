# ATLAS Architecture

ATLAS is built on a highly modular and decoupled architecture to serve as a professional Structural Design Platform (SDP). 

## Core Principles
1. **Single Source of Truth:** Everything derives from a central, paramaterized graph representation.
2. **Decoupled Engines:** Functional components (rendering, rules, geometry) are isolated and rely on the Atlas Kernel.
3. **Graph-Oriented Data Model:** Entities have semantic relations (Assemblies contain Components, which use Elements, defined by Geometries and Materials).

## Core Modules

### 1. Atlas Kernel (`@atlas/kernel`)
The heart of the application. It has zero external framework dependencies (like NestJS or React) and focuses solely on:
- Managing the lifecycle of `Project` and other structural entities.
- Traversing and manipulating the entity graph.
- Ensuring serialization and deserialization from/to the `.atlas` format.

### 2. Geometry Core & Engine (`@atlas/geometry-core`, `@atlas/geometry-engine`)
Geometry is treated as a first-class citizen. 
- `geometry-core` contains abstract representations and data structures.
- `geometry-engine` performs calculations and resolves 3D coordinates from parametric inputs.

### 3. Rules Engine (`@atlas/rules-engine`)
An isolated layer evaluating structural, normative, or business rules (e.g., "If span > 25m, recommend a truss").

### 4. Material & Document Engines (`@atlas/material-engine`, `@atlas/document-engine`)
- `material-engine` manages libraries of sections, grades, and their structural properties.
- `document-engine` translates the 3D/graph model into 2D CAD artifacts, Bill of Materials, and calculation reports.

## The `.atlas` Format
A JSON-based format storing the parameters, entities, and graph relations. 

Example:
```json
{
  "metadata": {
    "formatVersion": "0.1",
    "atlasVersion": "0.1"
  },
  "graph": {
    "projects": {
      "uuid-1234": {
         "id": "uuid-1234",
         "type": "Project",
         "name": "Industrial Warehouse",
         "version": 1
      }
    }
  },
  "parameters": {}
}
```
