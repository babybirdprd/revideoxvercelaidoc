'use client';

import { useChat, Message } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

interface MessageWithExperimentalOutput extends Message {
	experimental_output?: {
		name: string;
		code: string;
		variables: Array<{
			name: string;
			type: string;
			description: string;
		}>;
	};
}

interface SceneData {
	repoName: string;
	repoImage: string;
	data: number[];
}

const OPERATION_TYPES = [
	{ id: 'template', name: 'Scene Template', description: 'Create reusable scene templates' },
	{ id: 'style', name: 'Style Transfer', description: 'Apply visual styles to elements' },
	{ id: 'animation', name: 'Animation Sequence', description: 'Create complex animation sequences' },
	{ id: 'text-to-animation', name: 'Text to Animation', description: 'Convert text descriptions into animations' },
	{ id: 'positioning', name: 'Smart Positioning', description: 'Optimize element placement' },
	{ id: 'color', name: 'Color Scheme', description: 'Create and apply color palettes' },
];

export function AIVideoEditor() {
	const [sceneData, setSceneData] = useState<SceneData | null>(null);
	const [selectedOperation, setSelectedOperation] = useState(OPERATION_TYPES[0]);
	const [isApplyingCode, setIsApplyingCode] = useState(false);
	const [validationStatus, setValidationStatus] = useState<{
		isValid: boolean;
		errors: string[];
	} | null>(null);

	const { messages, input, handleInputChange, handleSubmit, status } = useChat({
		api: '/api/ai',
		body: {
			sceneData,
			operationType: selectedOperation.id,
		},
		onFinish: async (message) => {
			if (message.role === 'assistant') {
				setIsApplyingCode(true);
				try {
					// Handle structured data for templates
					if (selectedOperation.id === 'template') {
						// Check for experimental_output first
						const assistantMessage = message as MessageWithExperimentalOutput;
						const template = assistantMessage.experimental_output || JSON.parse(message.content);
						if (!template || !template.name || !template.code || !template.variables) {
							throw new Error('Invalid template format');
						}
						await fetch('/api/apply-template', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(template),
						});
					} else {
						// Handle regular code updates
						await fetch('/api/apply-code', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ code: message.content }),
						});
					}
				} catch (error) {
					console.error('Error applying changes:', error);
					setValidationStatus({
						isValid: false,
						errors: [error instanceof Error ? error.message : 'Unknown error applying changes']
					});
				} finally {
					setIsApplyingCode(false);
				}
			}
		},
	});

	useEffect(() => {
		fetch('/api/scene-data')
			.then(res => res.json())
			.then(data => setSceneData(data));
	}, []);

	return (
		<div className="flex flex-col h-[calc(100vh-8rem)] rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
			<div className="p-4 border-b border-gray-200 dark:border-gray-800">
				<Listbox value={selectedOperation} onChange={setSelectedOperation}>
					<Listbox.Root>
						<div className="relative">
						<Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-left border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
							<span className="block truncate">{selectedOperation.name}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							</span>
						</Listbox.Button>
						
						<Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
							{OPERATION_TYPES.map((operation) => (
								<Listbox.Option
									key={operation.id}
									value={operation}
									className={({ active }: { active: boolean }) =>
										`relative cursor-pointer select-none py-2 pl-10 pr-4 ${
											active ? 'bg-blue-100 dark:bg-blue-900/20' : ''
										}`
									}
								>
									{({ selected }: { selected: boolean }) => (
										<>
											<span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
												{operation.name}
											</span>
											<span className="block text-sm text-gray-500 dark:text-gray-400">
												{operation.description}
											</span>
										</>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</div>
				</Listbox.Root>
			</Listbox>

			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
				{messages.map(m => (
					<div
						key={m.id}
						className={`flex ${
							m.role === 'user' ? 'justify-end' : 'justify-start'
						}`}
					>
						<div
							className={`max-w-[80%] rounded-lg px-4 py-2 ${
								m.role === 'user'
									? 'bg-blue-500 text-white'
									: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
							}`}
						>
							{m.role === 'assistant' && m.parts ? (
								// Handle message parts for tool calls and results
								m.parts.map((part, index) => {
									if (part.type === 'text') {
										return <pre key={index} className="whitespace-pre-wrap font-sans">{part.text}</pre>;
									}
									if (part.type === 'tool-invocation') {
										return (
											<div key={index} className="border-t mt-2 pt-2 text-sm">
												<div className="font-medium">{part.toolInvocation.toolName}</div>
												{part.toolInvocation.state === 'result' && (
													<pre className="mt-1 text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded">
														{JSON.stringify(part.toolInvocation.result, null, 2)}
													</pre>
												)}
											</div>
										);
									}
									return null;
								})
							) : (
								<pre className="whitespace-pre-wrap font-sans">{m.content}</pre>
							)}
						</div>
					</div>
				))}
				
				{(isApplyingCode || status !== 'ready') && (
					<div className="flex justify-center">
						<div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded">
							{isApplyingCode ? 'Applying changes...' : 'Generating...'}
						</div>
					</div>
				)}

				{validationStatus && !validationStatus.isValid && (
					<div className="flex justify-center">
						<div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-2 rounded">
							{validationStatus.errors.join('\n')}
						</div>
					</div>
				)}
			</div>

			<form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
				<div className="flex gap-2">
					<input
						value={input}
						onChange={handleInputChange}
						placeholder={`Describe how to ${selectedOperation.description.toLowerCase()}...`}
						className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
					/>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
					>
						<PaperAirplaneIcon className="w-5 h-5" />
					</button>
				</div>
			</form>
		</div>
	);
}