import { OpenAI } from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
 
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});
 
export async function POST(req: Request) {
	const { prompt } = await req.json();
 
	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		stream: true,
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
 
	const stream = OpenAIStream(response);
	return new StreamingTextResponse(stream);
}