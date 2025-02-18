/** @jsxImportSource @revideo/2d/lib */
import {Img, makeScene2D, View2D} from '@revideo/2d';
import {createRef, all, waitFor, SceneDescription} from '@revideo/core';
import {ThreadGeneratorFactory} from '@revideo/core/lib/scenes';
import {Template} from './index';

function createLogoAnimationScene(args: {logoUrl?: string} = {}): SceneDescription<ThreadGeneratorFactory<View2D>> {
	return makeScene2D('logo-animation', function* (view) {
		const logoRef = createRef<Img>();

		yield view.add(
			<Img
				ref={logoRef}
				src={args.logoUrl || ""}
				width={200}
				height={200}
				scale={0}
				opacity={0}
			/>
		);

		// Animate logo appearance
		yield* all(
			logoRef().scale(1, 0.8),
			logoRef().opacity(1, 0.5)
		);

		yield* waitFor(1);
	});
}

export const logoAnimationTemplate: Template = {
	id: 'logo-animation',
	name: 'Logo Animation',
	description: 'Simple logo reveal with scale and fade animation',
	tags: ['logo', 'animation', 'reveal', 'fade', 'scale'],
	variables: [
		{
			name: 'logoUrl',
			description: 'URL of the logo image to animate',
			type: 'string'
		}
	],
	scene: createLogoAnimationScene,
	code: '', // This will be populated by sceneToCode in index.ts
};
