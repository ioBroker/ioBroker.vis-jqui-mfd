import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec } from './Components/MfdBase';
import { DEFAULT_STYLE, mfdInfo, preview } from './Components/fields';
import { isTrue, looseEqual } from './utils';
import {
    contactCommonFields,
    contactIcon,
    iconsGroup,
    valuesGroup,
    type ContactRxData,
    type ContactState,
} from './MfdWindowBool';

/** A configured value of a state, or its default if the field is empty */
function stateValue(value: string | undefined, defaultValue: number): unknown {
    return value === undefined || value === '' ? defaultValue : value;
}

/**
 * `tplMfdDoor` - a door with the three states closed (0), tilted (2) and opened (1).
 *
 * "Invert state" only swaps the pressed look of the button, not the image - exactly as in vis-1.
 */
export default class MfdDoor extends MfdBase<ContactRxData> {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdDoor',
            visName: 'val - Door',
            visWidgetLabel: 'door',
            visOrder: 15,
            visAttrs: [
                { name: 'common', fields: contactCommonFields() },
                valuesGroup(['closed', 'tilted', 'opened']),
                iconsGroup(['closed', 'tilted', 'opened']),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('door'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdDoor.getWidgetInfo();
    }

    private getDoorState(): ContactState {
        const data = this.state.rxData;
        const opened = stateValue(data.opened_value, 1);
        const closed = stateValue(data.closed_value, 0);
        const tilted = stateValue(data.tilted_value, 2);

        let val = this.getValue();
        if (val === 'true' || val === true) {
            val = opened;
        }
        if (val === 'false' || val === false || val === undefined || val === null) {
            val = closed;
        }
        if (looseEqual(val, closed)) {
            return 'closed';
        }
        if (looseEqual(val, tilted)) {
            return 'tilted';
        }
        return 'opened';
    }

    protected getIcon(): IconSpec {
        const state = this.getDoorState();
        const images: Record<ContactState, string> = {
            closed: 'fts_door',
            tilted: 'fts_door_tilt',
            opened: 'fts_door_open',
        };
        return contactIcon(this.state.rxData, state, images[state]);
    }

    /** Pressed while the door is not closed, or - with "Invert state" - while it is closed */
    protected isActive(): boolean {
        const open = this.getDoorState() !== 'closed';
        return isTrue(this.state.rxData.invert_state) ? !open : open;
    }
}
