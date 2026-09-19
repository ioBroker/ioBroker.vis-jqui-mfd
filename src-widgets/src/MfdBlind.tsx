import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import LevelBase, { type LevelScale } from './Components/LevelBase';
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

/**
 * The awning, drawn for the exact value. Its five steps only choose the colour, named after the steps:
 * `iconColor25`, but `iconColor5` for 50%.
 */
export const BLIND_SCALE: LevelScale = {
    shape: 'awning',
    bands: [
        { at: 1, image: 'fts_markise_100', color: 'iconColor10' },
        { at: 0.75, image: 'fts_markise_75', color: 'iconColor75' },
        { at: 0.5, image: 'fts_markise_50', color: 'iconColor5' },
        { at: 0.25, image: 'fts_markise_25', color: 'iconColor25' },
    ],
    fallback: { image: 'fts_markise_0', color: 'iconColor0' },
};

export const BLIND_COLORS = [0, 25, 5, 75, 10];

/** `tplMfdBlind` - shows how far an awning is extended */
export default class MfdBlind extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdBlind',
            // vis-1 called it "Shutter" as well
            visName: 'Blind',
            visWidgetLabel: 'blind',
            visOrder: 9,
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
                colorGroup(BLIND_COLORS),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('blind'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdBlind.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return BLIND_SCALE;
    }
}
