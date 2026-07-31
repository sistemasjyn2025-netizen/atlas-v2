/**
 * AtlasDatabase — PrismaClient connection manager.
 *
 * Separating the import here allows tests to inject a mock via setAtlasDatabase()
 * without ever importing the real @prisma/client (which requires generated types
 * and a live DATABASE_URL at import time in some environments).
 */

// We use dynamic require so Jest can mock this module without generating the client.
// eslint-disable-next-line @typescript-eslint/no-var-requires
let PrismaClientClass: any = null;
function getPrismaClientClass() {
  if (!PrismaClientClass) {
    PrismaClientClass = require('@prisma/client').PrismaClient;
  }
  return PrismaClientClass;
}

let prismaInstance: any = null;

export function getAtlasDatabase(): any {
  if (!prismaInstance) {
    const PrismaClient = getPrismaClientClass();
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    });
  }
  return prismaInstance;
}

export async function disconnectAtlasDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

/** For testing: inject a custom client (e.g. a Prisma mock). */
export function setAtlasDatabase(client: any): void {
  prismaInstance = client;
}
