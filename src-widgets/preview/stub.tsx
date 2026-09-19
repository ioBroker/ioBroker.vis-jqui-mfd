/*
 * Stub of the vis-2 runtime, shared by the development page (`index.html`) and the screenshot page
 * (`shots.html`).
 *
 * Importing this module puts `window.visRxWidget` in place. The widgets extend it, so they may only be imported
 * afterwards - both pages load them with a dynamic `import()` after this module.
 */
import React from 'react';

import en from '../src/i18n/en.json';

const WORDS: Record<string, string> = en;

class VisRxWidgetStub extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            rxData: props.rxData || {},
            rxStyle: props.rxStyle || {},
            values: props.values || {},
            editMode: !!props.editMode,
            visible: true,
        };
    }

    /** The values live in the page, not in the widget - this is what feeds them in on every change */
    static getDerivedStateFromProps(props: any, state: any): any {
        if (
            props.values !== state.values ||
            props.rxData !== state.rxData ||
            props.rxStyle !== state.rxStyle ||
            !!props.editMode !== state.editMode
        ) {
            return {
                values: props.values,
                rxData: props.rxData,
                rxStyle: props.rxStyle || {},
                editMode: !!props.editMode,
            };
        }
        return null;
    }

    static getI18nPrefix(): string {
        return '';
    }

    /** The texts of the widgets come from `i18n/en.json`, like in vis-2 with the language English */
    static t(key: string, ...args: string[]): string {
        let word = WORDS[key] || key;
        for (const arg of args) {
            word = word.replace('%s', arg);
        }
        return word;
    }

    componentDidMount(): void {}

    componentWillUnmount(): void {}

    componentDidUpdate(_prevProps: any, _prevState: any): void {}

    /** vis-2 puts `vis-widget` and the CSS class of the user on the widget div; a widget may add its own classes */
    renderWidgetBody(props: any): any {
        props.className = `vis-widget${this.state.rxData.class ? ` ${this.state.rxData.class}` : ''}`;
        return null;
    }

    /** The widget div of vis-2: the classes the widget set in `props.className`, the size of the widget style */
    render(): React.ReactNode {
        const props = {
            className: '',
            overlayClassNames: [],
            style: {},
            id: `rx_${this.props.id}`,
            refService: { current: null },
            widget: {},
        };
        const body = (this as any).renderWidgetBody(props);
        const style = this.state.rxStyle || {};
        return (
            <div
                className={props.className}
                style={{ position: 'relative', overflow: 'hidden', width: style.width, height: style.height }}
            >
                {body}
            </div>
        );
    }
}

(window as any).visRxWidget = VisRxWidgetStub;

/**
 * The parts of the MUI theme of vis-2 (`context.theme`) the widgets read with "vis-2 theme" on - the default light
 * and dark themes of vis-2.
 */
export function makeTheme(dark: boolean): any {
    const common = {
        shape: { borderRadius: 4 },
        typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
    };
    return dark
        ? {
              ...common,
              palette: {
                  mode: 'dark',
                  primary: { main: '#4dabf5', contrastText: 'rgba(0, 0, 0, 0.87)' },
                  background: { paper: '#121212', default: '#121212' },
                  text: { primary: '#ffffff' },
                  action: { hover: 'rgba(255, 255, 255, 0.08)' },
                  divider: 'rgba(255, 255, 255, 0.12)',
              },
          }
        : {
              ...common,
              palette: {
                  mode: 'light',
                  primary: { main: '#3399CC', contrastText: '#ffffff' },
                  background: { paper: '#ffffff', default: '#fafafa' },
                  text: { primary: 'rgba(0, 0, 0, 0.87)' },
                  action: { hover: 'rgba(0, 0, 0, 0.04)' },
                  divider: 'rgba(0, 0, 0, 0.12)',
              },
          };
}

const THEMES = { light: makeTheme(false), dark: makeTheme(true) };

/** The MUI theme of vis-2 for the preview pages - one object per mode, like vis-2 */
export function getTheme(dark: boolean): any {
    return dark ? THEMES.dark : THEMES.light;
}

/** Fills in the defaults of `getWidgetInfo()`, the way the vis editor does when a widget is created */
export function withDefaults(Widget: any, data: Record<string, any>): Record<string, any> {
    const info = Widget.getWidgetInfo();
    const result: Record<string, any> = {};
    for (const group of info.visAttrs) {
        for (const field of group.fields) {
            if (field.default !== undefined) {
                result[field.name] = field.default;
            }
        }
    }
    return { ...result, ...data };
}

/**
 * A stand-in for the jQuery UI theme "redmond" (the default theme of vis-2), used when the page has no access to
 * the themes of vis-2. It only covers the classes the widgets use.
 */
const FALLBACK_THEME = `
.ui-widget { font-family: 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; font-size: 1.1em; }
.ui-corner-all { border-radius: 5px; }
.ui-state-default { border: 1px solid #c5dbec; background: linear-gradient(#dfeffc, #c9e0f5); color: #2e6e9e; font-weight: bold; }
.ui-state-hover { border: 1px solid #79b7e7; background: linear-gradient(#e4f1fb, #d0e5f5); color: #1d5987; }
.ui-state-active { border: 1px solid #79b7e7; background: linear-gradient(#f5f8f9, #e4ecf3); color: #e17009; }
.ui-button { display: inline-block; position: relative; padding: 0; cursor: pointer; text-align: center; overflow: visible; }
`;

/** `true` if the dev server serves the jQuery UI themes of vis-2 - for unknown paths it answers with the HTML fallback */
async function hasThemes(): Promise<boolean> {
    try {
        const response = await fetch('lib/css/themes/jquery-ui/redmond/jquery-ui.min.css');
        return response.ok && (response.headers.get('content-type') || '').startsWith('text/css');
    } catch {
        return false;
    }
}

export const THEMES_AVAILABLE = await hasThemes();

/**
 * The CSS of a jQuery UI theme, limited to the element with the id `scope` - exactly the way vis-2 limits the theme
 * of a view to `#visview_<name>` (see `loadJqueryTheme` in vis-2), so several themes can be shown on one page.
 */
export async function loadTheme(theme: string, scope: string): Promise<string> {
    if (!THEMES_AVAILABLE) {
        return FALLBACK_THEME.replace(/(^|\n)\./g, `$1#${scope} .`);
    }
    let css = await (await fetch(`lib/css/themes/jquery-ui/${theme}/jquery-ui.min.css`)).text();
    css = css.replace('.ui-helper-hidden', `\n#${scope} .ui-helper-hidden`);
    css = css.replace(/(}.)/g, `}\n#${scope} .`);
    css = css.replace(/,\./g, `,#${scope} .`);
    css = css.replace(/images/g, `lib/css/themes/jquery-ui/${theme}/images`);
    return css;
}

/** A `<style>` with a jQuery UI theme for everything inside the element with the id `scope` */
export function ThemeStyle(props: { theme: string; scope: string }): React.JSX.Element | null {
    const [css, setCss] = React.useState('');
    React.useEffect(() => {
        let cancelled = false;
        void loadTheme(props.theme, props.scope).then(result => !cancelled && setCss(result));
        return () => {
            cancelled = true;
        };
    }, [props.theme, props.scope]);
    return css ? <style>{css}</style> : null;
}
