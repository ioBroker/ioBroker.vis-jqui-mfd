import type { RxWidgetInfo, RxWidgetInfoGroup } from '@iobroker/types-vis-2';

import LevelBase, { type LevelScale } from './Components/LevelBase';
import type { IconSpec } from './Components/MfdBase';
import { mfdImage } from './Components/MfdIcon';
import { asButtonField, DEFAULT_STYLE, mfdInfo, minMaxFields, oidField, preview } from './Components/fields';
import { isNotEmpty, looseEqual, pickBand, type LevelBand } from './utils';
import { invertValueField, showActiveField } from './MfdShutter';

const STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * The steps of Custom10 name the ATTRIBUTE that holds the image (`icon0` ... `icon10`), not the image itself -
 * every image is chosen by the user.
 */
const CUSTOM_SCALE: LevelScale = {
    bands: STEPS.slice(1)
        .reverse()
        .map((i): LevelBand => ({ at: i / 10, image: `icon${i}`, color: `iconColor${i}` })),
    fallback: { image: 'icon0', color: 'iconColor0' },
    boolAsLimits: true,
};

/** The group "images": value, image and colour of each of the eleven steps, preset with the valve images */
export function imagesGroup(): RxWidgetInfoGroup {
    return {
        name: 'images',
        label: 'group_images',
        fields: STEPS.flatMap(i => [
            { name: `iconValue${i}`, label: `iconValue${i}`, tooltip: 'iconValue_tooltip' },
            { name: `icon${i}`, type: 'image' as const, label: `icon${i}`, default: mfdImage(`sani_valve_${i * 10}`) },
            { name: `iconColor${i}`, type: 'color' as const, label: `iconColor${i}` },
        ]),
    };
}

/** Image choice of Custom10 and Custom10 + dialog */
export abstract class Custom10Base extends LevelBase {
    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return CUSTOM_SCALE;
    }

    /**
     * First the steps whose "Icon value" equals the state (loosely, `'1'` matches `1`), then - if none matched -
     * the step of the range between min and max, like the valve.
     */
    protected getIcon(): IconSpec | null {
        const data = this.state.rxData;
        const raw = this.getValue();

        let image: string | undefined;
        let color: string | undefined;
        for (const i of STEPS) {
            const value = data[`iconValue${i}`];
            if (isNotEmpty(value) && looseEqual(value, raw)) {
                image = data[`icon${i}`];
                color = isNotEmpty(data[`iconColor${i}`]) ? data[`iconColor${i}`] : data.iconColor;
                break;
            }
        }

        if (!image && !color) {
            const { min, max } = this.getRange();
            const band = pickBand(this.getLevel(), min, max, CUSTOM_SCALE.bands, CUSTOM_SCALE.fallback);
            image = data[band.image];
            color = isNotEmpty(data[band.color]) ? data[band.color] : data.iconColor;
        }

        return image ? { src: image, color } : null;
    }
}

/** `tplMfdCustom10` - eleven images of your own, chosen by value or by the step of the range */
export default class MfdCustom10 extends Custom10Base {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCustom10',
            visName: 'Custom10',
            visWidgetLabel: 'custom10',
            visOrder: 19,
            visAttrs: [
                {
                    name: 'common',
                    fields: [oidField(), ...minMaxFields(), asButtonField(), invertValueField(), showActiveField()],
                },
                imagesGroup(),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('custom10'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCustom10.getWidgetInfo();
    }
}
