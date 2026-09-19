import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import { camCommonFields, camIconGroup } from './Components/CamBase';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import MfdCamMjpg from './MfdCamMjpg';

/** `tplValMfdCamMjpg` - like the MJPEG camera, but the URL of the stream comes from a state */
export default class MfdValCamMjpg extends MfdCamMjpg {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplValMfdCamMjpg',
            visName: 'Cam/Video (img) - Dialog',
            visWidgetLabel: 'cam_mjpg_oid',
            visOrder: 24,
            visAttrs: [
                { name: 'common', fields: camCommonFields({ oid: true, text: false }) },
                camIconGroup(),
                dialogGroup({ width: 640, height: 480 }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_dialog_oid'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdValCamMjpg.getWidgetInfo();
    }

    protected getMediaUrl(): string {
        return this.getStateUrl();
    }
}
