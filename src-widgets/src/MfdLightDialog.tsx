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
import { LIGHT_SCALE } from './MfdLight';

/** `tplMfdLightDialog` - the lamp opens a dialog with "off / 25% / 50% / 75% / 100%" and a slider */
export default class MfdLightDialog extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdLightDialog',
            visName: 'Dimmer + jqui Dialog',
            visWidgetLabel: 'dimmer_dialog',
            visOrder: 4,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        workingField(),
                        ...minMaxFields(),
                        invertIconField(),
                        asButtonField(),
                        iconColorField(),
                    ],
                },
                colorGroup(),
                dialogGroup({ width: 470, height: 210, valueText: true }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('dimmer_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdLightDialog.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return LIGHT_SCALE;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogKind(): LevelDialogKind {
        return 'dimmer';
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 470, height: 210 };
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return true;
    }

    protected isActive(): boolean {
        return this.getNumericValue() > this.getRange().min;
    }
}
