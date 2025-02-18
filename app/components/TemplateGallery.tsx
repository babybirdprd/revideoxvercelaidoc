'use client';

import { templates, Template } from '@/revideo/templates';
import { useProjectStore } from '../store/projectStore';
import { useState } from 'react';
import { TemplateVariablesModal } from './TemplateVariablesModal';

export function TemplateGallery() {
	const { currentProject, updateProject } = useProjectStore();
	const [error, setError] = useState<string | null>(null);
	const [applying, setApplying] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

	const handleTemplateSelect = (template: Template) => {
		if (template.variables && template.variables.length > 0) {
			setSelectedTemplate(template);
		} else {
			applyTemplate(template.id);
		}
	};

	const applyTemplate = async (templateId: string, variables?: Record<string, any>) => {
		if (!currentProject) return;
		setError(null);
		setApplying(true);

		try {
			const response = await fetch('/api/apply-template', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					templateId,
					projectId: currentProject.id,
					variables
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to apply template');
			}

			const result = await response.json();
			if (result.previewUrl) {
				updateProject(currentProject.id, { previewUrl: result.previewUrl });
			}
		} catch (error) {
			console.error('Error applying template:', error);
			setError(error instanceof Error ? error.message : 'Failed to apply template');
		} finally {
			setApplying(false);
		}
	};

	return (
		<div className="space-y-4">
			{error && (
				<div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
					{error}
				</div>
			)}
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{templates.map(template => (
					<div
						key={template.id}
						className={`p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors ${
							applying ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
						}`}
						onClick={() => handleTemplateSelect(template)}
					>
						<h3 className="font-medium mb-2">{template.name}</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
							{template.description}
						</p>
						<div className="flex flex-wrap gap-2 items-center">
							<span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
								{template.scene ? 'Scene' : 'Code'}
							</span>
							{template.tags.map(tag => (
								<span
									key={tag}
									className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
								>
									{tag}
								</span>
							))}
						</div>
						{template.variables && template.variables.length > 0 && (
							<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Required variables:
								</p>
								<ul className="mt-2 text-xs">
									{template.variables.map(variable => (
										<li key={variable.name} className="text-gray-600 dark:text-gray-300">
											{variable.name}: {variable.description}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				))}
			</div>

			{selectedTemplate && (
				<TemplateVariablesModal
					template={selectedTemplate}
					isOpen={!!selectedTemplate}
					onClose={() => setSelectedTemplate(null)}
					onApply={(variables) => {
						applyTemplate(selectedTemplate.id, variables);
						setSelectedTemplate(null);
					}}
				/>
			)}
		</div>
	);
}