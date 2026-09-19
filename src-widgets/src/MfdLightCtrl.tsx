import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import LevelBase, { type LevelScale } from './Components/LevelBase';
import { nextToggleValue } from './Components/toggle';
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
import { LIGHT_SCALE } from './MfdLight';

/** `tplMfdLightCtrl` - the lamp as switch: a click toggles between min and max */
export default class MfdLightCtrl extends LevelBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdLightCtrl',
            visName: 'ctrl - Light',
            visWidgetLabel: 'light_ctrl',
            visOrder: 2,
            visAttrs: [
                {
                    name: 'common',
                    fields: [oidField(), ...minMaxFields(), invertIconField(), asButtonField(), iconColorField()],
                },
                colorGroup(),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('light_ctrl'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdLightCtrl.getWidgetInfo();
    }

    // eslint-disable-next-line class-methods-use-this
    protected getScale(): LevelScale {
        return LIGHT_SCALE;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return true;
    }

    protected isActive(): boolean {
        return this.getNumericValue() > this.getRange().min;
    }

    protected isClickable(): boolean {
        return !!this.state.rxData.oid;
    }

    protected onAction(): void {
        const data = this.state.rxData;
        if (data.oid) {
            this.setValue(data.oid, nextToggleValue(this.getValue(), data.min, data.max));
        }
    }
}
