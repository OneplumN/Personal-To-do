import { getDatabase } from "./db";
import type { Project } from "../../types/project";

export const projectRepository = {
  async delete(projectId: string) {
    const db = await getDatabase();
    await db.delete("projects", projectId);
  },

  async get(projectId: string) {
    const db = await getDatabase();
    return db.get("projects", projectId);
  },

  async list() {
    const db = await getDatabase();
    const projects = await db.getAll("projects");
    return projects.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  },

  async save(project: Project) {
    const db = await getDatabase();
    await db.put("projects", project);
    return project;
  },
};
