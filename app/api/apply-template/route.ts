import { applyCodeToScene } from '@/utils/applyCode';
import { templates, templateSchema } from '@/revideo/templates';
import { z } from 'zod';

// Request can either be a template ID or a full template object
const requestSchema = z.union([
	z.object({
		templateId: z.string(),
		projectId: z.string().optional(),
		variables: z.record(z.any()).optional()
	}),
	templateSchema.omit({ id: true }).extend({
		projectId: z.string().optional()
	})
]);

function substituteVariables(code: string, variables: Record<string, any>, templateVariables: Array<{name: string, type: string}>) {
	// Validate variable types
	for (const templateVar of templateVariables) {
		const value = variables[templateVar.name];
		if (value === undefined) {
			throw new Error(`Missing required variable: ${templateVar.name}`);
		}
		
		// Type checking
		switch(templateVar.type) {
			case 'number':
				if (typeof value !== 'number') {
					throw new Error(`Variable ${templateVar.name} must be a number`);
				}
				break;
			case 'string':
				if (typeof value !== 'string') {
					throw new Error(`Variable ${templateVar.name} must be a string`);
				}
				break;
			case 'boolean':
				if (typeof value !== 'boolean') {
					throw new Error(`Variable ${templateVar.name} must be a boolean`);
				}
				break;
			case 'array':
				if (!Array.isArray(value)) {
					throw new Error(`Variable ${templateVar.name} must be an array`);
				}
				break;
		}
	}

	// Replace variables in code
	let processedCode = code;
	for (const [name, value] of Object.entries(variables)) {
		const placeholder = `{{${name}}}`;
		// Handle different types of values
		const replacement = typeof value === 'string' ? 
			`"${value}"` : 
			JSON.stringify(value);
		processedCode = processedCode.replace(new RegExp(placeholder, 'g'), replacement);
	}

	const sceneContent = `/** @jsxImportSource @revideo/2d/lib */
import {Img, Layout, Txt, makeScene2D, Video, Circle, Rect, Rive} from '@revideo/2d';
import {createRef, useScene, waitFor, all, createSignal, easeInBounce, easeInExpo} from '@revideo/core';
import type {View2D} from '@revideo/2d';

export default makeScene2D('main', function* (view: View2D) {
${processedCode}
});`;

	return sceneContent;
}

export async function POST(req: Request) {
	try {
		const request = requestSchema.parse(await req.json());
		
		let template;
		if ('templateId' in request) {
			// Handle predefined template
			template = templates.find(t => t.id === request.templateId);
			if (!template) {
				throw new Error(`Template ${request.templateId} not found`);
			}
		} else {
			// Handle AI-generated template
			template = request;
		}
		
		// Process variables if they exist
		let processedCode = template.code;
		if (template.variables && template.variables.length > 0) {
			if (!request.variables) {
				throw new Error('Template requires variables but none were provided');
			}
			processedCode = substituteVariables(template.code, request.variables, template.variables);
		}
		
		// Apply the processed code to the scene
		await applyCodeToScene(processedCode);

		
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('Error applying template:', error);
		return new Response(
			JSON.stringify({ 
				error: error instanceof Error ? error.message : 'Error applying template'
			}),
			{ 
				status: 400, // Changed to 400 for validation errors
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
}
