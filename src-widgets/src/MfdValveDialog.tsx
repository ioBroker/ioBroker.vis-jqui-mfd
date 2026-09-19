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
import { VALVE_SCALE } from './MfdValve';

/** `tplMfdValveDialog` - the valve opens a dialog with "closed / 25% / 50% / 75% / open" and a slider */
export default class MfdValveDialog extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdValveDialog',
            visName: 'Valve + jqui Dialog',
            visWidgetLabel: 'valve_dialog',
            visOrder: 18,
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
                        invertValueField(),
                        showActiveField(),
                    ],
                },
                colorGroup(),
                dialogGroup({ width: 440, height: 200, valueText: true }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('valve_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdValveDialog.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return VALVE_SCALE;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }
}
