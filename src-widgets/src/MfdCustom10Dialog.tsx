import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import {
    asButtonField,
    DEFAULT_STYLE,
    dialogGroup,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
    workingField,
} from './Components/fields';
import { invertValueField, showActiveField } from './MfdShutter';
import { Custom10Base, imagesGroup } from './MfdCustom10';

/** `tplMfdCustom10Dialog` - Custom10 opening a dialog with "closed / 25% / 50% / 75% / open" and a slider */
export default class MfdCustom10Dialog extends Custom10Base {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCustom10Dialog',
            visName: 'Custom10 + jqui Dialog',
            visWidgetLabel: 'custom10_dialog',
            visOrder: 20,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        workingField(),
                        ...minMaxFields(),
                        asButtonField(),
                        invertValueField(),
                        showActiveField(),
                    ],
                },
                dialogGroup({ width: 440, height: 200, valueText: true }),
                imagesGroup(),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('custom10_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCustom10Dialog.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }
}
