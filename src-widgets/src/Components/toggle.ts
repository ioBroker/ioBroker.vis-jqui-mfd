import { jqDataOrUndefined, looseEqual } from '../utils';

/**
 * The next value of a switch - `vis.binds.basic.toggle` of vis-1, for a widget with an object ID.
 *
 * `min` and `max` are the configured values (empty: not configured). The state at `min` goes to `max`, the state
 * at `max` goes to `min`; without `min`/`max` it is `true`/`false`. A value in between (a dimmer at 42) goes to
 * the nearer end - to `min` from the middle of the range upwards, to `max` below it.
 */
export function nextToggleValue(val: unknown, minAttr: unknown, maxAttr: unknown): string | number | boolean {
    const min = jqDataOrUndefined(minAttr) as string | number | boolean | undefined;
    const max = jqDataOrUndefined(maxAttr) as string | number | boolean | undefined;

    if (
        (min === undefined && (val === null || val === '' || val === undefined || val === false || val === 'false')) ||
        (min !== undefined && looseEqual(min, val))
    ) {
        return max !== undefined ? max : true;
    }
    if ((max === undefined && (val === true || val === 'true')) || (max !== undefined && looseEqual(val, max))) {
        return min !== undefined ? min : false;
    }

    const num = parseFloat(val as string);
    if (min !== undefined && max !== undefined) {
        return num >= ((max as number) - (min as number)) / 2 ? min : max;
    }
    return num >= 0.5 ? 0 : 1;
}
