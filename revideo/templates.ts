import { View2D } from '@revideo/2d';
import { SceneDescription, ThreadGeneratorFactory } from '@revideo/core';
import { z } from 'zod';

// Define the variable types as a union
const VariableType = z.enum(['string', 'number', 'boolean', 'array']);
type VariableType = z.infer<typeof VariableType>;

// Base template schema
export const templateSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	tags: z.array(z.string()),
	variables: z.array(z.object({
		name: z.string(),
		description: z.string(),
		type: VariableType,
	})).optional(),
	code: z.string(),
	scene: z.function()
		.args(z.record(z.any()))
		.returns(z.custom<SceneDescription<ThreadGeneratorFactory<View2D>>>())
		.optional(),
});

export type Template = z.infer<typeof templateSchema>;

// Helper to convert scene function to code string
export function sceneToCode(scene: Template['scene']): string {
	if (!scene) return '';
	const sceneDescription = scene({});
	// Convert the scene description to a string representation
	return `export default ${sceneDescription.toString()};`;
}

// Helper to apply variables to code
export function applyVariables(code: string, variables: Record<string, any>): string {
	let processedCode = code;
	for (const [name, value] of Object.entries(variables)) {
		const placeholder = `{{${name}}}`;
		const replacement = typeof value === 'string' ? 
			`"${value}"` : 
			JSON.stringify(value);
		processedCode = processedCode.replace(new RegExp(placeholder, 'g'), replacement);
	}
	return processedCode;
}

// Helper functions
export function getTemplateById(id: string): Template | undefined {
	return templates.find(t => t.id === id);
}

export function getTemplatesByTag(tag: string): Template[] {
	return templates.filter(t => t.tags.includes(tag));
}

// Template definitions
export const templates: Template[] = [
	{
		id: 'text-reveal',
		name: 'Text Reveal Animation',
		description: 'Simple text reveal with fade-in animation',
		tags: ['text', 'animation', 'reveal', 'fade'],
		variables: [
			{
				name: 'value',
				type: 'string',
				description: 'The text to display'
			}
		],
		code: `import {Txt, makeScene2D} from '@revideo/2d';
import {createRef} from '@revideo/core';

export default makeScene2D(function* (view) {
	const textRef = createRef<Txt>();
	
	yield view.add(
		<Txt
			ref={textRef}
			text={{value}}
			opacity={0}
			fontFamily={'Sans-Serif'}
			fontSize={40}
		/>
	);

	yield* textRef().opacity(1, 1);
});`
	},
	{
		id: 'logo-animation',
		name: 'Logo Animation',
		description: 'Simple logo reveal with scale and fade animation',
		tags: ['logo', 'animation', 'scale', 'fade'],
		variables: [
			{
				name: 'logoUrl',
				type: 'string',
				description: 'URL of the logo image'
			}
		],
		code: `import {Img, makeScene2D} from '@revideo/2d';
import {createRef} from '@revideo/core';

export default makeScene2D(function* (view) {
	const logoRef = createRef<Img>();
	
	yield view.add(
		<Img
			ref={logoRef}
			src={{logoUrl}}
			scale={0}
			opacity={0}
		/>
	);

	yield* logoRef().scale(1, 1);
	yield* logoRef().opacity(1, 0.5);
});`
	}
];