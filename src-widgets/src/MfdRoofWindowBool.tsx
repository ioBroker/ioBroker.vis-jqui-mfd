import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import { DEFAULT_STYLE, mfdInfo, preview } from './Components/fields';
import { contactCommonFields, iconsGroup, TwoStateContact, valuesGroup } from './MfdWindowBool';

/** `tplMfdRoofWindowBool` - a roof window with one contact: closed or opened */
export default class MfdRoofWindowBool extends TwoStateContact {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdRoofWindowBool',
            visName: 'Roof window',
            visWidgetLabel: 'roof_window',
            visOrder: 14,
            visAttrs: [
                { name: 'common', fields: contactCommonFields() },
                valuesGroup(['closed', 'opened']),
                iconsGroup(['closed', 'opened']),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('roof_window'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdRoofWindowBool.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getImages(): { closed: string; opened: string } {
        return { closed: 'fts_window_roof', opened: 'fts_window_roof_open_2' };
    }
}
