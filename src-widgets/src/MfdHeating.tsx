import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec, type MfdBaseRxData } from './Components/MfdBase';
import { mfdImage } from './Components/MfdIcon';
import ValueDialog from './Components/ValueDialog';
import {
    asButtonField,
    DEFAULT_STYLE,
    dialogGroup,
    iconColorField,
    invertIconField,
    mfdInfo,
    oidField,
    preview,
    workingField,
} from './Components/fields';
import { toNumber } from './utils';

/** The temperature with the configured digits, `--` while there is no value yet (vis-1 showed `NaN`) */
function formatTemperature(value: number, digits: number): string {
    return isFinite(value) ? value.toFixed(digits) : '--';
}

interface HeatingRxData extends MfdBaseRxData {
    min?: string | number;
    max?: string | number;
    step?: string | number;
    roundnumber?: string | number;
    checkboxDisplay?: 'image' | 'text';
}

/**
 * `tplMfdHeating` - a thermostat: the radiator icon (or the temperature as text) opens a dialog with one button
 * per temperature from min to max and a slider.
 */
export default class MfdHeating extends MfdBase<HeatingRxData> {
    /** The value the slider shows while the device is working */
    private sliderHold: number | null = null;

    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdHeating',
            visName: 'ctrl - Heating + jqui Dialog',
            visWidgetLabel: 'heating',
            visOrder: 11,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        workingField(),
                        { name: 'min', label: 'min', default: '18' },
                        { name: 'max', label: 'max', default: '30' },
                        { name: 'step', label: 'step', default: '2' },
                        { name: 'roundnumber', label: 'roundnumber', default: '0' },
                        {
                            name: 'checkboxDisplay',
                            label: 'checkboxDisplay',
                            type: 'select',
                            options: ['image', 'text'],
                            default: 'image',
                        },
                        invertIconField(),
                        asButtonField(),
                        iconColorField(),
                    ],
                },
                dialogGroup({ width: 600, height: 200, position: false }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('heating'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdHeating.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 600, height: 200 };
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogContentStyle(): React.CSSProperties {
        return { paddingLeft: 20 };
    }

    private getSettings(): { min: number; max: number; step: number; digits: number } {
        const data = this.state.rxData;
        const digits = Math.min(20, Math.max(0, Math.round(toNumber(data.roundnumber, 0))));
        return {
            min: toNumber(data.min, 18),
            max: toNumber(data.max, 30),
            step: toNumber(data.step, 2),
            digits,
        };
    }

    protected getIcon(): IconSpec {
        return { src: mfdImage('sani_heating_temp'), color: this.state.rxData.iconColor };
    }

    /** The image, or the temperature as text with "Display: text" */
    protected renderContent(): React.ReactNode {
        if (this.state.rxData.checkboxDisplay === 'text') {
            const { digits } = this.getSettings();
            return <span className="actTemp">{formatTemperature(parseFloat(this.getValue()), digits)} °C</span>;
        }
        return super.renderContent();
    }

    protected renderDialogContent(): React.ReactNode {
        const { min, max, step, digits } = this.getSettings();
        const oid = this.state.rxData.oid;
        const value = parseFloat(this.getValue());

        const buttons = [];
        if (step > 0 && min < max) {
            // at most 100 buttons, a step of 0.01 would otherwise hang the browser
            for (let temperature = min; temperature <= max + 1e-9 && buttons.length < 100; temperature += step) {
                const text = temperature.toFixed(digits);
                buttons.push({ label: `${text} °C`, value: parseFloat(text) });
            }
        }

        return (
            <ValueDialog
                buttons={buttons}
                value={this.getValue()}
                onSelect={val => {
                    this.sliderHold = val as number;
                    this.setValue(oid, val);
                }}
                slider={{
                    min,
                    max,
                    step,
                    value: this.isWorking() && this.sliderHold !== null ? this.sliderHold : value,
                    onCommit: val => {
                        this.sliderHold = val;
                        this.setValue(oid, val);
                    },
                }}
                text={`${formatTemperature(value, digits)}°C`}
            />
        );
    }
}
