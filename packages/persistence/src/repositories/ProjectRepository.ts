import { getAtlasDatabase } from '../AtlasDatabase';

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export class ProjectRepository {
  private db: any;

  constructor(db?: any) {
    this.db = db ?? getAtlasDatabase();
  }

  async createProject(input: CreateProjectInput) {
    return this.db.project.create({
      data: {
        name: input.name,
        description: input.description
      }
    });
  }

  async findProjectById(id: string) {
    return this.db.project.findUnique({
      where: { id },
      include: {
        revisions: {
          orderBy: { revisionNumber: 'desc' },
          take: 1
        }
      }
    });
  }

  async listProjects() {
    return this.db.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        revisions: {
          orderBy: { revisionNumber: 'desc' },
          take: 1,
          select: { revisionNumber: true, createdAt: true, description: true }
        }
      }
    });
  }

  async deleteProject(id: string) {
    return this.db.project.delete({ where: { id } });
  }

  async logAudit(projectId: string, action: string, payload?: object) {
    return this.db.auditLog.create({
      data: { projectId, action, payload: payload ?? null }
    });
  }
}
