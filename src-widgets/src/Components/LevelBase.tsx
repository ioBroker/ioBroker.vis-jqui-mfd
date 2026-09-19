import React from 'react';

import MfdBase, { type IconSpec, type MfdBaseRxData } from './MfdBase';
import { mfdImage } from './MfdIcon';
import LevelIcon, { type LevelShape } from './LevelIcons';
import ValueDialog from './ValueDialog';
import type { ButtonSetItem } from './ButtonSet';
import { isNotEmpty, isTrue, looseEqual, pickBand, type LevelBand } from '../utils';

export interface LevelRxData extends MfdBaseRxData {
    min?: string;
    max?: string;
    invert_value?: boolean | string;
    show_active?: boolean | string;
    show_value?: boolean | string;
    units?: string;
    [colorOrIcon: string]: any;
}

/**
 * How a value becomes an icon.
 *
 * With `shape` the icon is drawn for the exact value (`LevelIcons.tsx`); the bands then only decide the colour of
 * the step. Without it - Custom10 - the band picks one of the images.
 */
export interface LevelScale {
    /** The drawn icon; empty: the image of the band */
    shape?: LevelShape;
    /** Steps from the top down, see `pickBand`: image and colour attribute of each step */
    bands: readonly LevelBand[];
    /** Below the lowest step */
    fallback: Omit<LevelBand, 'at'>;
    /** `true`/`false` count as max/min - the light and Custom10 templates did that, the others did not */
    boolAsLimits?: boolean;
    /** The image shows `max - value + min`: the shutter is closed at 0 */
    reversed?: boolean;
}

/** Which row of buttons the dialog has */
export type LevelDialogKind = 'dimmer' | 'shutter' | 'level';

/** Builds the eleven steps `name_100`, `name_90`, ... `name_10` with the colours `iconColor10` ... `iconColor1` */
export function tenSteps(name: string): LevelBand[] {
    const bands: LevelBand[] = [];
    for (let i = 10; i >= 1; i--) {
        bands.push({ at: i / 10, image: `${name}_${i * 10}`, color: `iconColor${i}` });
    }
    return bands;
}

/**
 * Base of the widgets that show a value as icon: light, shutter, blind and valve drawn for the exact value,
 * Custom10 with one of its eleven images - and their dialog versions, which add buttons for fixed steps and a
 * slider.
 */
export default abstract class LevelBase<RxData extends LevelRxData = LevelRxData> extends MfdBase<RxData> {
    /** The value the slider shows while the device is working, see `isWorking()` */
    private sliderHold: number | null = null;

    protected abstract getScale(): LevelScale;

    /** Row of buttons of the dialog; only used by the dialog versions */
    // eslint-disable-next-line class-methods-use-this
    protected getDialogKind(): LevelDialogKind {
        return 'level';
    }

    /** The state value as number, before the image scale: `true`/`false` only count for `boolAsLimits` */
    protected getNumericValue(): number {
        const { min, max } = this.getRange();
        const raw = this.getValue();
        if (this.getScale().boolAsLimits) {
            if (raw === true || raw === 'true') {
                return max;
            }
            if (raw === false || raw === 'false') {
                return min;
            }
        }
        return parseFloat(raw);
    }

    /** The value on the image scale: `reversed` and "Invert value" applied */
    protected getLevel(): number {
        const { min, max } = this.getRange();
        let val = this.getNumericValue();
        if (this.getScale().reversed) {
            val = max - val + min;
        }
        if (isTrue(this.state.rxData.invert_value)) {
            val = max - val + min;
        }
        return val;
    }

    protected getIcon(): IconSpec | null {
        const { min, max } = this.getRange();
        const scale = this.getScale();
        const band = pickBand(this.getLevel(), min, max, scale.bands, scale.fallback);
        const data = this.state.rxData;
        const color = isNotEmpty(data[band.color]) ? data[band.color] : data.iconColor;
        return { src: mfdImage(band.image), color };
    }

    /** The drawn icon for the exact value, or the image of the step if the scale has no shape */
    protected renderContent(): React.ReactNode {
        const shape = this.getScale().shape;
        if (!shape) {
            return super.renderContent();
        }
        const { min, max } = this.getRange();
        // NaN without a value or with min = max: every shape then shows its "no value" state like vis-1
        const fraction = (this.getLevel() - min) / (max - min);
        return (
            <LevelIcon
                shape={shape}
                fraction={fraction}
                color={this.getIconColor(this.getIcon()?.color)}
                invert={isTrue(this.state.rxData.invert_icon)}
            />
        );
    }

    /** "Show active background" of shutter, blind, valve and Custom10 */
    protected hasHover(): boolean {
        return isTrue(this.state.rxData.show_active);
    }

    /**
     * With "Show active background" vis-1 bound the button as `classes(el, true)` - reversed, so it is pressed
     * unless the value is at the top. vis-1 compared with 1 there, whatever the range; here it is `max` of the
     * widget, so a shutter from 0 to 100 is no longer pressed all the time.
     */
    protected isActive(): boolean {
        if (!isTrue(this.state.rxData.show_active)) {
            return false;
        }
        const { max } = this.getRange();
        const raw = this.getValue();
        let val: unknown = raw;
        if (raw === true || raw === 'true') {
            val = max;
        } else if (raw === false || raw === 'false') {
            val = null;
        }
        return !looseEqual(val, max);
    }

    protected getDialogButtons(): ButtonSetItem[] {
        const { min, max } = this.getRange();
        const range = max - min;
        const inverted = isTrue(this.state.rxData.invert_value);
        const kind = this.getDialogKind();

        if (kind === 'dimmer') {
            return [
                { label: MfdBase.t('off'), value: min },
                { label: '25%', value: min + range * 0.25 },
                { label: '50%', value: min + range * 0.5 },
                { label: '75%', value: min + range * 0.75 },
                { label: '100%', value: max },
            ];
        }

        // the shutter named the middle buttons after their value, the others kept "25%" / "75%"
        const swapLabels = inverted && kind === 'shutter';
        return [
            { label: MfdBase.t('closed'), value: inverted ? max : min },
            { label: swapLabels ? '75%' : '25%', value: min + range * (inverted ? 0.75 : 0.25) },
            { label: '50%', value: min + range * 0.5 },
            { label: swapLabels ? '25%' : '75%', value: min + range * (inverted ? 0.25 : 0.75) },
            { label: MfdBase.t('open'), value: inverted ? min : max },
        ];
    }

    /** `42%`, with "Show value" also `(42 %)` - the line under the slider of vis-1 */
    protected getDialogText(): string {
        const { min, max } = this.getRange();
        const raw = this.getValue();
        const percent = raw ? (((parseFloat(raw) - min) / (max - min)) * 100).toFixed(0) : '0';
        let text = `${percent}%`;
        if (isTrue(this.state.rxData.show_value)) {
            const value = Math.round(Number(raw));
            text += ` (${isFinite(value) ? value : ''} ${this.state.rxData.units || ''})`;
        }
        return text;
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogContentStyle(): React.CSSProperties {
        return { paddingLeft: 20 };
    }

    protected renderDialogContent(): React.ReactNode {
        const { min, max } = this.getRange();
        const oid = this.state.rxData.oid;
        const value = parseFloat(this.getValue());
        const sliderValue = this.isWorking() && this.sliderHold !== null ? this.sliderHold : value;

        return (
            <ValueDialog
                buttons={this.getDialogButtons()}
                value={this.getValue()}
                onSelect={val => {
                    this.sliderHold = typeof val === 'number' ? val : null;
                    this.setValue(oid, val);
                }}
                slider={{
                    min,
                    max,
                    step: (max - min) / 100,
                    inverted: this.getDialogKind() !== 'dimmer' && isTrue(this.state.rxData.invert_value),
                    value: sliderValue,
                    onCommit: val => {
                        this.sliderHold = val;
                        this.setValue(oid, val);
                    },
                }}
                text={this.getDialogText()}
            />
        );
    }
}
