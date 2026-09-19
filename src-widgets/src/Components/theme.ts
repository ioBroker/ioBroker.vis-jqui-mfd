import type React from 'react';

/**
 * The colours of the vis-2 theme the widgets use with "vis-2 theme" (`mui`) switched on.
 *
 * They are read from the MUI theme vis-2 hands to every widget (`context.theme`), so the widgets follow the theme
 * of vis-2 - light, dark, blue, ... - without bringing MUI themselves. Missing values fall back to the default
 * light and dark themes of vis-2.
 */
export interface MfdThemeColors {
    dark: boolean;
    /** Background of a surface (MUI `Paper`) */
    paper: string;
    text: string;
    primary: string;
    /** Text and icons on `primary` */
    primaryText: string;
    /** Overlay under the mouse */
    hover: string;
    divider: string;
    radius: number;
    font: string;
    /** Shadow of a raised surface (elevation 2) and of a surface under the mouse (elevation 4) */
    shadow: string;
    shadowHover: string;
}

const DEFAULTS: Record<'light' | 'dark', MfdThemeColors> = {
    light: {
        dark: false,
        paper: '#ffffff',
        text: 'rgba(0, 0, 0, 0.87)',
        primary: '#3399CC',
        primaryText: '#ffffff',
        hover: 'rgba(0, 0, 0, 0.04)',
        divider: 'rgba(0, 0, 0, 0.12)',
        radius: 4,
        font: '"Roboto", "Helvetica", "Arial", sans-serif',
        shadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        shadowHover:
            '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    },
    dark: {
        dark: true,
        paper: '#121212',
        text: '#ffffff',
        primary: '#4dabf5',
        primaryText: 'rgba(0, 0, 0, 0.87)',
        hover: 'rgba(255, 255, 255, 0.08)',
        divider: 'rgba(255, 255, 255, 0.12)',
        radius: 4,
        font: '"Roboto", "Helvetica", "Arial", sans-serif',
        shadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        shadowHover:
            '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    },
};

const cache = new WeakMap<object, MfdThemeColors>();

/** The colours of the vis-2 theme; `theme` is `context.theme`, `themeType` decides the fallbacks */
export function getThemeColors(theme: any, themeType?: string): MfdThemeColors {
    const palette = theme?.palette;
    const dark = palette?.mode ? palette.mode === 'dark' : themeType === 'dark';
    if (!theme || typeof theme !== 'object') {
        return DEFAULTS[dark ? 'dark' : 'light'];
    }
    const cached = cache.get(theme);
    if (cached) {
        return cached;
    }
    const base = DEFAULTS[dark ? 'dark' : 'light'];
    const colors: MfdThemeColors = {
        dark,
        paper: palette?.background?.paper || base.paper,
        text: palette?.text?.primary || base.text,
        primary: palette?.primary?.main || base.primary,
        primaryText: palette?.primary?.contrastText || base.primaryText,
        hover: palette?.action?.hover || base.hover,
        divider: palette?.divider || base.divider,
        radius: typeof theme.shape?.borderRadius === 'number' ? theme.shape.borderRadius : base.radius,
        font: theme.typography?.fontFamily || base.font,
        shadow: (Array.isArray(theme.shadows) && theme.shadows[2]) || base.shadow,
        shadowHover: (Array.isArray(theme.shadows) && theme.shadows[4]) || base.shadowHover,
    };
    cache.set(theme, colors);
    return colors;
}

/** `#rgb`, `#rrggbb`, `rgb()` and `rgba()` to [r, g, b, a], or `null` for anything else (names, variables) */
function parseColor(color: string): [number, number, number, number] | null {
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
    if (hex) {
        const v = hex[1].length === 3 ? hex[1].replace(/(.)/g, '$1$1') : hex[1];
        return [parseInt(v.substring(0, 2), 16), parseInt(v.substring(2, 4), 16), parseInt(v.substring(4, 6), 16), 1];
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?/i.exec(color.trim());
    if (rgb) {
        return [
            parseFloat(rgb[1]),
            parseFloat(rgb[2]),
            parseFloat(rgb[3]),
            rgb[4] === undefined ? 1 : parseFloat(rgb[4]),
        ];
    }
    return null;
}

/**
 * `amount` of `color` over the opaque `background` - e.g. 6% of the text colour over the paper for the title bar
 * of the dialog. A colour that cannot be parsed returns `background`.
 */
export function mix(color: string, background: string, amount: number): string {
    const c = parseColor(color);
    const b = parseColor(background);
    if (!c || !b) {
        return background;
    }
    const ratio = amount * c[3];
    const channel = (i: number): number => Math.round(b[i] + (c[i] - b[i]) * ratio);
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/**
 * The surface of a raised element in the dark theme is lighter than the paper, like the elevation overlay of MUI.
 * In the light theme the shadow does that job.
 */
export function surfaceColor(colors: MfdThemeColors): string {
    return colors.dark ? mix('#ffffff', colors.paper, 0.09) : colors.paper;
}

/** The CSS variables of `styles.css` for a widget in the vis-2 theme */
export function widgetVars(colors: MfdThemeColors): React.CSSProperties {
    return {
        '--mfd-surface': surfaceColor(colors),
        '--mfd-fg': colors.text,
        '--mfd-primary': colors.primary,
        '--mfd-primary-fg': colors.primaryText,
        '--mfd-hover': colors.hover,
        '--mfd-radius': `${colors.radius}px`,
        '--mfd-font': colors.font,
        '--mfd-shadow': colors.shadow,
        '--mfd-shadow-hover': colors.shadowHover,
    } as React.CSSProperties;
}

/** The CSS variables of the dialog (see the top of `styles.css`) taken from the vis-2 theme */
export function dialogVars(colors: MfdThemeColors): React.CSSProperties {
    const bg = colors.dark ? mix('#ffffff', colors.paper, 0.16) : colors.paper;
    return {
        '--mfd-bg': bg,
        '--mfd-fg': colors.text,
        '--mfd-header-bg': mix(colors.text, bg, 0.06),
        '--mfd-border': colors.divider,
        '--mfd-button-bg': mix(colors.text, bg, 0.07),
        '--mfd-button-hover': mix(colors.text, bg, 0.13),
        '--mfd-accent': colors.primary,
        '--mfd-accent-fg': colors.primaryText,
        '--mfd-track': mix(colors.text, bg, 0.22),
        fontFamily: colors.font,
        borderRadius: colors.radius * 2,
    } as React.CSSProperties;
}
