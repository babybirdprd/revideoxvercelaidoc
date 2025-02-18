import { applyCodeToScene } from '@/utils/applyCode';
import { z } from 'zod';

// Template schema for validation
const templateSchema = z.object({
	name: z.string(),
	description: z.string(),
	code: z.string(),
	variables: z.array(z.object({
		name: z.string(),
		type: z.enum(['string', 'number', 'boolean', 'array']),
		description: z.string()
	}))
});

export async function POST(req: Request) {
	try {
		const template = templateSchema.parse(await req.json());
		
		// Apply the template code to the scene
		await applyCodeToScene(template.code);
		
		// Store template metadata for future use
		// TODO: Implement template storage
		
		return new Response('Template applied successfully', { status: 200 });
	} catch (error) {
		console.error('Error applying template:', error);
		return new Response(
			error instanceof Error ? error.message : 'Error applying template',
			{ status: 500 }
		);
	}
}
