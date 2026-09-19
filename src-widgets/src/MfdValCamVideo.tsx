import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import { camCommonFields, camIconGroup } from './Components/CamBase';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import MfdCamVideo from './MfdCamVideo';

/** `tplValMfdCamVideo` - like the HTML5 video camera, but the URL of the video comes from a state */
export default class MfdValCamVideo extends MfdCamVideo {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplValMfdCamVideo',
            visName: 'Cam/Video (html5) - Dialog',
            visWidgetLabel: 'cam_video_oid',
            visOrder: 26,
            visAttrs: [
                { name: 'common', fields: camCommonFields({ oid: true, text: false, useObject: true }) },
                camIconGroup(),
                dialogGroup({
                    width: 640,
                    height: 480,
                    before: [{ name: 'poster_url', label: 'poster_url', type: 'url' }],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_video_oid'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdValCamVideo.getWidgetInfo();
    }

    protected getMediaUrl(): string {
        return this.getStateUrl();
    }
}
