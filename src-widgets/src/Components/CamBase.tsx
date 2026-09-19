import React from 'react';

import type { RxWidgetInfoAttributesField, RxWidgetInfoGroup } from '@iobroker/types-vis-2';

import MfdBase, { type IconSpec, type MfdBaseRxData } from './MfdBase';
import MfdIcon, { mfdImage } from './MfdIcon';
import RefreshImage from './RefreshImage';
import { asButtonField, iconColorField, invertIconField } from './fields';
import { cssSize, isTrue, toNumber } from '../utils';

export interface CamRxData extends MfdBaseRxData {
    alt?: string;
    text?: string;
    icon?: string;
    icon_interval?: string | number;
    url?: string;
    interval?: string | number;
    use_object?: boolean | string;
    src_url?: string;
    poster_url?: string;
    qtsrc_url?: string;
    type_application?: string;
    plugin?: string;
    autoplay?: string | boolean;
}

/** The common group of the cameras: `oid` only for the versions that take the URL from a state */
export function camCommonFields(options: {
    oid?: boolean;
    text?: boolean;
    useObject?: boolean;
}): RxWidgetInfoAttributesField[] {
    const fields: RxWidgetInfoAttributesField[] = [];
    if (options.oid) {
        fields.push({ name: 'oid', type: 'id', label: 'oid_url', tooltip: 'oid_url_tooltip' });
    }
    fields.push({ name: 'alt', label: 'alt' });
    if (options.text !== false) {
        fields.push({ name: 'text', label: 'text' });
    }
    fields.push(asButtonField(), iconColorField());
    if (options.useObject) {
        fields.push({ name: 'use_object', type: 'checkbox', label: 'use_object' });
    }
    return fields;
}

/** The group "icon" of the cameras */
export function camIconGroup(): RxWidgetInfoGroup {
    return {
        name: 'icon',
        label: 'group_icon',
        fields: [
            { name: 'icon', type: 'image', label: 'icon' },
            invertIconField(),
            { name: 'icon_interval', label: 'icon_interval', tooltip: 'icon_interval_tooltip' },
        ],
    };
}

/**
 * Base of the camera widgets: a camera icon (or an image of your own, which can reload itself, e.g. a snapshot)
 * with a text under it, opening a dialog with the picture or the video.
 *
 * The content of the dialog only exists while the dialog is open, so a stream only runs while it is visible.
 */
export default abstract class CamBase extends MfdBase<CamRxData> {
    /** The picture or the video in the dialog */
    protected abstract renderMedia(style: React.CSSProperties): React.ReactNode;

    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return true;
    }

    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return true;
    }

    /** The cameras have no object ID to stand in for a missing title */
    protected getDialogTitle(): string {
        return this.state.rxData.title || '';
    }

    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 640, height: 480 };
    }

    /** The picture fills the dialog; vis-1 hid the scroll bars of the camera dialogs */
    protected getDialogContentStyle(): React.CSSProperties {
        const data = this.state.rxData;
        return {
            padding: 0,
            overflowX: (data.overflowX as React.CSSProperties['overflowX']) || 'hidden',
            overflowY: (data.overflowY as React.CSSProperties['overflowY']) || 'hidden',
        };
    }

    /** URL from the state - the versions with object ID show what the state contains */
    protected getStateUrl(): string {
        const value = this.getValue();
        return value === undefined || value === null ? '' : String(value);
    }

    protected getIcon(): IconSpec {
        return { src: this.state.rxData.icon || mfdImage('it_camera'), color: this.state.rxData.iconColor };
    }

    protected renderContent(): React.ReactNode {
        const data = this.state.rxData;
        const icon = this.getIcon();
        const interval = this.props.editMode ? 0 : toNumber(data.icon_interval, 0);
        const invert = isTrue(data.invert_icon);
        return (
            <>
                {data.icon && interval > 0 ? (
                    <RefreshImage
                        className="mfd-icon"
                        src={data.icon}
                        interval={interval}
                        alt={data.alt}
                        style={{ height: '100%', verticalAlign: 'middle', filter: invert ? 'invert(1)' : undefined }}
                    />
                ) : (
                    <MfdIcon
                        src={icon.src}
                        color={this.getIconColor(icon.color)}
                        invert={invert}
                        alt={data.alt}
                        fit="height"
                    />
                )}
                {data.text || null}
            </>
        );
    }

    protected renderDialogContent(): React.ReactNode {
        const size = this.getDialogSize();
        const height = cssSize(this.state.rxData.dialog_height) || `${size.height}px`;
        return this.renderMedia({ display: 'block', width: '100%', height, border: 'none', objectFit: 'contain' });
    }
}
