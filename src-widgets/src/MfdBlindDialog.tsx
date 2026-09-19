import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import LevelBase, { type LevelScale } from './Components/LevelBase';
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
import { invertValueField, showActiveField } from './MfdShutter';
import { BLIND_COLORS, BLIND_SCALE } from './MfdBlind';

/** `tplMfdBlindDialog` - the awning opens a dialog with "closed / 25% / 50% / 75% / open" and a slider */
export default class MfdBlindDialog extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdBlindDialog',
            visName: 'Blind + jqui Dialog',
            visWidgetLabel: 'blind_dialog',
            visOrder: 10,
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
                colorGroup(BLIND_COLORS),
                dialogGroup({ width: 450, height: 210, valueText: true }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('blind_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdBlindDialog.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return BLIND_SCALE;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 450, height: 210 };
    }
}
