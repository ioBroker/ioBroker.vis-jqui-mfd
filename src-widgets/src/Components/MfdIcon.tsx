import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';

/** Where the icons of the widget set live - shipped with the vis-1 set, uploaded to `widgets/jqui-mfd/img/` */
export const IMG_PATH = 'widgets/jqui-mfd/img/';

/** URL of a built-in icon, e.g. `mfdImage('fts_door_open')` */
export function mfdImage(name: string): string {
    return `${IMG_PATH}${name}.svg`;
}

/** The SVG sources that are loaded already. `null`: the URL is no SVG or could not be loaded */
const svgLoaded = new Map<string, string | null>();
/** The SVG sources that are being loaded */
const svgLoading = new Map<string, Promise<void>>();

function loadSvg(url: string): Promise<void> {
    let promise = svgLoading.get(url);
    if (!promise) {
        promise = fetch(url)
            .then(response => (response.ok ? response.text() : null))
            .catch(() => null)
            .then(text => {
                svgLoaded.set(url, text && text.includes('<svg') ? text : null);
            });
        svgLoading.set(url, promise);
    }
    return promise;
}

/**
 * Colours an icon of the OpenAutomation iconset. They are drawn in white, so every white fill and stroke - in a
 * `style` attribute as well as in a `fill`/`stroke` attribute - becomes the configured colour.
 *
 * vis-1 (`vis.binds.jqueryui.setSvgColor`) only replaced `#FFFFFF` inside `style` attributes, which left the icons
 * with `fill` attributes (the switched-off lamp) white.
 */
export function colorSvg(svg: string, color: string): string {
    const safeColor = color.replace(/["<>]/g, '');
    return svg
        .replace(/<\?xml[^>]*\?>/, '')
        .replace(
            /style="([^"]*)"/g,
            (_match, style: string) => `style="${style.replace(/#(?:ffffff|fff)\b/gi, safeColor)}"`,
        )
        .replace(/((?:fill|stroke)=")#(?:ffffff|fff)"/gi, (_match, attr: string) => `${attr}${safeColor}"`);
}

/** `data:` URL of a coloured SVG, or `null` while it loads or if the image is no SVG */
function useColoredSvg(src: string, color: string | undefined): string | null {
    // re-render once the SVG has arrived
    const [, setLoaded] = useState(0);
    const needed = !!color && !!src;
    const known = needed && svgLoaded.has(src);

    useEffect(() => {
        if (!needed || known) {
            return undefined;
        }
        let cancelled = false;
        void loadSvg(src).then(() => !cancelled && setLoaded(n => n + 1));
        return () => {
            cancelled = true;
        };
    }, [src, needed, known]);

    const svg = known ? svgLoaded.get(src) : null;
    return useMemo(
        () => (svg && color ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(colorSvg(svg, color))}` : null),
        [svg, color],
    );
}

interface MfdIconProps {
    /** Image URL - a built-in icon or one chosen by the user */
    src: string;
    /** Colour for the white parts of an SVG. Empty shows the image as it is */
    color?: string;
    /** Inverts the image, the `invert_icon` option */
    invert?: boolean;
    alt?: string;
    /** `width` (default) scales the image to the width of the widget, `height` to its height (camera widgets) */
    fit?: 'width' | 'height';
    style?: CSSProperties;
}

/**
 * The icon of a widget.
 *
 * With a colour the SVG is loaded once, recoloured and shown as `data:` URL. Until it has arrived, and when the
 * image is no SVG (a PNG chosen by the user), the image is shown as it is - vis-1 lost such an image completely.
 */
export default function MfdIcon(props: MfdIconProps): React.JSX.Element | null {
    const colored = useColoredSvg(props.src, props.color || undefined);
    if (!props.src) {
        return null;
    }
    const style: CSSProperties = {
        ...(props.fit === 'height' ? { height: '100%', verticalAlign: 'middle' } : { width: '100%', display: 'block' }),
        ...(props.invert ? { filter: 'invert(1)' } : undefined),
        ...props.style,
    };
    return (
        <img
            className="mfd-icon"
            src={colored || props.src}
            alt={props.alt || ''}
            draggable={false}
            style={style}
        />
    );
}
