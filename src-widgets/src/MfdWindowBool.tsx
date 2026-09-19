import type { RxWidgetInfo, RxWidgetInfoAttributesField, RxWidgetInfoGroup } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec, type MfdBaseRxData } from './Components/MfdBase';
import { mfdImage } from './Components/MfdIcon';
import {
    asButtonField,
    DEFAULT_STYLE,
    iconColorField,
    invertIconField,
    mfdInfo,
    oidField,
    preview,
} from './Components/fields';
import { isNotEmpty, isTrue, looseEqual } from './utils';
import { invertStateField } from './MfdSocket';

export interface ContactRxData extends MfdBaseRxData {
    invert_state?: boolean | string;
    closed_value?: string;
    tilted_value?: string;
    opened_value?: string;
    closed_icon?: string;
    closed_iconColor?: string;
    tilted_icon?: string;
    tilted_iconColor?: string;
    opened_icon?: string;
    opened_iconColor?: string;
}

export type ContactState = 'closed' | 'tilted' | 'opened';

/** The fields of the group "values" for the given states */
export function valuesGroup(states: ContactState[]): RxWidgetInfoGroup {
    return {
        name: 'values',
        label: 'group_values',
        fields: states.map(
            (state): RxWidgetInfoAttributesField => ({
                name: `${state}_value`,
                label: `${state}_value`,
                tooltip: `${state}_value_tooltip`,
            }),
        ),
    };
}

/** The fields of the group "icons" for the given states */
export function iconsGroup(states: ContactState[]): RxWidgetInfoGroup {
    return {
        name: 'icons',
        label: 'group_icons',
        fields: states.flatMap((state): RxWidgetInfoAttributesField[] => [
            { name: `${state}_icon`, type: 'image', label: `${state}_icon` },
            { name: `${state}_iconColor`, type: 'color', label: `${state}_iconColor` },
        ]),
    };
}

/** The common group of the window, the roof window, the door and the garage */
export const contactCommonFields = (): RxWidgetInfoAttributesField[] => [
    oidField(),
    invertIconField(),
    invertStateField(),
    asButtonField(),
    iconColorField(),
];

/** Image and colour of a state: the icon of the user or the built-in one, the colour of the state or the common one */
export function contactIcon(data: ContactRxData, state: ContactState, defaultImage: string): IconSpec {
    return {
        src: isNotEmpty(data[`${state}_icon`]) ? data[`${state}_icon`]! : mfdImage(defaultImage),
        color: data[`${state}_iconColor`] || data.iconColor,
    };
}

/**
 * Base of the window, the roof window and the garage: a contact with the two states closed and opened.
 *
 * Without "Value for OPENED" every number above 0 (and `true`) is open. With it, only exactly that value is open,
 * everything else closed. "Invert state" swaps both.
 */
export abstract class TwoStateContact extends MfdBase<ContactRxData> {
    /** Built-in images for closed and opened */
    protected abstract getImages(): { closed: string; opened: string };

    protected isOpened(): boolean {
        const data = this.state.rxData;
        let opened: unknown = data.opened_value;
        let closed: unknown = data.closed_value;
        let val = this.getValue();

        if (opened === undefined || opened === '' || opened === null) {
            opened = 1;
            closed = 0;
            if (val === 'true' || val === true) {
                val = opened;
            }
            if (val === 'false' || val === false) {
                val = closed;
            }
            val = parseFloat(val) || 0;
            val = val > (closed as number) ? opened : closed;
        }
        if (isTrue(data.invert_state)) {
            val = looseEqual(val, opened) ? closed : opened;
        }
        return looseEqual(val, opened);
    }

    protected getIcon(): IconSpec {
        const images = this.getImages();
        return this.isOpened()
            ? contactIcon(this.state.rxData, 'opened', images.opened)
            : contactIcon(this.state.rxData, 'closed', images.closed);
    }

    /** Pressed while it is open */
    protected isActive(): boolean {
        return this.isOpened();
    }
}

/** `tplMfdWindowBool` - a window with one contact: closed or opened */
export default class MfdWindowBool extends TwoStateContact {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdWindowBool',
            visName: 'Window',
            visWidgetLabel: 'window',
            visOrder: 13,
            visAttrs: [
                { name: 'common', fields: contactCommonFields() },
                valuesGroup(['closed', 'opened']),
                iconsGroup(['closed', 'opened']),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('window'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdWindowBool.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getImages(): { closed: string; opened: string } {
        return { closed: 'fts_window_1w', opened: 'fts_window_1w_open' };
    }
}
