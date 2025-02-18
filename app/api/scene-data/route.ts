import fs from 'fs/promises';
import path from 'path';

interface SceneData {
	repoName: string;
	repoImage: string;
	data: number[];
	sceneStructure: {
		elements: {
			type: string;
			properties: Record<string, any>;
		}[];
		animations: {
			type: string;
			duration: number;
			target: string;
		}[];
		layout: {
			width: number;
			height: number;
			background: string;
		};
	};
	styles: {
		gradients: {
			type: string;
			from: number[];
			to: number[];
			stops: { offset: number; color: string }[];
		}[];
		colors: string[];
	};
}

export async function GET() {
	const scenePath = path.join(process.cwd(), 'revideo', 'scene.tsx');
	
	try {
		const currentScene = await fs.readFile(scenePath, 'utf-8');
		
		// Extract basic data
		const repoNameMatch = currentScene.match(/const exampleRepoName = '(.*)';/);
		const repoImageMatch = currentScene.match(/const exampleRepoImage = '(.*)';/);
		const dataMatch = currentScene.match(/const exampleData = \[(.*?)\];/s);
		
		// Extract scene elements (simplified representation)
		const elements = [
			{ type: 'Line', properties: { lineWidth: 30, stroke: '#3EAC45' } },
			{ type: 'Spline', properties: { fill: 'gradient' } },
			{ type: 'Rect', properties: { fill: '#000000' } },
			{ type: 'Layout', properties: { alignItems: 'center', gap: 40 } },
			{ type: 'Img', properties: { width: 100, height: 100, stroke: '#555555' } },
			{ type: 'Txt', properties: { fontFamily: 'Roboto', fontSize: 50 } },
		];

		// Extract animations
		const animations = [
			{ type: 'width', duration: 5, target: 'rect' },
			{ type: 'fill', duration: 2, target: 'rect' },
			{ type: 'position', duration: 2, target: 'layout' },
			{ type: 'fill', duration: 2, target: 'text' },
		];

		// Extract layout information
		const layout = {
			width: 1920, // Default Revideo width
			height: 1080, // Default Revideo height
			background: '#000000',
		};

		// Extract gradient and colors
		const gradient = {
			type: 'linear',
			from: [0, 0],
			to: [0, 800],
			stops: [
				{ offset: 0, color: '#000000' },
				{ offset: 1, color: 'green' },
			],
		};

		const sceneData: SceneData = {
			repoName: repoNameMatch ? repoNameMatch[1] : 'redotvideo/revideo',
			repoImage: repoImageMatch ? repoImageMatch[1] : 'https://avatars.githubusercontent.com/u/133898679',
			data: dataMatch ? JSON.parse(`[${dataMatch[1]}]`) : [],
			sceneStructure: {
				elements,
				animations,
				layout,
			},
			styles: {
				gradients: [gradient],
				colors: ['#000000', '#3EAC45', '#555555', '#ffffff'],
			},
		};
		
		return Response.json(sceneData);
	} catch (error) {
		console.error('Error reading scene data:', error);
		return new Response('Error reading scene data', { status: 500 });
	}
}