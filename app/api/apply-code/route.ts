import { applyCodeToScene } from '@/utils/applyCode';

export async function POST(req: Request) {
	try {
		const { code } = await req.json();
		
		if (!code) {
			return new Response('No code provided', { status: 400 });
		}

		await applyCodeToScene(code);
		
		return new Response('Code applied successfully', { status: 200 });
	} catch (error) {
		console.error('Error applying code:', error);
		return new Response('Error applying code', { status: 500 });
	}
}