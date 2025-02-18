import {Scene2D, View2D} from '@revideo/2d';
import {SceneDescription, ThreadGeneratorFactory} from '@revideo/core';

export interface Template {
	id: string;
	name: string;
	description: string;
	tags: string[];
	scene: () => SceneDescription<ThreadGeneratorFactory<View2D>>;
}

// Import templates
import { textRevealTemplate } from './text-reveal';
import { logoAnimationTemplate } from './logo-animation';
import { dataVisualizationTemplate } from './data-visualization';

// Template registry
export const templates: Template[] = [
	textRevealTemplate,
	logoAnimationTemplate,
	dataVisualizationTemplate,
];

// Helper to find template by ID
export function getTemplateById(id: string): Template | undefined {
	return templates.find(template => template.id === id);
}

// Helper to find templates by tag
export function getTemplatesByTag(tag: string): Template[] {
	return templates.filter(template => template.tags.includes(tag));
}