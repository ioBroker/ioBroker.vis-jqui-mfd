import type { RxWidgetInfo, RxWidgetInfoAttributesField } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec, type MfdBaseRxData, type MfdBaseState } from './Components/MfdBase';
import { mfdImage } from './Components/MfdIcon';
import {
    asButtonField,
    DEFAULT_STYLE,
    invertIconField,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
} from './Components/fields';
import { isNotEmpty, isTrue, jqData, looseEqual } from './utils';

export interface SocketRxData extends MfdBaseRxData {
    min?: string;
    max?: string;
    invert_state?: boolean | string;
    icon_off?: string;
    iconColor_off?: string;
    icon_on?: string;
    iconColor_on?: string;
}

export const invertStateField = (): RxWidgetInfoAttributesField => ({
    name: 'invert_state',
    type: 'checkbox',
    label: 'invert_state',
});

/** "Icon for OFF", its colour, "Icon for ON", its colour */
export const onOffIconFields = (): RxWidgetInfoAttributesField[] => [
    { name: 'icon_off', type: 'image', label: 'icon_off' },
    { name: 'iconColor_off', type: 'color', label: 'iconColor_off' },
    { name: 'icon_on', type: 'image', label: 'icon_on' },
    { name: 'iconColor_on', type: 'color', label: 'iconColor_on' },
];

/** `min`/`max` of the socket as the template read them: default 0/1, numbers and `true`/`false` converted */
function socketLimit(value: string | undefined, defaultValue: number): unknown {
    return value === undefined || value === null || value === '' ? defaultValue : jqData(value);
}

/** `tplMfdSocket` - shows whether a socket is on */
export default class MfdSocket<
    RxData extends SocketRxData = SocketRxData,
    State extends MfdBaseState = MfdBaseState,
> extends MfdBase<RxData, State> {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdSocket',
            visName: 'value - Socket',
            visWidgetLabel: 'socket',
            visOrder: 5,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        ...minMaxFields(),
                        invertIconField(),
                        invertStateField(),
                        asButtonField(),
                        ...onOffIconFields(),
                    ],
                },
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('socket'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdSocket.getWidgetInfo();
    }

    /** The state as the icon sees it; the switch without object ID overrides it */
    protected getSwitchValue(): unknown {
        return this.getValue();
    }

    /**
     * `true` if the socket is on: the value differs from `min` (default 0). `true`/`false` count as max/min, and
     * "Invert state" swaps both ends.
     */
    protected isOn(): boolean {
        const data = this.state.rxData;
        const min = socketLimit(data.min, 0);
        const max = socketLimit(data.max, 1);
        const str = this.getSwitchValue();
        let val: unknown = parseFloat(str as string);
        if (str === true || str === 'true') {
            val = max;
        }
        if (str === false || str === 'false') {
            val = min;
        }
        if (isTrue(data.invert_state)) {
            val = looseEqual(val, min) ? max : min;
        }
        return !looseEqual(val, min);
    }

    protected getIcon(): IconSpec {
        const data = this.state.rxData;
        if (this.isOn()) {
            return {
                src: isNotEmpty(data.icon_on) ? data.icon_on! : mfdImage('message_socket_on'),
                color: data.iconColor_on,
            };
        }
        return {
            src: isNotEmpty(data.icon_off) ? data.icon_off! : mfdImage('message_socket_off'),
            color: data.iconColor_off,
        };
    }

    /** Pressed while the icon shows "on" */
    protected isActive(): boolean {
        return this.isOn();
    }
}
