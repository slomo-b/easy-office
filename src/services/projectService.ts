import { ProjectData } from '../types';
import * as fileSystem from './fileSystem';

const PROJECTS_DIR = 'projects';

export const DEFAULT_PROJECT_DATA: Omit<ProjectData, 'id'> = {
  name: '',
  description: '',
  customerId: '',
  status: 'open',
  tasks: [],
  createdAt: new Date().toISOString(),
};

export const getProjects = async (): Promise<ProjectData[]> => {
  try {
    const fileNames = await fileSystem.readDirectory(PROJECTS_DIR);
    const projects = await Promise.all(
      fileNames.map(async (fileName) => {
        const project = await fileSystem.readFile<ProjectData>(`${PROJECTS_DIR}/${fileName}`);
        // Backwards compatibility: Ensure older projects have a 'tasks' array.
        if (!project.tasks) {
          project.tasks = [];
        }
        return project;
      })
    );
    return projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error reading projects from file system', error);
    return [];
  }
};

export const getProjectById = async (id: string): Promise<ProjectData | undefined> => {
  try {
    const project = await fileSystem.readFile<ProjectData>(`${PROJECTS_DIR}/${id}.json`);
    // Backwards compatibility: Ensure older projects have a 'tasks' array.
    if (project && !project.tasks) {
      project.tasks = [];
    }
    return project;
  } catch (error) {
    console.error(`Error reading project ${id} from file system`, error);
    return undefined;
  }
};

export const saveProject = async (project: ProjectData): Promise<ProjectData> => {
   try {
    await fileSystem.writeFile(`${PROJECTS_DIR}/${project.id}.json`, project);
  } catch (error) {
    console.error('Error saving project to file system', error);
    throw error;
  }
  return project;
};

export const createNewProject = (): ProjectData => {
  return {
    id: `proj_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    ...DEFAULT_PROJECT_DATA,
    createdAt: new Date().toISOString(),
  };
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await fileSystem.deleteFile(`${PROJECTS_DIR}/${id}.json`);
  } catch (error) {
    console.error('Error deleting project from file system', error);
    throw error;
  }
};
