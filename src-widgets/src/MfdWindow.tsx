import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec } from './Components/MfdBase';
import { asButtonField, DEFAULT_STYLE, iconColorField, invertIconField, mfdInfo, preview } from './Components/fields';
import { looseEqual, toNumber } from './utils';
import { contactIcon, iconsGroup, valuesGroup, type ContactRxData, type ContactState } from './MfdWindowBool';

interface WindowRxData extends ContactRxData {
    slide_count?: number | string;
    [slide: string]: any;
}

/** A configured value of a state, or its default if the field is empty */
function stateValue(value: string | undefined, defaultValue: number): unknown {
    return value === undefined || value === '' ? defaultValue : value;
}

/**
 * The image of a window with two sashes: the left and the right sash each closed, tilted or opened. Combinations
 * without image of their own (one sash without sensor) show the closed window.
 */
function twoSashSuffix(left: unknown, right: unknown, closed: unknown, tilted: unknown, opened: unknown): string {
    const is = (value: unknown, state: unknown): boolean => looseEqual(value, state);
    let suffix = '';
    if (is(left, tilted) && is(right, tilted)) {
        suffix = '_tilt_lr';
    }
    if (is(left, closed) && is(right, tilted)) {
        suffix = '_tilt_r';
    }
    if (is(left, tilted) && is(right, closed)) {
        suffix = '_tilt_l';
    }
    if (is(left, tilted) && is(right, opened)) {
        suffix = '_tilt_l_open_r';
    }
    if (is(left, opened) && is(right, tilted)) {
        suffix = '_open_l_tilt_r';
    }
    if (is(left, opened) && is(right, opened)) {
        suffix = '_open_lr';
    }
    if (is(left, opened) && is(right, closed)) {
        suffix = '_open_l';
    }
    if (is(left, closed) && is(right, opened)) {
        suffix = '_open_r';
    }
    return suffix;
}

/**
 * `tplMfdWindow` - a window with one or two sashes, each with a rotary handle sensor: closed (0), tilted (2) or
 * opened (1).
 *
 * vis-1 offered own icons for the three states but never showed them; here they are used.
 */
export default class MfdWindow extends MfdBase<WindowRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdWindow',
            visName: 'Window Rotate Handle',
            visWidgetLabel: 'window_handle',
            visOrder: 12,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        invertIconField(),
                        asButtonField(),
                        iconColorField(),
                        {
                            name: 'slide_count',
                            label: 'slide_count',
                            type: 'nselect',
                            options: ['1', '2'],
                            noTranslation: true,
                            default: '1',
                        },
                    ],
                },
                {
                    name: 'slides',
                    label: 'group_slides',
                    indexFrom: 1,
                    indexTo: 'slide_count',
                    fields: [
                        { name: 'slide_type', label: 'slide_type', type: 'select', options: ['left', 'right'] },
                        { name: 'oid-slide-sensor', type: 'id', label: 'oid-slide-sensor' },
                    ],
                },
                valuesGroup(['closed', 'tilted', 'opened']),
                iconsGroup(['closed', 'tilted', 'opened']),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('window_handle'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdWindow.getWidgetInfo();
    }

    private sensorValue(index: number): unknown {
        const oid = this.state.rxData[`oid-slide-sensor${index}`];
        return oid ? this.state.values[`${oid}.val`] : undefined;
    }

    protected getIcon(): IconSpec {
        const data = this.state.rxData;
        const opened = stateValue(data.opened_value, 1);
        const closed = stateValue(data.closed_value, 0);
        const tilted = stateValue(data.tilted_value, 2);
        const count = toNumber(data.slide_count, 1) > 1 ? 2 : 1;

        let state: ContactState = 'closed';
        let suffix = '';

        if (count > 1) {
            let left: unknown;
            let right: unknown;
            for (let i = 1; i <= count; i++) {
                if (data[`slide_type${i}`] === 'left') {
                    left = this.sensorValue(i);
                }
                if (data[`slide_type${i}`] === 'right') {
                    right = this.sensorValue(i);
                }
            }
            if (looseEqual(left, tilted) || looseEqual(right, tilted)) {
                state = 'tilted';
            }
            if (looseEqual(left, opened) || looseEqual(right, opened)) {
                state = 'opened';
            }
            suffix = twoSashSuffix(left, right, closed, tilted, opened);
        } else {
            if (data.slide_type1 === 'right') {
                suffix = '_r';
            }
            let val = this.sensorValue(1);
            if (val === 'true' || val === true) {
                val = opened;
            }
            if (val === 'false' || val === false || val === undefined || val === null || val === '') {
                val = closed;
            }
            if (looseEqual(val, closed)) {
                state = 'closed';
            } else if (looseEqual(val, tilted)) {
                suffix += '_tilt';
                state = 'tilted';
            } else {
                suffix += '_open';
                state = 'opened';
            }
        }

        return contactIcon(data, state, `fts_window_${count}w${suffix}`);
    }
}
