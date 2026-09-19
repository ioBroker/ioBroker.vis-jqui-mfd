/*
 * Compares the drawn icons (`src/Components/LevelIcons.tsx`) with the images of vis-1 they replace: for every step
 * the image on top, the drawing at the same value under it, and a row of values between the steps.
 *
 * Open `compare.html` of `npm run preview`; `compare.html#awning` shows only one of them. Not part of the widget set.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';

import LevelIcon, { type LevelShape } from '../src/Components/LevelIcons';

const IMG = 'widgets/jqui-mfd/img/';

/** The images of vis-1 per value (0..1) */
const FAMILIES: { shape: LevelShape; title: string; steps: [number, string][] }[] = [
    {
        shape: 'lamp',
        title: 'Lamp',
        steps: [
            [0, 'light_light_dim'],
            [0.01, 'light_light_dim_00'],
            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i): [number, string] => [i / 10, `light_light_dim_${i * 10}`]),
        ],
    },
    {
        shape: 'shutter',
        title: 'Shutter (value: closed part)',
        steps: [
            [0, 'fts_window_2w'],
            ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i): [number, string] => [i / 10, `fts_shutter_${i * 10}`]),
        ],
    },
    {
        shape: 'valve',
        title: 'Valve',
        steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i): [number, string] => [i / 10, `sani_valve_${i * 10}`]),
    },
    {
        shape: 'awning',
        title: 'Awning',
        steps: [0, 25, 50, 75, 100].map((i): [number, string] => [i / 100, `fts_markise_${i}`]),
    },
];

const cell: React.CSSProperties = { width: 72, textAlign: 'center', fontSize: 11 };
const box: React.CSSProperties = { width: 72, height: 72, background: '#2b2f36', borderRadius: 4 };

function Compare(): React.JSX.Element {
    return (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {FAMILIES.filter(family => !window.location.hash || window.location.hash === `#${family.shape}`).map(family => (
                <div key={family.shape}>
                    <b>{family.title}</b>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        {family.steps.map(([value, image]) => (
                            <div
                                key={image}
                                style={cell}
                            >
                                <img
                                    src={`${IMG}${image}.svg`}
                                    style={box}
                                    alt={image}
                                />
                                <div style={box}>
                                    <LevelIcon
                                        shape={family.shape}
                                        fraction={value}
                                    />
                                </div>
                                {Math.round(value * 100)}%
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        {[0.05, 0.15, 0.37, 0.5, 0.63, 0.85, 0.97].map(value => (
                            <div
                                key={value}
                                style={cell}
                            >
                                <div style={box}>
                                    <LevelIcon
                                        shape={family.shape}
                                        fraction={value}
                                        color={value > 0.5 ? '#ffd83a' : undefined}
                                    />
                                </div>
                                {Math.round(value * 100)}%
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<Compare />);
