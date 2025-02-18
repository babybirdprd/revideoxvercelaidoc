import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
	id: string;
	name: string;
	sceneData: {
		repoName: string;
		repoImage: string;
		data: number[];
	};
	createdAt: string;
	updatedAt: string;
	previewUrl?: string;
}

interface ProjectState {
	projects: Project[];
	currentProject: Project | null;
	addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
	setCurrentProject: (project: Project) => void;
	updateProject: (id: string, updates: Partial<Project>) => void;
	deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
	persist(
		(set) => ({
			projects: [],
			currentProject: null,
			addProject: (project) => {
				const now = new Date().toISOString();
				const newProject = {
					...project,
					id: crypto.randomUUID(),
					createdAt: now,
					updatedAt: now,
				};
				set((state) => ({
					projects: [...state.projects, newProject],
					currentProject: newProject,
				}));
			},
			setCurrentProject: (project) =>
				set(() => ({ currentProject: project })),
			updateProject: (id, updates) =>
				set((state) => ({
					projects: state.projects.map((p) =>
						p.id === id
							? { ...p, ...updates, updatedAt: new Date().toISOString() }
							: p
					),
					currentProject:
						state.currentProject?.id === id
							? { ...state.currentProject, ...updates }
							: state.currentProject,
				})),
			deleteProject: (id) =>
				set((state) => ({
					projects: state.projects.filter((p) => p.id !== id),
					currentProject:
						state.currentProject?.id === id ? null : state.currentProject,
				})),
		}),
		{
			name: 'project-storage',
		}
	)
);