import { create } from 'zustand';
import fs from 'fs/promises';
import path from 'path';

interface HistoryEntry {
	id: string;
	timestamp: string;
	type: 'ai' | 'template' | 'manual';
	description: string;
	sceneContent: string;
}

interface HistoryState {
	entries: HistoryEntry[];
	currentIndex: number;
	addEntry: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => Promise<void>;
	undo: () => Promise<void>;
	redo: () => Promise<void>;
	canUndo: () => boolean;
	canRedo: () => boolean;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
	entries: [],
	currentIndex: -1,

	addEntry: async (entry) => {
		const scenePath = path.join(process.cwd(), 'revideo', 'scene.tsx');
		const sceneContent = await fs.readFile(scenePath, 'utf-8');
		
		const newEntry: HistoryEntry = {
			...entry,
			id: crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			sceneContent,
		};

		set(state => ({
			entries: [...state.entries.slice(0, state.currentIndex + 1), newEntry],
			currentIndex: state.currentIndex + 1,
		}));
	},

	undo: async () => {
		const state = get();
		if (!state.canUndo()) return;

		const prevEntry = state.entries[state.currentIndex - 1];
		const scenePath = path.join(process.cwd(), 'revideo', 'scene.tsx');
		await fs.writeFile(scenePath, prevEntry.sceneContent, 'utf-8');

		set(state => ({
			currentIndex: state.currentIndex - 1,
		}));
	},

	redo: async () => {
		const state = get();
		if (!state.canRedo()) return;

		const nextEntry = state.entries[state.currentIndex + 1];
		const scenePath = path.join(process.cwd(), 'revideo', 'scene.tsx');
		await fs.writeFile(scenePath, nextEntry.sceneContent, 'utf-8');

		set(state => ({
			currentIndex: state.currentIndex + 1,
		}));
	},

	canUndo: () => {
		const state = get();
		return state.currentIndex > 0;
	},

	canRedo: () => {
		const state = get();
		return state.currentIndex < state.entries.length - 1;
	},
}));