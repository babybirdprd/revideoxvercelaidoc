import fs from 'fs/promises';
import path from 'path';
import { parse as parseTypescript } from '@typescript-eslint/typescript-estree';

export interface CodeValidationResult {
	isValid: boolean;
	errors: string[];
}

// Validate TypeScript code syntax and structure
export function validateCode(code: string): CodeValidationResult {
	try {
		parseTypescript(code, {
			jsx: true,
			range: true,
			loc: true,
		});
		return { isValid: true, errors: [] };
	} catch (error) {
		return {
			isValid: false,
			errors: [error instanceof Error ? error.message : 'Unknown error'],
		};
	}
}

// Create a backup of the scene file
async function createBackup(scenePath: string): Promise<string> {
	const backupPath = `${scenePath}.backup`;
	await fs.copyFile(scenePath, backupPath);
	return backupPath;
}

// Restore from backup if something goes wrong
async function restoreFromBackup(scenePath: string, backupPath: string): Promise<void> {
	await fs.copyFile(backupPath, scenePath);
	await fs.unlink(backupPath);
}

export async function applyCodeToScene(code: string): Promise<void> {
	const scenePath = path.join(process.cwd(), 'revideo', 'scene.tsx');
	let backupPath: string | null = null;
	
	try {
		// Validate the code first
		const validation = validateCode(code);
		if (!validation.isValid) {
			throw new Error(`Invalid code: ${validation.errors.join(', ')}`);
		}

		// Create backup before making changes
		backupPath = await createBackup(scenePath);

		// Read the current scene file
		const currentScene = await fs.readFile(scenePath, 'utf-8');
		
		// Find the makeScene2D function content
		const sceneMatch = currentScene.match(/makeScene2D\(['"]main['"], function\* \(view\) {[\s\S]*}\);/);
		
		if (!sceneMatch) {
			throw new Error('Could not find scene function in file');
		}
		
		// Replace the scene content with the new code
		const updatedScene = currentScene.replace(
			sceneMatch[0],
			`makeScene2D('main', function* (view) {\n${code}\n});`
		);
		
		// Write the updated scene back to the file
		await fs.writeFile(scenePath, updatedScene, 'utf-8');

		// If everything succeeded, remove the backup
		if (backupPath) {
			await fs.unlink(backupPath);
		}
	} catch (error) {
		// Restore from backup if we have one and something went wrong
		if (backupPath) {
			await restoreFromBackup(scenePath, backupPath);
		}
		console.error('Error applying code to scene:', error);
		throw error;
	}
}