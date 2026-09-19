import React from 'react';

import type { RxRenderWidgetProps, VisRxWidgetProps, VisRxWidgetState } from '@iobroker/types-vis-2';

import Generic from '../Generic';
import MfdIcon from './MfdIcon';
import MfdDialog from './MfdDialog';
import { getThemeColors, widgetVars, type MfdThemeColors } from './theme';
import { autoCloseTime, isTrue, toNumber } from '../utils';
import '../styles.css';

/** Attributes every widget of the set may have */
export interface MfdBaseRxData {
    /** "vis-2 theme": draw in the colours of the vis-2 theme. Missing in widgets from vis-1 - they keep that look */
    mui?: boolean | string;
    oid?: string;
    'oid-working'?: string;
    asButton?: boolean | string;
    invert_icon?: boolean | string;
    iconColor?: string;

    // the dialog widgets
    title?: string;
    noHeader?: boolean | string;
    autoclose?: number | string | boolean;
    modal?: boolean | string;
    dialog_width?: string | number;
    dialog_height?: string | number;
    dialog_top?: string | number;
    dialog_left?: string | number;
    overflowX?: string;
    overflowY?: string;
}

export interface MfdBaseState extends VisRxWidgetState {
    hover: boolean;
    dialogOpen: boolean;
}

/** The icon inside the button */
export interface IconSpec {
    src: string;
    /** Colour for the white parts of the SVG, empty keeps it white */
    color?: string;
}

/**
 * Base of all widgets of the set: an icon on a button, in one of two looks.
 *
 * **vis-2 theme** (`mui` on - the default of a new widget): the button is a surface in the colours of the MUI theme
 * of vis-2 (`context.theme`), pressed it takes the primary colour; the icon takes the text colour of the theme. The
 * dialog uses the same colours.
 *
 * **vis-1 look** (`mui` missing or off - every widget that comes from vis-1): vis-1 put the classes
 * `ui-widget ui-button ui-corner-all ui-state-default` on the widget div when "Button rectangle" was on. They land on
 * the same div here (`props.className` is what vis-2 puts on the widget), so the jQuery UI theme of the view - vis-2
 * still loads it - draws the button exactly like before, and a CSS class of the user keeps working.
 * `ui-state-active` and `ui-state-hover` follow the state and the mouse like `vis.binds.jqueryui.active` and
 * `vis.binds.jqueryui.classes` did. The icons stay white.
 *
 * The dialog widgets additionally open an `MfdDialog` on click; its settings are the same for all of them.
 */
export default abstract class MfdBase<
    RxData extends MfdBaseRxData = MfdBaseRxData,
    State extends MfdBaseState = MfdBaseState,
> extends Generic<RxData, State> {
    constructor(props: VisRxWidgetProps) {
        super(props);
        this.state = { ...this.state, hover: false, dialogOpen: false };
    }

    /** The icon of the widget; `null` shows nothing */
    protected abstract getIcon(): IconSpec | null;

    /**
     * `vis.binds.jqueryui.classes` of vis-1: the button lights up under the mouse. Only some widgets had it -
     * the pure displays did not.
     */
    // eslint-disable-next-line class-methods-use-this
    protected hasHover(): boolean {
        return false;
    }

    /** `ui-state-active`: the button is pressed */
    // eslint-disable-next-line class-methods-use-this
    protected isActive(): boolean {
        return false;
    }

    /** Called on a click outside the edit mode by widgets without dialog, e.g. to switch */
    // eslint-disable-next-line class-methods-use-this
    protected onAction(): void {
        // nothing by default
    }

    /** `true` for the dialog widgets: a click opens the dialog with `renderDialogContent()` */
    // eslint-disable-next-line class-methods-use-this
    protected hasDialog(): boolean {
        return false;
    }

    /** Content of the dialog of the dialog widgets */
    // eslint-disable-next-line class-methods-use-this
    protected renderDialogContent(): React.ReactNode {
        return null;
    }

    /** Title of the dialog. Like vis-1 the object ID stands in for a missing title */
    protected getDialogTitle(): string {
        return this.state.rxData.title || this.state.rxData.oid || '';
    }

    /** Default size of the dialog when nothing is configured - the defaults of the vis-1 templates */
    // eslint-disable-next-line class-methods-use-this
    protected getDialogSize(): { width: number; height: number } {
        return { width: 440, height: 200 };
    }

    /** Extra style of the content area of the dialog */
    // eslint-disable-next-line class-methods-use-this
    protected getDialogContentStyle(): React.CSSProperties | undefined {
        return undefined;
    }

    /** Value of the main state */
    protected getValue(): any {
        const oid = this.state.rxData.oid;
        return oid ? this.state.values[`${oid}.val`] : undefined;
    }

    /** `true` while the object in "Working object ID" says the device is busy */
    protected isWorking(): boolean {
        const oid = this.state.rxData['oid-working'];
        return !!oid && isTrue(this.state.values[`${oid}.val`]);
    }

    protected setValue(oid: string | undefined, value: string | number | boolean): void {
        if (oid && oid !== 'nothing_selected') {
            this.props.context.setValue(oid, value);
        }
    }

    protected openDialog(open: boolean): void {
        if (open !== this.state.dialogOpen) {
            this.setState({ dialogOpen: open });
        }
    }

    private onClick = (): void => {
        if (this.props.editMode) {
            return;
        }
        if (this.hasDialog()) {
            this.openDialog(true);
        } else {
            this.onAction();
        }
    };

    /**
     * "vis-2 theme" is on. Only an explicit `true` counts: the widgets from vis-1 have no value and keep their look,
     * the editor sets `true` for every new widget.
     */
    protected isMui(): boolean {
        return isTrue(this.state.rxData.mui);
    }

    /** The colours of the vis-2 theme */
    protected getThemeColors(): MfdThemeColors {
        return getThemeColors((this.props.context as { theme?: unknown }).theme, this.props.context.themeType);
    }

    /**
     * Colour of the icon: a configured colour always wins. Otherwise the icons stay white in the vis-1 look; in the
     * vis-2 theme they take the text colour - on a pressed button the text colour of the primary colour, without
     * button the primary colour itself.
     */
    protected getIconColor(configured: string | undefined | null): string | undefined {
        if (configured) {
            return configured;
        }
        if (!this.isMui()) {
            return undefined;
        }
        const colors = this.getThemeColors();
        if (this.isActive()) {
            return isTrue(this.state.rxData.asButton) ? colors.primaryText : colors.primary;
        }
        return colors.text;
    }

    /** What lies in the button - the icon by default */
    protected renderContent(): React.ReactNode {
        const icon = this.getIcon();
        return icon ? (
            <MfdIcon
                src={icon.src}
                color={this.getIconColor(icon.color)}
                invert={isTrue(this.state.rxData.invert_icon)}
            />
        ) : null;
    }

    protected renderDialog(): React.ReactNode {
        if (!this.state.dialogOpen || this.props.editMode || !this.hasDialog()) {
            return null;
        }
        const data = this.state.rxData;
        const size = this.getDialogSize();
        return (
            <MfdDialog
                open
                onClose={() => this.openDialog(false)}
                dark={this.isDarkTheme()}
                title={this.getDialogTitle()}
                noHeader={isTrue(data.noHeader)}
                modal={isTrue(data.modal)}
                width={data.dialog_width || size.width}
                height={data.dialog_height || size.height}
                top={data.dialog_top}
                left={data.dialog_left}
                overflowX={data.overflowX}
                overflowY={data.overflowY}
                autoClose={autoCloseTime(data.autoclose)}
                contentStyle={this.getDialogContentStyle()}
                colors={this.isMui() ? this.getThemeColors() : undefined}
            >
                {this.renderDialogContent()}
            </MfdDialog>
        );
    }

    /** The classes of the widget div, see the class description */
    protected getButtonClasses(): string {
        if (this.isMui()) {
            // lets the shadow of the surface out of the widget div
            return ' mfd-mui';
        }
        if (!isTrue(this.state.rxData.asButton)) {
            return '';
        }
        let classes = ' ui-widget ui-button ui-corner-all ui-state-default';
        if (this.isActive()) {
            classes += ' ui-state-active';
        }
        if (this.state.hover && this.hasHover()) {
            classes += ' ui-state-hover';
        }
        return classes;
    }

    renderWidgetBody(props: RxRenderWidgetProps): React.JSX.Element {
        super.renderWidgetBody(props);

        props.className = `${props.className || ''}${this.getButtonClasses()}`;
        const clickable = !this.props.editMode && (this.hasDialog() || this.isClickable());

        let className = 'vis-widget-body mfd-rx mfd-body';
        let style: React.CSSProperties | undefined = clickable ? { cursor: 'pointer' } : undefined;
        if (this.isMui()) {
            className += ' mfd-mui';
            if (isTrue(this.state.rxData.asButton)) {
                className += ' mfd-surface';
            }
            if (this.isActive()) {
                className += ' mfd-on';
            }
            if (this.hasHover()) {
                className += ' mfd-hoverable';
            }
            style = { ...style, ...widgetVars(this.getThemeColors()) };
        }

        return (
            <div
                className={className}
                style={style}
                onClick={this.onClick}
                onMouseEnter={this.hasHover() ? () => this.setState({ hover: true }) : undefined}
                onMouseLeave={this.hasHover() ? () => this.setState({ hover: false }) : undefined}
            >
                {this.renderContent()}
                {this.renderDialog()}
            </div>
        );
    }

    /** `true` for the widgets that do something on click without a dialog */
    // eslint-disable-next-line class-methods-use-this
    protected isClickable(): boolean {
        return false;
    }

    /** `min`/`max` of the value widgets as numbers: an empty field takes the default of the vis-1 template */
    protected getRange(defaultMin = 0, defaultMax = 100): { min: number; max: number } {
        const data = this.state.rxData as Record<string, any>;
        return { min: toNumber(data.min, defaultMin), max: toNumber(data.max, defaultMax) };
    }
}
