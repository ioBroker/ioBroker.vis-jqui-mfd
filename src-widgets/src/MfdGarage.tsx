import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import { DEFAULT_STYLE, mfdInfo, preview } from './Components/fields';
import { contactCommonFields, iconsGroup, TwoStateContact, valuesGroup } from './MfdWindowBool';

/** `tplMfdGarage` - a garage door: closed or opened */
export default class MfdGarage extends TwoStateContact {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdGarage',
            visName: 'val - Garage',
            visWidgetLabel: 'garage',
            visOrder: 16,
            visAttrs: [
                { name: 'common', fields: contactCommonFields() },
                valuesGroup(['closed', 'opened']),
                iconsGroup(['closed', 'opened']),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('garage'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdGarage.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getImages(): { closed: string; opened: string } {
        return { closed: 'fts_garage_door_100', opened: 'fts_garage_door_10' };
    }
}
