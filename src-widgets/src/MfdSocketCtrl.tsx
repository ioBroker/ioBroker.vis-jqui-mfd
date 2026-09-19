import type { RxWidgetInfo, VisRxWidgetProps } from '@iobroker/types-vis-2';

import type { MfdBaseState } from './Components/MfdBase';
import { nextToggleValue } from './Components/toggle';
import {
    asButtonField,
    DEFAULT_STYLE,
    invertIconField,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
} from './Components/fields';
import { isNotEmpty, jqDataOrUndefined, looseEqual } from './utils';
import MfdSocket, { invertStateField, onOffIconFields, type SocketRxData } from './MfdSocket';

interface SocketCtrlRxData extends SocketRxData {
    urlTrue?: string;
    urlFalse?: string;
    oidTrue?: string;
    oidFalse?: string;
    oidTrueValue?: string;
    oidFalseValue?: string;
}

interface SocketCtrlState extends MfdBaseState {
    /** State of a switch without object ID, which only calls URLs or writes other objects */
    localOn: boolean;
}

/** A configured value to write: empty is "not configured", `'true'`/`'1'` become `true`/`1` */
function configuredValue(value: string | undefined, fallback: unknown): string | number | boolean {
    const converted = isNotEmpty(value) ? jqDataOrUndefined(value) : undefined;
    return (converted === undefined ? fallback : converted) as string | number | boolean;
}

/**
 * `tplMfdSocketCtrl` - the socket as switch.
 *
 * Without extra settings a click toggles the object between min and max. With "Object ID for ON/OFF" or "URL for
 * ON/OFF" it writes these objects or calls these URLs instead - `vis.binds.basic.toggle` of vis-1. Without an
 * object ID the widget then remembers its state itself.
 */
export default class MfdSocketCtrl extends MfdSocket<SocketCtrlRxData, SocketCtrlState> {
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, localOn: false };
    }

    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdSocketCtrl',
            visName: 'ctrl - Socket',
            visWidgetLabel: 'socket_ctrl',
            visOrder: 6,
            visAttrs: [
                {
                    name: 'common',
                    fields: [oidField(), ...minMaxFields(), invertStateField(), asButtonField()],
                },
                {
                    name: 'icon',
                    label: 'group_icon',
                    fields: [invertIconField(), ...onOffIconFields()],
                },
                {
                    name: 'ccontrol',
                    label: 'group_ccontrol',
                    fields: [
                        { name: 'urlTrue', label: 'urlTrue', type: 'url' },
                        { name: 'urlFalse', label: 'urlFalse', type: 'url', tooltip: 'urlFalse_tooltip' },
                        { name: 'oidTrue', type: 'id', label: 'oidTrue' },
                        { name: 'oidFalse', type: 'id', label: 'oidFalse', tooltip: 'oidFalse_tooltip' },
                        { name: 'oidTrueValue', label: 'oidTrueValue', tooltip: 'oidTrueValue_tooltip' },
                        { name: 'oidFalseValue', label: 'oidFalseValue', tooltip: 'oidFalseValue_tooltip' },
                    ],
                },
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('socket_ctrl'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdSocketCtrl.getWidgetInfo();
    }

    private hasOid(): boolean {
        const oid = this.state.rxData.oid;
        return !!oid && oid !== 'nothing_selected';
    }

    protected getSwitchValue(): unknown {
        if (this.hasOid()) {
            return this.getValue();
        }
        return this.state.localOn;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return true;
    }

    protected isClickable(): boolean {
        const data = this.state.rxData;
        return this.hasOid() || !!data.oidTrue || !!data.urlTrue;
    }

    private httpGet(url: string | undefined): void {
        if (url) {
            (this.props.context.socket as any)?.getRawSocket?.()?.emit('httpGet', url);
        }
    }

    protected onAction(): void {
        const data = this.state.rxData;
        if (!this.isClickable()) {
            return;
        }

        if (!data.oidTrue && !data.urlTrue) {
            this.setValue(data.oid, nextToggleValue(this.getValue(), data.min, data.max));
            return;
        }

        const min = jqDataOrUndefined(data.min);
        const max = jqDataOrUndefined(data.max);

        // the new state: the opposite of the current one
        let on: boolean;
        if (!this.hasOid()) {
            on = !this.state.localOn;
            this.setState({ localOn: on });
        } else {
            const val = this.getValue();
            if (max !== undefined) {
                on = looseEqual(val === 'true' ? true : val === 'false' ? false : val, max);
            } else {
                on = val === 1 || val === '1' || val === true || val === 'true';
            }
            on = !on;
        }

        if (data.oidTrue) {
            if (on) {
                this.setValue(data.oidTrue, configuredValue(data.oidTrueValue, max === undefined ? true : max));
            } else {
                this.setValue(
                    data.oidFalse || data.oidTrue,
                    configuredValue(data.oidFalseValue, min === undefined ? false : min),
                );
            }
        }
        if (data.urlTrue) {
            this.httpGet(on ? data.urlTrue : data.urlFalse || data.urlTrue);
        }
    }
}
