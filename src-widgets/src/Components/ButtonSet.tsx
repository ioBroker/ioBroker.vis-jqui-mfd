import React from 'react';

export interface ButtonSetItem {
    label: string;
    /** Value written to the state */
    value: number | string | boolean;
}

interface ButtonSetProps {
    items: ButtonSetItem[];
    /** Index of the button that matches the state, -1 for none */
    checked: number;
    onSelect: (item: ButtonSetItem) => void;
    disabled?: boolean;
}

/**
 * A row of buttons of which the one matching the state is pressed - the replacement of the jQuery UI buttonset
 * with radio inputs, which the dialogs of vis-1 used for "off / 25% / 50% / 75% / 100%" and the temperatures.
 */
export default function ButtonSet(props: ButtonSetProps): React.JSX.Element {
    return (
        <div
            className="mfd-buttonset"
            role="radiogroup"
        >
            {props.items.map((item, i) => (
                <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={i === props.checked}
                    className={`mfd-buttonset-button${i === props.checked ? ' mfd-checked' : ''}`}
                    disabled={props.disabled}
                    onClick={() => props.onSelect(item)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
