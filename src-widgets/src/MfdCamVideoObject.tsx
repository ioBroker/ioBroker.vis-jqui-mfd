import React from 'react';

import type { RxWidgetInfo } from '@iobroker/types-vis-2';

import CamBase, { camCommonFields, camIconGroup } from './Components/CamBase';
import { DEFAULT_STYLE, dialogGroup, mfdInfo, preview } from './Components/fields';
import { cssSize } from './utils';

const MIME_TYPES = [
    'video/mpeg',
    'video/mp4',
    'video/ogg',
    'video/quicktime',
    'video/webm',
    'video/x-ms-wmv',
    'video/x-flv',
];

/**
 * `tplMfdCamVideoObject` - the camera icon opens a video in an `<object>`/`<embed>` for a browser plug-in. The
 * QuickTime settings (`qtsrc`, `plugin`, `autoplay`) are passed on as they are.
 */
export default class MfdCamVideoObject extends CamBase {
    static getWidgetInfo(): RxWidgetInfo {
        return mfdInfo({
            id: 'tplMfdCamVideoObject',
            visName: 'Cam/Video (Object) - Dialog',
            visWidgetLabel: 'cam_video_object',
            visOrder: 27,
            visAttrs: [
                { name: 'common', fields: camCommonFields({}) },
                camIconGroup(),
                dialogGroup({
                    width: 640,
                    height: 480,
                    before: [
                        { name: 'src_url', label: 'src_url', type: 'url' },
                        { name: 'qtsrc_url', label: 'qtsrc_url', type: 'url' },
                    ],
                    after: [
                        {
                            name: 'type_application',
                            label: 'type_application',
                            type: 'auto',
                            options: MIME_TYPES,
                            noTranslation: true,
                            default: 'video/quicktime',
                        },
                        { name: 'plugin', label: 'plugin' },
                        { name: 'autoplay', label: 'autoplay', default: 'true' },
                    ],
                }),
            ],
            visDefaultStyle: DEFAULT_STYLE,
            visPrev: preview('cam_video'),
        });
    }

    // eslint-disable-next-line class-methods-use-this
    getWidgetInfo(): RxWidgetInfo {
        return MfdCamVideoObject.getWidgetInfo();
    }

    protected renderMedia(style: React.CSSProperties): React.ReactNode {
        const data = this.state.rxData;
        if (!data.src_url) {
            return null;
        }
        const width = cssSize(data.dialog_width) || '640px';
        const height = style.height as string;
        // no React props: lower-case unknown attributes reach the DOM as they are
        const pluginAttributes: Record<string, string> = {
            qtsrc: data.qtsrc_url || '',
            autoplay: String(data.autoplay ?? ''),
            enablejavascript: 'true',
            plugin: data.plugin || '',
        };
        return (
            <object
                style={{ ...style, width }}
                width={width}
                height={height}
            >
                <embed
                    type={data.type_application || 'video/quicktime'}
                    src={data.src_url}
                    width={width}
                    height={height}
                    {...pluginAttributes}
                />
            </object>
        );
    }
}
