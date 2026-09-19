import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import CamBase, { camCommonFields, camIconGroup } from './Components/CamBase';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import { isTrue } from './utils';

/** `tplMfdCamVideo` - the camera icon opens a HTML5 video (or an `<object>` with "Use object tag") */
export default class MfdCamVideo extends CamBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCamVideo',
            visName: 'Cam/Video (html5) - Dialog',
            visWidgetLabel: 'cam_video',
            visOrder: 25,
            visAttrs: [
                { name: 'common', fields: camCommonFields({ useObject: true }) },
                camIconGroup(),
                dialogGroup({
                    width: 640,
                    height: 480,
                    before: [
                        { name: 'src_url', label: 'src_url', type: 'url' },
                        { name: 'poster_url', label: 'poster_url', type: 'url' },
                    ],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_video'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCamVideo.getWidgetInfo();
    }

    /** URL of the video */
    protected getMediaUrl(): string {
        return this.state.rxData.src_url || '';
    }

    protected renderMedia(style: React.CSSProperties): React.ReactNode {
        const src = this.getMediaUrl();
        if (!src) {
            return null;
        }
        if (isTrue(this.state.rxData.use_object)) {
            return (
                <object
                    data={src}
                    style={style}
                />
            );
        }
        return (
            <video
                src={src}
                poster={this.state.rxData.poster_url || undefined}
                autoPlay
                playsInline
                style={{ ...style, background: '#000' }}
            />
        );
    }
}
