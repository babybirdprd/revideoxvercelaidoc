'use client';

import { templates } from '@/revideo/templates';
import { useProjectStore } from '../store/projectStore';

export function TemplateGallery() {
	const { currentProject, updateProject } = useProjectStore();

	const handleTemplateSelect = async (templateId: string) => {
		if (!currentProject) return;

		try {
			const response = await fetch('/api/apply-template', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ templateId, projectId: currentProject.id }),
			});

			if (!response.ok) {
				throw new Error('Failed to apply template');
			}

			// Update project with new preview if available
			const result = await response.json();
			if (result.previewUrl) {
				updateProject(currentProject.id, { previewUrl: result.previewUrl });
			}
		} catch (error) {
			console.error('Error applying template:', error);
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{templates.map(template => (
				<div
					key={template.id}
					className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
					onClick={() => handleTemplateSelect(template.id)}
				>
					<h3 className="font-medium mb-2">{template.name}</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
						{template.description}
					</p>
					<div className="flex flex-wrap gap-2">
						{template.tags.map(tag => (
							<span
								key={tag}
								className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
							>
								{tag}
							</span>
						))}
					</div>
				</div>
			))}
		</div>
	);
}