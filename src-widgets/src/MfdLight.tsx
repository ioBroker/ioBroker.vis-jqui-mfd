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

/**
 * The lamp, drawn for the exact value: below 1% switched off, above it the rays light up one after the other. The
 * eleven steps of vis-1 (the bands) now only choose the colour: `iconColor0` ... `iconColor10`.
 */
export const LIGHT_SCALE: LevelScale = {
    shape: 'lamp',
    bands: [...tenSteps('light_light_dim'), { at: 0.01, image: 'light_light_dim_00', color: 'iconColor0' }],
    fallback: { image: 'light_light_dim', color: 'iconColor0' },
    boolAsLimits: true,
};

/** `tplMfdLight` - shows the brightness of a lamp. The button is pressed while the lamp is on */
export default class MfdLight extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdLight',
            visName: 'Light/Dimmer',
            visWidgetLabel: 'light',
            visOrder: 1,
            visAttrs: [
                {
                    name: 'common',
                    fields: [oidField(), ...minMaxFields(), invertIconField(), asButtonField(), iconColorField()],
                },
                colorGroup(),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('light'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdLight.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return LIGHT_SCALE;
    }

    protected isActive(): boolean {
        return this.getNumericValue() > this.getRange().min;
    }
}
