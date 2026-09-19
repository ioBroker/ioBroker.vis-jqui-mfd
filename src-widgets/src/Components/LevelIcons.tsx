import React, { type CSSProperties } from 'react';

import {
    AWNING_FRONT,
    LAMP_BULB,
    SHUTTER_BOX,
    VALVE_DISK,
    VALVE_PIPE,
    WINDOW_FRAME,
    WINDOW_HANDLE,
    WINDOW_MULLION,
} from './mfdShapes';

/**
 * The lamp, the shutter, the valve and the awning drawn for any value instead of picking one of the eleven (five)
 * images of vis-1. The shapes are the ones of the icons (`mfdShapes.ts`), in their 361 x 361 coordinates; at the
 * values of the vis-1 steps - 10%, 20%, ... - the drawing matches the image of that step.
 */
export type LevelShape = 'lamp' | 'shutter' | 'valve' | 'awning';

type Point = [number, number];

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * The ten rays of the lamp in the order they light up - 10% the left bottom one, 100% the right bottom one. Every
 * ray is a thin dash from `inner` to `dash` while it is dark and grows to a thick stroke up to `outer` while it
 * lights up.
 */
const RAYS: { inner: Point; dash: Point; outer: Point }[] = [
    { inner: [117.9, 219.4], dash: [103.7, 219.4], outer: [89.3, 219.4] },
    { inner: [117.9, 178.4], dash: [103.7, 178.4], outer: [89.3, 178.4] },
    { inner: [117.9, 137.3], dash: [103.7, 137.3], outer: [89.3, 137.3] },
    { inner: [127.8, 103.4], dash: [119.4, 94.9], outer: [107.4, 83] },
    { inner: [159.8, 93.7], dash: [159.9, 84.3], outer: [159.8, 74.9] },
    { inner: [201.4, 93.8], dash: [201.5, 84.4], outer: [201.4, 74.9] },
    { inner: [233.8, 103.4], dash: [243.4, 93.9], outer: [254.3, 83] },
    { inner: [244.2, 137.1], dash: [258.5, 137.1], outer: [272.8, 137.1] },
    { inner: [244.2, 178.2], dash: [258.5, 178.2], outer: [272.8, 178.2] },
    { inner: [244.2, 219.2], dash: [258.5, 219.2], outer: [272.8, 219.2] },
];

/** The lamp: dark below 1%, above it every 10% light up one more ray, the one in between grows */
function Lamp(props: { fraction: number; color: string }): React.JSX.Element {
    const { fraction, color } = props;
    const on = fraction >= 0.01;
    return (
        <>
            {LAMP_BULB.map((d, i) => (
                <path
                    key={i}
                    d={d}
                    fill={color}
                />
            ))}
            {on
                ? RAYS.map((ray, i) => {
                      const lit = clamp01(fraction * 10 - i);
                      const end: Point = [
                          ray.inner[0] + (ray.outer[0] - ray.inner[0]) * lit,
                          ray.inner[1] + (ray.outer[1] - ray.inner[1]) * lit,
                      ];
                      return (
                          <g
                              key={i}
                              stroke={color}
                              strokeLinecap="round"
                          >
                              <line
                                  x1={ray.inner[0]}
                                  y1={ray.inner[1]}
                                  x2={ray.dash[0]}
                                  y2={ray.dash[1]}
                                  strokeWidth={3}
                              />
                              {lit > 0 ? (
                                  <line
                                      x1={ray.inner[0]}
                                      y1={ray.inner[1]}
                                      x2={end[0]}
                                      y2={end[1]}
                                      strokeWidth={10}
                                  />
                              ) : null}
                          </g>
                      );
                  })
                : null}
        </>
    );
}

/** Centre of the first slat right under the box, the distance of the slats and how many there are when closed */
const SLAT_TOP = 138.333;
const SLAT_STEP = 13;
const SLATS = 10;

/**
 * The shutter: the window with the shutter box, and the curtain of slats down to `fraction` (0 open, 1 closed).
 * The slats move down together, the upper ones come out of the box - which is drawn last and covers them.
 */
function Shutter(props: { fraction: number; color: string }): React.JSX.Element {
    const { color } = props;
    const fraction = isFinite(props.fraction) ? clamp01(props.fraction) : 0;
    const lowest = SLAT_TOP + (fraction * SLATS - 1) * SLAT_STEP;
    const slats: number[] = [];
    // a slat centred above 125 lies completely in the box
    for (let y = lowest; y > 125; y -= SLAT_STEP) {
        slats.push(y);
    }
    return (
        <>
            <path
                d={WINDOW_FRAME}
                fill="none"
                stroke={color}
                strokeWidth={10}
            />
            <path
                d={WINDOW_HANDLE}
                fill={color}
            />
            <line
                x1={WINDOW_MULLION[0]}
                y1={WINDOW_MULLION[1]}
                x2={WINDOW_MULLION[2]}
                y2={WINDOW_MULLION[3]}
                stroke={color}
                strokeWidth={10}
            />
            {slats.map(y => (
                <line
                    key={y}
                    x1={75}
                    y1={y}
                    x2={286.833}
                    y2={y}
                    stroke={color}
                    strokeWidth={10}
                    strokeLinecap="round"
                />
            ))}
            <path
                d={SHUTTER_BOX}
                fill={color}
                stroke={color}
                strokeWidth={10}
            />
        </>
    );
}

/** The valve: the disk turns from upright (0, closed) to level with the pipe (1, open) */
function Valve(props: { fraction: number; color: string }): React.JSX.Element {
    const fraction = isFinite(props.fraction) ? clamp01(props.fraction) : 0;
    return (
        <g fill={props.color}>
            {VALVE_PIPE.map((d, i) => (
                <path
                    key={i}
                    d={d}
                />
            ))}
            <path
                d={VALVE_DISK}
                transform={`rotate(${90 * fraction} 180.7 180.75)`}
            />
        </g>
    );
}

/** A value between the key frames of the awning images (0%, 25%, 50%, 75%, 100%) */
function between(frames: readonly number[], fraction: number): number {
    const position = fraction * (frames.length - 1);
    const index = Math.min(frames.length - 2, Math.floor(position));
    return frames[index] + (frames[index + 1] - frames[index]) * (position - index);
}

/** How far the front edge of the awning moves down, measured in the five images */
const AWNING_DROP = [0, 10, 17, 22, 27];
/** How far the top of the cloth rises above the retracted awning, measured in the five images */
const AWNING_RISE = [0, 8, 17.5, 21.2, 25.2];
/**
 * Striped cloth like the images: seven stripes - half ones at both edges - with gaps of the same width between
 * them, i.e. twelve units across. `[from, to]` as part of the width.
 */
const AWNING_STRIPES: [number, number][] = [0, 1, 2, 3, 4, 5, 6].map(k => [
    Math.max(0, (2 * k - 0.5) / 12),
    Math.min(1, (2 * k + 0.5) / 12),
]);

/**
 * The awning: retracted (0) only the box with the valance, extending (1) the striped cloth grows towards the
 * viewer - it rises at the wall, narrows there in perspective, and the front edge with the valance moves down.
 */
function Awning(props: { fraction: number; color: string }): React.JSX.Element {
    const { color } = props;
    const fraction = isFinite(props.fraction) ? clamp01(props.fraction) : 0;
    const drop = between(AWNING_DROP, fraction);
    const rise = between(AWNING_RISE, fraction);

    const bottom = 156.6 + drop;
    const top = 149.5 - rise;
    // the solid hem along the front edge of the cloth
    const hem = Math.max(top, bottom - 8);
    const left = 70;
    const right = 289.5;
    const inset = (21 * rise) / 25.2;

    const stripes: string[] = [];
    if (hem - top > 0.5) {
        const at = (t: number, y: 'top' | 'hem'): string => {
            // along the top the cloth is narrower; down at the hem it has the full width
            const x0 = y === 'top' ? left + inset : left;
            const x1 = y === 'top' ? right - inset : right;
            return `${x0 + (x1 - x0) * t},${y === 'top' ? top : hem}`;
        };
        for (const [t0, t1] of AWNING_STRIPES) {
            stripes.push(`M${at(t0, 'top')}L${at(t1, 'top')}L${at(t1, 'hem')}L${at(t0, 'hem')}Z`);
        }
    }

    return (
        <g fill={color}>
            {stripes.map((d, i) => (
                <path
                    key={i}
                    d={d}
                />
            ))}
            <rect
                x={left}
                y={hem}
                width={right - left}
                height={bottom - hem}
                rx={2}
            />
            <g transform={`translate(0 ${drop})`}>
                {AWNING_FRONT.map((d, i) => (
                    <path
                        key={i}
                        d={d}
                        fillRule="evenodd"
                    />
                ))}
            </g>
        </g>
    );
}

const SHAPES: Record<LevelShape, (props: { fraction: number; color: string }) => React.JSX.Element> = {
    lamp: Lamp,
    shutter: Shutter,
    valve: Valve,
    awning: Awning,
};

interface LevelIconProps {
    shape: LevelShape;
    /** Position between min (0) and max (1); `NaN` without a value */
    fraction: number;
    /** Colour of the icon, empty is white like the images */
    color?: string;
    invert?: boolean;
    style?: CSSProperties;
}

/** One of the drawn icons, sized like the images: the width of the widget */
export default function LevelIcon(props: LevelIconProps): React.JSX.Element {
    const Shape = SHAPES[props.shape];
    return (
        <svg
            className="mfd-icon"
            viewBox="0 0 361 361"
            style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                aspectRatio: '1 / 1',
                filter: props.invert ? 'invert(1)' : undefined,
                ...props.style,
            }}
        >
            <Shape
                fraction={props.fraction}
                color={props.color || '#FFFFFF'}
            />
        </svg>
    );
}
