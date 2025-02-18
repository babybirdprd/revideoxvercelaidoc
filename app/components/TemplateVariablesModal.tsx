'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Template } from '@/revideo/templates';

interface TemplateVariablesModalProps {
	template: Template;
	isOpen: boolean;
	onClose: () => void;
	onApply: (variables: Record<string, any>) => void;
}

export function TemplateVariablesModal({
	template,
	isOpen,
	onClose,
	onApply,
}: TemplateVariablesModalProps) {
	const [variables, setVariables] = useState<Record<string, any>>({});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onApply(variables);
		onClose();
	};

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={onClose}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25 dark:bg-opacity-50" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
								>
									Configure Template Variables
								</Dialog.Title>

								<form onSubmit={handleSubmit} className="mt-4 space-y-4">
									{template.variables?.map((variable) => (
										<div key={variable.name}>
											<label
												htmlFor={variable.name}
												className="block text-sm font-medium text-gray-700 dark:text-gray-300"
											>
												{variable.name}
												<span className="ml-1 text-xs text-gray-500">
													({variable.description})
												</span>
											</label>
											<input
												type={variable.type === 'number' ? 'number' : 'text'}
												id={variable.name}
												value={variables[variable.name] || ''}
												onChange={(e) =>
													setVariables({
														...variables,
														[variable.name]:
															variable.type === 'number'
																? Number(e.target.value)
																: e.target.value,
													})
												}
												className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
											/>
										</div>
									))}

									<div className="mt-6 flex justify-end space-x-3">
										<button
											type="button"
											onClick={onClose}
											className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
										>
											Cancel
										</button>
										<button
											type="submit"
											className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
										>
											Apply Template
										</button>
									</div>
								</form>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
}