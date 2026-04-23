import { create } from "zustand";
import { projectRepository } from "../../lib/storage/projectRepository";
import {
  createProject,
  type Project,
  type ProjectCreateInput,
} from "../../types/project";

type ProjectState = {
  createProject: (input: ProjectCreateInput) => Promise<Project>;
  isLoaded: boolean;
  loadProjects: () => Promise<Project[]>;
  projects: Project[];
  updateProject: (
    projectId: string,
    update: Partial<Omit<Project, "createdAt" | "id">>,
  ) => Promise<Project | null>;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  async createProject(input) {
    const project = createProject(input);
    await projectRepository.save(project);
    set({ projects: [project, ...get().projects] });
    return project;
  },
  isLoaded: false,
  async loadProjects() {
    const projects = await projectRepository.list();
    set({ isLoaded: true, projects });
    return projects;
  },
  projects: [],
  async updateProject(projectId, update) {
    const current = get().projects.find((project) => project.id === projectId);

    if (!current) {
      return null;
    }

    const nextProject: Project = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    await projectRepository.save(nextProject);
    set({
      projects: get().projects.map((project) =>
        project.id === projectId ? nextProject : project,
      ),
    });
    return nextProject;
  },
}));
