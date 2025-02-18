import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
	const { prompt } = await req.json();

	const result = streamText({
		model: openai('gpt-4-turbo'),
		messages: [
			{
				role: 'system',
				content: 'You are a video generation assistant that creates Revideo animation code based on user prompts.',
			},
			{
				role: 'user',
				content: prompt,
			},
		],
	});

	return result.toDataStreamResponse();
}
