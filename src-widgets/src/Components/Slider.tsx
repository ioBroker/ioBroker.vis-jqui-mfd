import React, { useRef, useState } from 'react';

interface SliderProps {
    min: number;
    max: number;
    step: number;
    /** Value of the state */
    value: number;
    /** The left end is `max` and the right end `min` - the `invert_value` option of the shutter */
    inverted?: boolean;
    /** Called once when the handle is released or moved with the keyboard */
    onCommit: (value: number) => void;
    disabled?: boolean;
}

/** Rounds to the step, counted from `min` like the jQuery UI slider */
function snap(value: number, min: number, max: number, step: number): number {
    let result = value;
    if (step > 0) {
        result = min + Math.round((value - min) / step) * step;
        // no 0.30000000000000004
        const decimals = (step.toString().split('.')[1] || '').length;
        result = parseFloat(result.toFixed(Math.min(10, decimals + 2)));
    }
    return Math.min(max, Math.max(min, result));
}

/**
 * The horizontal slider of the dialogs - the replacement of the jQuery UI slider.
 *
 * vis-1 sent a value for every pixel the handle moved. Here the handle follows the pointer and the value is
 * written once, where the pointer is released - a device gets one command instead of dozens.
 */
export default function Slider(props: SliderProps): React.JSX.Element {
    const { min, max, inverted } = props;
    const step = props.step > 0 ? props.step : (max - min) / 100;
    const refTrack = useRef<HTMLDivElement>(null);
    /** Position while dragging, in values of the slider (not of the state) */
    const [dragging, setDragging] = useState<number | null>(null);

    const toPosition = (value: number): number => (inverted ? max - value + min : value);
    const fromPosition = (position: number): number => (inverted ? max - position + min : position);

    const position = dragging ?? toPosition(isFinite(props.value) ? props.value : min);
    const range = max - min || 1;
    const percent = Math.min(100, Math.max(0, ((position - min) / range) * 100));

    const positionAt = (clientX: number): number => {
        const box = refTrack.current?.getBoundingClientRect();
        if (!box || !box.width) {
            return position;
        }
        const ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
        return snap(min + ratio * range, min, max, step);
    };

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (props.disabled || e.button !== 0) {
            return;
        }
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(positionAt(e.clientX));
    };
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (dragging !== null) {
            setDragging(positionAt(e.clientX));
        }
    };
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
        if (dragging !== null) {
            const value = positionAt(e.clientX);
            setDragging(null);
            props.onCommit(fromPosition(value));
        }
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        let next: number | null = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            next = position + step;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            next = position - step;
        } else if (e.key === 'Home') {
            next = min;
        } else if (e.key === 'End') {
            next = max;
        }
        if (next !== null && !props.disabled) {
            e.preventDefault();
            props.onCommit(fromPosition(snap(next, min, max, step)));
        }
    };

    return (
        <div
            className={`mfd-slider${props.disabled ? ' mfd-disabled' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDragging(null)}
        >
            <div
                className="mfd-slider-track"
                ref={refTrack}
            >
                <div
                    className="mfd-slider-range"
                    style={{ width: `${percent}%` }}
                />
                <div
                    className={`mfd-slider-handle${dragging !== null ? ' mfd-active' : ''}`}
                    style={{ left: `${percent}%` }}
                    role="slider"
                    tabIndex={props.disabled ? -1 : 0}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={fromPosition(position)}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>
    );
}
