'use client';

import { useProjectStore } from '../store/projectStore';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function ProjectList() {
	const { projects, currentProject, addProject, setCurrentProject, deleteProject } = useProjectStore();
	const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
	const [newProjectName, setNewProjectName] = useState('');

	const handleCreateProject = () => {
		if (!newProjectName.trim()) return;
		
		addProject({
			name: newProjectName,
			sceneData: {
				repoName: '',
				repoImage: '',
				data: [],
			},
		});
		
		setNewProjectName('');
		setShowNewProjectDialog(false);
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-semibold">Projects</h2>
				<button
					onClick={() => setShowNewProjectDialog(true)}
					className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
				>
					<PlusIcon className="w-5 h-5" />
				</button>
			</div>

			{showNewProjectDialog && (
				<div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
					<input
						type="text"
						value={newProjectName}
						onChange={(e) => setNewProjectName(e.target.value)}
						placeholder="Project name"
						className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mb-2"
					/>
					<div className="flex justify-end gap-2">
						<button
							onClick={() => setShowNewProjectDialog(false)}
							className="px-3 py-1 text-sm"
						>
							Cancel
						</button>
						<button
							onClick={handleCreateProject}
							className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
						>
							Create
						</button>
					</div>
				</div>
			)}

			<div className="space-y-2">
				{projects.map((project) => (
					<div
						key={project.id}
						className={`p-4 rounded-lg border ${
							currentProject?.id === project.id
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500'
						} cursor-pointer transition-colors flex justify-between items-center`}
						onClick={() => setCurrentProject(project)}
					>
						<div>
							<h3 className="font-medium">{project.name}</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Updated {new Date(project.updatedAt).toLocaleDateString()}
							</p>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								deleteProject(project.id);
							}}
							className="p-2 text-gray-500 hover:text-red-500 transition-colors"
						>
							<TrashIcon className="w-5 h-5" />
						</button>
					</div>
				))}
			</div>
		</div>
	);
}