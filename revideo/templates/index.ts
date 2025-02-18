import {Scene2D, View2D} from '@revideo/2d';
import {SceneDescription, ThreadGeneratorFactory} from '@revideo/core';
import {z} from 'zod';

export interface Template {
	id: string;
	name: string;
	description: string;
	tags: string[];
	variables?: Array<{
		name: string;
		description: string;
		type: 'string' | 'number' | 'boolean' | 'array';
	}>;
	code: string;
	scene?: (args: any) => SceneDescription<ThreadGeneratorFactory<View2D>>;
}

// Template schema for validation
export const templateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	variables: z.array(z.object({
		name: z.string(),
		description: z.string(),
		type: z.enum(['string', 'number', 'boolean', 'array'])
	})).optional(),
	code: z.string()
});

// Import templates
import {textRevealTemplate} from './text-reveal';
import {logoAnimationTemplate} from './logo-animation';
import {dataVisualizationTemplate} from './data-visualization';

// Helper to convert scene to code
export function sceneToCode(scene: Template['scene']): string {
	if (!scene) return '';
	const sceneDescription = scene({});
	return `export default ${sceneDescription.toString()};`;
}

// Process templates to ensure they have code
const processedTemplates: Template[] = [
	textRevealTemplate,
	logoAnimationTemplate,
	dataVisualizationTemplate,
].map(template => ({
	...template,
	code: template.scene ? sceneToCode(template.scene) : template.code,
}));

// Template registry
export const templates: Template[] = processedTemplates;

// Helper to find template by ID
export function getTemplateById(id: string): Template | undefined {
	return templates.find(template => template.id === id);
}

// Helper to find templates by tag
export function getTemplatesByTag(tag: string): Template[] {
	return templates.filter(template => template.tags.includes(tag));
}