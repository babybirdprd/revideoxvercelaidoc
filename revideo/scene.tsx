/** @jsxImportSource @revideo/2d/lib */
import {Img, Layout, Txt, makeScene2D, Video, Circle, Rect, Rive} from '@revideo/2d';
import {createRef, useScene, waitFor, all, createSignal, easeInBounce, easeInExpo} from '@revideo/core';
import type {View2D} from '@revideo/2d';

export default makeScene2D('main', function* (view: View2D) {
import {Txt, makeScene2D} from '@revideo/2d';
import {createRef} from '@revideo/core';

export default makeScene2D(function* (view) {
	const textRef = createRef<Txt>();
	
	yield view.add(
		<Txt
			ref={textRef}
			text="moo"
			opacity={0}
			fontFamily={'Sans-Serif'}
			fontSize={40}
		/>
	);

	yield* textRef().opacity(1, 1);
});
});