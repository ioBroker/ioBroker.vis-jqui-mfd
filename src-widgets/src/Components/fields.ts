/**
 * Building blocks of the attribute declarations (`getWidgetInfo().visAttrs`).
 *
 * Many templates of the vis-1 set share whole groups of attributes - the colours of the eleven steps, the dialog
 * settings. The names and defaults here are exactly the ones of `widgets/jqui-mfd.html`, because a project stores
 * the values under these names.
 */
import type { RxWidgetInfo, RxWidgetInfoAttributesField, RxWidgetInfoGroup } from '@iobroker/types-vis-2';

type Field = RxWidgetInfoAttributesField;

export const OVERFLOW_OPTIONS = ['', 'visible', 'hidden', 'scroll', 'auto', 'initial', 'inherit'];

/** The fields of "min;max" - text fields, because an on/off widget may hold `true`/`false` in them */
export const minMaxFields = (defaultMin?: string, defaultMax?: string): Field[] => [
    { name: 'min', label: 'min', default: defaultMin },
    { name: 'max', label: 'max', default: defaultMax },
];

export const oidField = (): Field => ({ name: 'oid', type: 'id', label: 'oid' });

export const workingField = (): Field => ({ name: 'oid-working', type: 'id', label: 'oid-working' });

export const invertIconField = (): Field => ({ name: 'invert_icon', type: 'checkbox', label: 'invert_icon' });

export const asButtonField = (): Field => ({ name: 'asButton', type: 'checkbox', label: 'asButton', default: true });

export const iconColorField = (): Field => ({ name: 'iconColor', type: 'color', label: 'iconColor' });

/** `iconColor0` ... `iconColor10`, or the given indexes (the blind has 0, 25, 5, 75, 10) */
export function colorGroup(indexes: (number | string)[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]): RxWidgetInfoGroup {
    return {
        name: 'colors',
        label: 'group_colors',
        fields: indexes.map(i => ({ name: `iconColor${i}`, type: 'color', label: `iconColor${i}` })),
    };
}

interface DialogOptions {
    width: number;
    height: number;
    /** Fields in front of the title, e.g. the URL of a camera */
    before?: Field[];
    /** "Auto close" - all dialogs except the MJPEG camera had it */
    autoclose?: boolean;
    /** "Dialog top/left" and "Overflow X/Y" - all dialogs except the heating had them */
    position?: boolean;
    /** "Show value" and "Units" of the value dialogs */
    valueText?: boolean;
    /** Fields behind all others, e.g. the plugin settings of the object camera */
    after?: Field[];
}

/** The group "dialog" of the dialog widgets */
export function dialogGroup(options: DialogOptions): RxWidgetInfoGroup {
    const fields: Field[] = [...(options.before || [])];
    fields.push({ name: 'title', label: 'title' }, { name: 'noHeader', type: 'checkbox', label: 'noHeader' });
    if (options.autoclose !== false) {
        fields.push({
            name: 'autoclose',
            type: 'slider',
            label: 'autoclose',
            tooltip: 'autoclose_tooltip',
            min: 0,
            max: 30000,
            step: 100,
        });
    }
    fields.push(
        { name: 'modal', type: 'checkbox', label: 'modal' },
        { name: 'dialog_width', label: 'dialog_width', default: options.width.toString() },
        { name: 'dialog_height', label: 'dialog_height', default: options.height.toString() },
    );
    if (options.position !== false) {
        fields.push(
            { name: 'dialog_top', label: 'dialog_top', tooltip: 'dialog_position_tooltip' },
            { name: 'dialog_left', label: 'dialog_left', tooltip: 'dialog_position_tooltip' },
            { name: 'overflowX', label: 'overflowX', type: 'nselect', options: OVERFLOW_OPTIONS, noTranslation: true },
            { name: 'overflowY', label: 'overflowY', type: 'nselect', options: OVERFLOW_OPTIONS, noTranslation: true },
        );
    }
    if (options.valueText) {
        fields.push({ name: 'show_value', type: 'checkbox', label: 'show_value' }, { name: 'units', label: 'units' });
    }
    fields.push(...(options.after || []));

    return { name: 'dialog', label: 'group_dialog', fields };
}

/**
 * "vis-2 theme": `true` for every widget created in vis-2 (the editor stores the default when it creates a widget).
 * Widgets from vis-1 do not have it and keep the vis-1 look. The editor shows such a missing value as the default -
 * ticked - so the field is marked as error then; the tooltip explains it.
 */
export const muiField = (): Field => ({
    name: 'mui',
    type: 'checkbox',
    label: 'mui',
    tooltip: 'mui_tooltip',
    default: true,
    error: (data: Record<string, any>) => data.mui === undefined || data.mui === null || data.mui === '',
});

/** Name of the widget set - the same as `data-vis-set` of the vis-1 templates, or vis-2 would not replace them */
export const VIS_SET = 'jqui-mfd';

/**
 * How the set appears in the widget palette of the vis-2 editor. The palette takes these from any widget of the
 * set, so every widget carries them. The icon is the adapter icon, copied next to the widgets by `tasks.js`.
 */
export const SET_INFO = {
    visSetLabel: 'set_label',
    visSetIcon: 'widgets/vis-2-widgets-jqui-mfd/img/jqui-mfd.svg',
    // the blue of the icons in the palette previews (jQuery UI "redmond"); the palette writes white on it
    visSetColor: '#2e6e9e',
};

/**
 * The declaration of a widget of the set: adds what every widget shares - the set with its label, icon and colour
 * in the palette, the description under the preview in the palette (`help_<label>` in `i18n/`) and "vis-2 theme" at
 * the top of the first group.
 */
export function mfdInfo(info: Omit<RxWidgetInfo, 'visSet'>): RxWidgetInfo {
    const [first, ...rest] = info.visAttrs;
    return {
        visSet: VIS_SET,
        ...SET_INFO,
        visHelp: info.visWidgetLabel ? `help_${info.visWidgetLabel}` : undefined,
        ...info,
        visAttrs: [{ ...first, fields: [muiField(), ...first.fields] }, ...rest],
    };
}

/** The default size of every widget of the set - the `width:76px; height:76px` of the vis-1 templates */
export const DEFAULT_STYLE = { width: 76, height: 76, position: 'absolute' } as const;

/** Preview image of a widget in the palette */
export const preview = (name: string): string => `widgets/vis-2-widgets-jqui-mfd/img/prev_${name}.svg`;
