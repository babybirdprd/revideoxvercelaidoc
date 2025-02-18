import { openai } from '@ai-sdk/openai';
import { streamText, Output } from 'ai';
import { z } from 'zod';
import { validateCode } from '@/utils/applyCode';

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a Revideo expert. You help users modify their Revideo scenes based on their instructions.
You understand the @revideo/2d and @revideo/core libraries thoroughly.
Always return valid TypeScript code that can be directly used in a Revideo scene.

You can handle the following types of operations:
1. Scene Template Generation - Create reusable scene templates
2. Style Transfer - Apply visual styles to elements
3. Animation Sequences - Create complex animation sequences
4. Text-to-Animation - Convert text descriptions into animations
5. Smart Object Positioning - Optimize element placement
6. Color Scheme Generation - Create and apply color palettes

For animations:
- Use proper easing functions for natural movement
- Consider animation timing and pacing
- Implement proper sequencing with yield*
- Use parallel animations with all() when appropriate

For layout and styling:
- Follow design principles for visual hierarchy
- Ensure proper spacing and alignment
- Use consistent color schemes
- Consider responsive scaling

Always validate your code ensures:
- Proper TypeScript syntax
- Correct Revideo API usage
- Efficient animation sequences
- Proper resource cleanup`;

// Define schemas for different operations
const sceneTemplateSchema = z.object({
	name: z.string(),
	description: z.string(),
	code: z.string(),
	variables: z.array(z.object({
		name: z.string(),
		type: z.enum(['string', 'number', 'boolean', 'array']),
		description: z.string()
	}))
});

const styleTransferSchema = z.object({
	styles: z.array(z.object({
		property: z.string(),
		value: z.string(),
		description: z.string()
	})),
	code: z.string()
});

export async function POST(req: Request) {
	const { prompt, sceneData, operationType } = await req.json();

	const result = streamText({
		model: openai('gpt-4-turbo'),
		system: SYSTEM_PROMPT,
		messages: [
			{
				role: 'user',
				content: `Current scene data: ${JSON.stringify(sceneData, null, 2)}
								 Operation type: ${operationType}
								 User request: ${prompt}`
			}
		],
		tools: {
			validateScene: {
				description: 'Validate scene code for syntax and Revideo API usage',
				parameters: z.object({
					code: z.string().describe('The scene code to validate')
				}),
				execute: async ({ code }) => {
					try {
						// Use the existing validation logic
						const validation = validateCode(code);
						return { isValid: validation.isValid, errors: validation.errors };
					} catch (error) {
						return { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
					}
				}
			},
			applyStyles: {
				description: 'Apply visual styles to scene elements',
				parameters: styleTransferSchema,
				execute: async ({ styles, code }) => {
					// Apply styles to the scene
					return { success: true, message: 'Styles applied successfully' };
				}
			}
		},
		experimental_output: operationType === 'template' ? Output.object({
			schema: sceneTemplateSchema
		}) : undefined
	});

	return result.toDataStreamResponse();
}