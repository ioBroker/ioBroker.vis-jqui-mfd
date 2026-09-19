import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import LevelBase, { type LevelDialogKind, type LevelScale } from './Components/LevelBase';
import {
    asButtonField,
    colorGroup,
    DEFAULT_STYLE,
    dialogGroup,
    iconColorField,
    invertIconField,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
    workingField,
} from './Components/fields';
import { invertValueField, SHUTTER_SCALE, showActiveField } from './MfdShutter';

/** `tplMfdShutterDialog` - the shutter opens a dialog with "closed / 25% / 50% / 75% / open" and a slider */
export default class MfdShutterDialog extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdShutterDialog',
            visName: 'Shutter + jqui Dialog',
            visWidgetLabel: 'shutter_dialog',
            visOrder: 8,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        workingField(),
                        ...minMaxFields(),
                        invertIconField(),
                        asButtonField(),
                        invertValueField(),
                        showActiveField(),
                        iconColorField(),
                    ],
                },
                colorGroup(),
                dialogGroup({ width: 450, height: 210, valueText: true }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('shutter_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdShutterDialog.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return SHUTTER_SCALE;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogKind(): LevelDialogKind {
        return 'shutter';
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 450, height: 210 };
    }
}
