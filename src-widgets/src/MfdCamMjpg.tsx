import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import CamBase, { camCommonFields, camIconGroup } from './Components/CamBase';
import RefreshImage from './Components/RefreshImage';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';

/**
 * `tplMfdCamMjpg` - the camera icon opens a MJPEG stream. The stream only runs while the dialog is open and
 * starts again when the page wakes up.
 */
export default class MfdCamMjpg extends CamBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCamMjpg',
            visName: 'Cam/Video (img) - Dialog',
            visWidgetLabel: 'cam_mjpg',
            visOrder: 23,
            visAttrs: [
                { name: 'common', fields: camCommonFields({}) },
                camIconGroup(),
                // this dialog of vis-1 had no auto close
                dialogGroup({
                    width: 640,
                    height: 480,
                    autoclose: false,
                    before: [{ name: 'url', label: 'url', type: 'url' }],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCamMjpg.getWidgetInfo();
    }

    /** URL of the stream */
    protected getMediaUrl(): string {
        return this.state.rxData.url || '';
    }

    protected renderMedia(style: React.CSSProperties): React.ReactNode {
        return (
            <RefreshImage
                src={this.getMediaUrl()}
                refreshOnWakeUp
                alt={this.state.rxData.text}
                style={style}
            />
        );
    }
}
