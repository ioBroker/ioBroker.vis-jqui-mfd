import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import LevelBase, { tenSteps, type LevelScale } from './Components/LevelBase';
import {
    asButtonField,
    colorGroup,
    DEFAULT_STYLE,
    iconColorField,
    invertIconField,
    mfdInfo,
    minMaxFields,
    oidField,
    preview,
} from './Components/fields';
import { invertValueField, showActiveField } from './MfdShutter';

/** The valve, drawn for the exact value: the disk turns from closed to open. The eleven steps only choose the colour */
export const VALVE_SCALE: LevelScale = {
    shape: 'valve',
    bands: tenSteps('sani_valve'),
    fallback: { image: 'sani_valve_0', color: 'iconColor0' },
};

/** `tplMfdValve` - shows the position of a valve */
export default class MfdValve extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdValve',
            visName: 'Valve',
            visWidgetLabel: 'valve',
            visOrder: 17,
            visAttrs: [
                {
                    name: 'common',
                    fields: [
                        oidField(),
                        ...minMaxFields(),
                        invertIconField(),
                        asButtonField(),
                        iconColorField(),
                        invertValueField(),
                        showActiveField(),
                    ],
                },
                colorGroup(),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('valve'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdValve.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return VALVE_SCALE;
    }
}
