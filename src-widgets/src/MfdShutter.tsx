import type { RxWidgetInfo, RxWidgetInfoAttributesField } from '@iobroker/types-vis-2';

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
 * The shutter, drawn for the exact value: at `max` (open) the plain window, the lower the value the further the
 * slats come down. The eleven steps of vis-1 (the bands) now only choose the colour.
 */
export const SHUTTER_SCALE: LevelScale = {
    shape: 'shutter',
    bands: tenSteps('fts_shutter'),
    fallback: { image: 'fts_window_2w', color: 'iconColor0' },
    reversed: true,
};

export const invertValueField = (): RxWidgetInfoAttributesField => ({
    name: 'invert_value',
    type: 'checkbox',
    label: 'invert_value',
});

export const showActiveField = (): RxWidgetInfoAttributesField => ({
    name: 'show_active',
    type: 'checkbox',
    label: 'show_active',
    tooltip: 'show_active_tooltip',
});

/** `tplMfdShutter` - shows the position of a shutter */
export default class MfdShutter extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdShutter',
            visName: 'Shutter',
            visWidgetLabel: 'shutter',
            visOrder: 7,
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
            visPrev: preview('shutter'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdShutter.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return SHUTTER_SCALE;
    }
}
