import { openai } from '@ai-sdk/openai';
import { streamText, Output, generateId } from 'ai';
import { z } from 'zod';
import { validateCode } from '@/utils/applyCode';
import { templateSchema } from '@/revideo/templates';


export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a Revideo expert. You help users modify their Revideo scenes based on their instructions.
You understand the @revideo/2d and @revideo/core libraries thoroughly.
Always return valid TypeScript code that can be directly used in a Revideo scene.

When creating templates:
- Give them descriptive names and clear descriptions
- Include relevant tags for categorization (e.g., 'animation', 'text', 'logo')
- Define clear variable names and descriptions
- Ensure the code is reusable and well-documented
- Use proper TypeScript types for variables
- Include proper error handling

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

// Use the imported templateSchema for consistency
const aiGeneratedTemplateSchema = templateSchema.omit({ id: true }).extend({
	tags: z.array(z.string()).default([])
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
						const validation = validateCode(code);
						return { isValid: validation.isValid, errors: validation.errors };
					} catch (error) {
						return { isValid: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
					}
				}
			}
		},
		experimental_output: operationType === 'template' ? Output.object({
			schema: aiGeneratedTemplateSchema
		}) : undefined,
	});

	return result.toDataStreamResponse();

}
