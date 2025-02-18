/** @jsxImportSource @revideo/2d/lib */
import {Txt, makeScene2D, View2D} from '@revideo/2d';
import {createRef, all, waitFor, SceneDescription} from '@revideo/core';
import {ThreadGeneratorFactory} from '@revideo/core/lib/scenes';
import {Template} from './index';

function createTextRevealScene(): SceneDescription<ThreadGeneratorFactory<View2D>> {
	return makeScene2D('text-reveal', function* (view) {
		const textRef = createRef<Txt>();

		yield view.add(
			<Txt
				ref={textRef}
				text=""
				fontFamily="Roboto"
				fontSize={64}
				fill="#ffffff"
				opacity={0}
			/>
		);

		// Animate text appearance
		yield* textRef().opacity(1, 0.5);
		yield* textRef().text('Welcome to Revideo', 1.5);
		yield* waitFor(1);
	});
}

export const textRevealTemplate: Template = {
	id: 'text-reveal',
	name: 'Text Reveal Animation',
	description: 'Simple text reveal with fade-in animation',
	tags: ['text', 'animation', 'reveal', 'fade'],
	scene: createTextRevealScene,
};

