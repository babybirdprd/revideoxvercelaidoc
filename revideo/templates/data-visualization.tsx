/** @jsxImportSource @revideo/2d/lib */
import {Rect, Txt, Layout, makeScene2D, View2D} from '@revideo/2d';
import {createRef, all, waitFor, SceneDescription} from '@revideo/core';
import {ThreadGeneratorFactory} from '@revideo/core/lib/scenes';
import {Template} from './index';

function createDataVisualizationScene(): SceneDescription<ThreadGeneratorFactory<View2D>> {
	return makeScene2D('data-visualization', function* (view) {
		// Sample data - will be replaced by user data
		const data = [
			{ label: 'A', value: 30 },
			{ label: 'B', value: 50 },
			{ label: 'C', value: 20 },
			{ label: 'D', value: 80 },
		];

		const maxValue = Math.max(...data.map(d => d.value));
		const barWidth = 60;
		const barGap = 20;
		const chartHeight = 300;

		// Create container for bars
		const containerRef = createRef<Layout>();
		yield view.add(
			<Layout
				ref={containerRef}
				layout
				direction="row"
				gap={barGap}
				y={100}
			/>
		);

		// Create and animate bars
		const barAnimations = data.map((item) => {
			const barRef = createRef<Rect>();
			const labelRef = createRef<Txt>();
			const valueRef = createRef<Txt>();
			const height = (item.value / maxValue) * chartHeight;

			containerRef().add(
				<Layout direction="column" gap={10}>
					<Rect
						ref={barRef}
						width={barWidth}
						height={0}
						fill="#3498db"
						radius={4}
						opacity={0}
					/>
					<Txt
						ref={labelRef}
						text={item.label}
						fontSize={24}
						fill="#ffffff"
						opacity={0}
					/>
					<Txt
						ref={valueRef}
						text={item.value.toString()}
						fontSize={20}
						fill="#ffffff"
						opacity={0}
					/>
				</Layout>
			);

			return all(
				barRef().height(height, 0.8),
				barRef().opacity(1, 0.3),
				labelRef().opacity(1, 0.3),
				valueRef().opacity(1, 0.3)
			);
		});

		// Animate all bars in sequence
		for (const animation of barAnimations) {
			yield* animation;
			yield* waitFor(0.2);
		}

		// Hold the final state
		yield* waitFor(1);
	});
}

export const dataVisualizationTemplate: Template = {
	id: 'data-visualization',
	name: 'Bar Chart Animation',
	description: 'Animated bar chart with labels and values',
	tags: ['data', 'chart', 'animation', 'bars'],
	scene: createDataVisualizationScene,
};
