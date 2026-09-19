/**
 * Helpers shared by all jqui-mfd widgets.
 *
 * Widget attributes come out of the vis editor as strings, so every value that is logically a boolean or a number
 * has to be coerced before use - the vis-1 widget set did that inline in every template, here it lives in one place.
 */

/** `true`, `'true'` and `1` are true; everything else is false */
export function isTrue(value: unknown): boolean {
    return value === true || value === 'true' || value === 1 || value === '1';
}

/** The vis-1 `isNotEmpty`: everything except `''`, `null` and `undefined` */
export function isNotEmpty(value: unknown): boolean {
    return value !== '' && value !== null && value !== undefined;
}

/** Parses a value that may be a number, a numeric string or empty. Returns `defaultValue` when it is not a number */
export function toNumber(value: unknown, defaultValue = 0): number {
    if (typeof value === 'number') {
        return isFinite(value) ? value : defaultValue;
    }
    if (typeof value !== 'string' || value === '') {
        return defaultValue;
    }
    const parsed = parseFloat(value.replace(',', '.'));
    return isFinite(parsed) ? parsed : defaultValue;
}

/**
 * The comparison of the vis-1 templates: `val == closed`, `val != min` and so on. Configured values are strings
 * while the states are numbers or booleans, so `'1' == 1` and `true == 1` must stay true - that is exactly what
 * projects rely on.
 */
export function looseEqual(a: unknown, b: unknown): boolean {
    return a == b;
}

/**
 * The value jQuery's `.data()` returned for a `data-*` attribute, which is how the vis-1 bindings read `min`,
 * `max`, `oidTrueValue`, ...: `'true'`/`'false'`/`'null'` become the literals, a string that is exactly a number
 * becomes that number, everything else stays a string. `undefined` stays `undefined`.
 */
export function jqData(value: unknown): unknown {
    if (typeof value !== 'string') {
        return value;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (value === 'null') {
        return null;
    }
    if (value !== '' && `${+value}` === value) {
        return +value;
    }
    return value;
}

/** Like `jqData`, but an empty value is `undefined` - what `vis.binds.basic.toggle` did with `min` and `max` */
export function jqDataOrUndefined(value: unknown): unknown {
    const result = jqData(value);
    return result === '' || result === null ? undefined : result;
}

/**
 * Turns a configured value into the value that is written to the state.
 *
 * The vis-1 widgets accepted `true`/`false`/numbers/strings in the same field, so `'0'` has to end up as the
 * number `0` and `'false'` as the boolean `false`, while a plain text stays text.
 */
export function toStateValue(
    value: string | number | boolean | undefined | null,
    fallback: string | number | boolean,
): string | number | boolean {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
        return value;
    }
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    const parsed = parseFloat(value);
    if (parsed.toString() === value) {
        return parsed;
    }
    return value;
}

/**
 * `vis.binds.basic.isFalse` of vis-1: is the state value the "off" value?
 *
 * With `max` configured everything that is not `max` is off; with only `min` configured only `min` is off;
 * without both the usual falsy spellings (`false`, `0`, `'off'`, ...) are off.
 */
export function isFalse(val: unknown, min: unknown, max: unknown): boolean {
    if (min !== undefined && min !== null && min !== '') {
        let value = val;
        if (value === 'true') {
            value = true;
        }
        if (value === 'false') {
            value = false;
        }
        if (max !== undefined && max !== null && max !== '') {
            let maxValue = max;
            if (maxValue === 'false') {
                maxValue = false;
            }
            if (maxValue === 'true') {
                maxValue = true;
            }
            return !looseEqual(value, maxValue);
        }
        let minValue = min;
        if (minValue === 'false') {
            minValue = false;
        }
        if (minValue === 'true') {
            minValue = true;
        }
        return looseEqual(value, minValue);
    }
    if (
        val === undefined ||
        val === null ||
        val === false ||
        val === 'false' ||
        val === 'FALSE' ||
        val === 'False' ||
        val === 'OFF' ||
        val === 'Off' ||
        val === 'off' ||
        val === '' ||
        val === '0' ||
        val === 0
    ) {
        return true;
    }
    const f = parseFloat(val as string);
    if (!isNaN(f)) {
        return !f;
    }
    return false;
}

/** One step of an image scale: from `at` (0..1 of the range between min and max) upwards `image` is shown */
export interface LevelBand {
    at: number;
    image: string;
    /** Attribute that holds the colour of this step */
    color: string;
}

/**
 * Picks the step of the scale for a value, exactly like the cascades `if (val >= max) ... else if (val >= min +
 * (max - min) * 0.9) ...` of the vis-1 templates. `bands` is sorted from the top (`at: 1`) downwards; a value
 * below all of them - or not a number at all - gets `fallback`.
 */
export function pickBand(
    val: number,
    min: number,
    max: number,
    bands: readonly LevelBand[],
    fallback: Omit<LevelBand, 'at'>,
): Omit<LevelBand, 'at'> {
    for (const band of bands) {
        const threshold = band.at >= 1 ? max : min + (max - min) * band.at;
        if (val >= threshold) {
            return band;
        }
    }
    return fallback;
}

/**
 * The auto-close time of a dialog in ms, or 0 for "stays open".
 *
 * Like vis-1: `true` means 10 seconds and a value below 60 is taken as seconds. Unlike vis-1, 0 switches the
 * auto close off - vis-1 closed the dialog after one second then.
 */
export function autoCloseTime(value: unknown): number {
    if (value === true || value === 'true') {
        return 10000;
    }
    if (value === undefined || value === null || value === '' || value === false || value === 'false') {
        return 0;
    }
    let timeout = parseInt(value as string, 10);
    if (!timeout || timeout < 0) {
        return 0;
    }
    if (timeout < 60) {
        // probably seconds
        timeout *= 1000;
    }
    return timeout;
}

/** A size or a position of the dialog: a plain number is px, everything else (`50%`, `3em`) stays as it is */
export function cssSize(value: string | number | undefined | null): string | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const str = value.toString().trim();
    return /^-?\d+(\.\d+)?$/.test(str) ? `${str}px` : str;
}

/** `true`/`'true'` as 1, `false`/`'false'` as 0, a numeric string as number - the radio buttons of vis-1 did that */
function normalizeValue(value: unknown): unknown {
    if (value === true || value === 'true') {
        return 1;
    }
    if (value === false || value === 'false') {
        return 0;
    }
    if (typeof value === 'string' && value.trim() !== '' && isFinite(Number(value))) {
        return Number(value);
    }
    return value;
}

/**
 * Whether the state has the value of a button of a dialog. vis-1 looked for `input[value="<state>"]`, so the
 * state `true` never matched a button with the value `true`; here both sides are normalized first, and numbers
 * are compared with a tolerance, so `21.5` finds the button of `min + (max - min) * 0.25`.
 */
export function sameValue(state: unknown, buttonValue: unknown): boolean {
    const a = normalizeValue(state);
    const b = normalizeValue(buttonValue);
    if (typeof a === 'number' && typeof b === 'number') {
        return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
    }
    if ((typeof a !== 'string' && typeof a !== 'number') || (typeof b !== 'string' && typeof b !== 'number')) {
        return false;
    }
    return String(a) === String(b);
}
