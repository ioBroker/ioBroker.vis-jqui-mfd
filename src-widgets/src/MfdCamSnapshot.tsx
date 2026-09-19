import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import CamBase, { camCommonFields, camIconGroup } from './Components/CamBase';
import RefreshImage from './Components/RefreshImage';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import { toNumber } from './utils';

/** `tplMfdCamSnapshot` - the camera icon opens the snapshot of a camera, loaded again every 2 seconds */
export default class MfdCamSnapshot extends CamBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCamSnapshot',
            visName: 'Cam/Snapshot - Dialog',
            visWidgetLabel: 'cam_snapshot',
            visOrder: 21,
            visAttrs: [
                { name: 'common', fields: camCommonFields({}) },
                camIconGroup(),
                dialogGroup({
                    width: 640,
                    height: 480,
                    before: [
                        { name: 'url', label: 'url', type: 'url' },
                        { name: 'interval', label: 'interval', default: '2000' },
                    ],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_dialog'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCamSnapshot.getWidgetInfo();
    }

    /** URL of the snapshot */
    protected getMediaUrl(): string {
        return this.state.rxData.url || '';
    }

    protected renderMedia(style: React.CSSProperties): React.ReactNode {
        return (
            <RefreshImage
                src={this.getMediaUrl()}
                interval={toNumber(this.state.rxData.interval, 0)}
                alt={this.state.rxData.text}
                style={style}
            />
        );
    }
}
