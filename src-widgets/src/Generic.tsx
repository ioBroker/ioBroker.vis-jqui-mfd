import type { VisRxWidgetState } from '@iobroker/types-vis-2';
import type VisRxWidget from '@iobroker/types-vis-2/visRxWidget';

/**
 * Base class of every jqui-mfd widget.
 *
 * `window.visRxWidget` is provided by the vis-2 runtime, so the widget set is built against the react copy of the
 * host instead of shipping its own.
 */
export default class Generic<
    RxData extends Record<string, any>,
    State extends Partial<VisRxWidgetState> = VisRxWidgetState,
> extends (window.visRxWidget as typeof VisRxWidget)<RxData, State> {
    /** Value of the state configured under `stateName`, e.g. `getPropertyValue('oid-working')` */
    getPropertyValue = (stateName: string): any => this.state.values[`${(this.state.rxData as any)[stateName]}.val`];

    static getI18nPrefix(): string {
        return 'vis_jqui_mfd_';
    }

    /** `true` in the dark theme of vis-2 - the dialogs follow it, the buttons follow the jQuery UI theme */
    isDarkTheme(): boolean {
        return this.props.context.themeType === 'dark';
    }
}
