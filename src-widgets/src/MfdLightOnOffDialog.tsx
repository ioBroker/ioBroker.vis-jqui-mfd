import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec, type MfdBaseRxData } from './Components/MfdBase';
import { mfdImage } from './Components/MfdIcon';
import ValueDialog from './Components/ValueDialog';
import {
    asButtonField,
    DEFAULT_STYLE,
    dialogGroup,
    invertIconField,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
    workingField,
} from './Components/fields';
import { isFalse, isNotEmpty, jqData } from './utils';

interface OnOffDialogRxData extends MfdBaseRxData {
    min?: string;
    max?: string;
    iconOff?: string;
    iconColorOff?: string;
    iconOn?: string;
    iconColorOn?: string;
    textOff?: string;
    textOn?: string;
}

/** A value of the dialog buttons: numbers and `true`/`false` converted, like the template did */
function buttonValue(value: string | undefined, defaultValue: number): string | number | boolean {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }
    return jqData(value) as string | number | boolean;
}

/** `tplMfdLightOnOffDialog` - a lamp that opens a dialog with the two buttons "off" and "on" */
export default class MfdLightOnOffDialog extends MfdBase<OnOffDialogRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdLightOnOffDialog',
            visName: 'OnOff + jqui Dialog',
            visWidgetLabel: 'light_onoff_dialog',
            visOrder: 3,
            visAttrs: [
                {
                    name: 'common',
                    fields: [oidField(), workingField(), ...minMaxFields()],
                },
                {
                    name: 'style',
                    label: 'group_style',
                    fields: [
                        { name: 'iconOff', type: 'image', label: 'iconOff' },
                        { name: 'iconColorOff', type: 'color', label: 'iconColorOff' },
                        { name: 'iconOn', type: 'image', label: 'iconOn' },
                        { name: 'iconColorOn', type: 'color', label: 'iconColorOn' },
                        invertIconField(),
                        asButtonField(),
                    ],
                },
                dialogGroup({
                    width: 440,
                    height: 200,
                    before: [
                        { name: 'textOff', label: 'textOff' },
                        { name: 'textOn', label: 'textOn' },
                    ],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('light_onoff_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdLightOnOffDialog.getWidgetInfo();
    }

    /** Off is `min` if only min is set, everything but `max` if max is set, the usual falsy values otherwise */
    private isOn(): boolean {
        const data = this.state.rxData;
        return !isFalse(this.getValue(), data.min, data.max);
    }

    protected getIcon(): IconSpec {
        const data = this.state.rxData;
        if (this.isOn()) {
            return {
                src: isNotEmpty(data.iconOn) ? data.iconOn! : mfdImage('light_light_dim_100'),
                color: data.iconColorOn,
            };
        }
        return {
            src: isNotEmpty(data.iconOff) ? data.iconOff! : mfdImage('light_light_dim'),
            color: data.iconColorOff,
        };
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return true;
    }

    protected isActive(): boolean {
        return this.isOn();
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    /**
     * The buttons write `min` (default 0) and `max` (default 100 - the template really used 100 here, a boolean
     * state needs `false` and `true` in min and max).
     */
    protected renderDialogContent(): React.ReactNode {
        const data = this.state.rxData;
        return (
            <ValueDialog
                buttons={[
                    { label: data.textOff || MfdBase.t('off'), value: buttonValue(data.min, 0) },
                    { label: data.textOn || MfdBase.t('on'), value: buttonValue(data.max, 100) },
                ]}
                value={this.getValue()}
                onSelect={value => this.setValue(data.oid, value)}
            />
        );
    }
}
