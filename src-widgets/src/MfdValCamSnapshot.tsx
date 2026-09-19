import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import { camCommonFields, camIconGroup } from './Components/CamBase';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import MfdCamSnapshot from './MfdCamSnapshot';

/** `tplValMfdCamSnapshot` - like the snapshot camera, but the URL of the snapshot comes from a state */
export default class MfdValCamSnapshot extends MfdCamSnapshot {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplValMfdCamSnapshot',
            visName: 'Cam/Snapshot - Dialog',
            visWidgetLabel: 'cam_snapshot_oid',
            visOrder: 22,
            visAttrs: [
                { name: 'common', fields: camCommonFields({ oid: true }) },
                camIconGroup(),
                dialogGroup({
                    width: 640,
                    height: 480,
                    before: [{ name: 'interval', label: 'interval', default: '2000' }],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_dialog_oid'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdValCamSnapshot.getWidgetInfo();
    }

    protected getMediaUrl(): string {
        return this.getStateUrl();
    }
}
