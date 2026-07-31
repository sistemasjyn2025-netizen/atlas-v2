import { Router, Request, Response } from 'express';
// @ts-ignore - Dependencias a instalar (Clerk y Prisma Client)
import { requireAuth } from '@clerk/express';
import { getAtlasDatabase } from '@atlas/persistence';

const router: Router = Router();
const prisma = getAtlasDatabase(); // Instancia de PrismaClient

/**
 * POST /api/projects
 * Guarda o actualiza un proyecto.
 * 
 * Requiere Auth (Clerk JWT middleware inyecta req.auth.userId)
 */
router.post('/', requireAuth(), async (req: Request, res: Response) => {
  try {
    // 1. Clerk inyecta el userId verificado en req.auth
    const { userId } = (req as any).auth;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Lazy sync del usuario a la base de datos para satisfacer la foreign key
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@clerk.placeholder.com`,
        name: 'Clerk User'
      }
    });

    // 2. Extraemos el payload
    const { id, name, description, inputData } = req.body;

    // 2.5 Sanitización estricta del payload (Defensa profunda)
    if (typeof req.body !== 'object' || req.body === null) {
      return res.status(400).json({ error: 'Bad Request: Invalid JSON payload' });
    }

    if (inputData) {
      const { width, length, height, roofSlope, baySpacing } = inputData;
      if (
        (width !== undefined && typeof width !== 'number') ||
        (length !== undefined && typeof length !== 'number') ||
        (height !== undefined && typeof height !== 'number') ||
        (roofSlope !== undefined && typeof roofSlope !== 'number') ||
        (baySpacing !== undefined && typeof baySpacing !== 'number')
      ) {
        return res.status(400).json({ error: 'Bad Request: Dimensions must be strictly numeric' });
      }
    }

    // 3. Upsert en Prisma (Actualiza si id existe, crea si no)
    const project = await prisma.project.upsert({
      where: {
        id: id || '00000000-0000-0000-0000-000000000000' // ID ficticio para forzar la creación si no viene
      },
      update: {
        name,
        description,
        inputData,
        updatedAt: new Date()
      },
      create: {
        // Si no viene ID en el body, Prisma usa el @default(uuid())
        ...(id ? { id } : {}), 
        name: name || 'Proyecto Sin Nombre',
        description,
        inputData,
        userId: userId // Vinculamos el proyecto al usuario autenticado
      }
    });

    // 4. Retornamos el ID generado o actualizado para que el Frontend redirija
    return res.status(200).json({
      success: true,
      projectId: project.id,
      message: 'Proyecto guardado correctamente.'
    });

  } catch (error) {
    console.error('Error saving project:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', requireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).auth;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const projects = await prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', requireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).auth;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });

    if (!project) return res.status(404).json({ error: 'Not found' });
    if (project.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    return res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
