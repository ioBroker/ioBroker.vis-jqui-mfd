import React from 'react';

import ButtonSet, { type ButtonSetItem } from './ButtonSet';
import Slider from './Slider';
import { sameValue } from '../utils';

interface ValueDialogProps {
    /** The row of buttons: "off / 25% / 50% / 75% / 100%", "closed ... open", the temperatures */
    buttons: ButtonSetItem[];
    /** Value of the state - the button with this value is pressed */
    value: unknown;
    onSelect: (value: ButtonSetItem['value']) => void;
    slider?: {
        min: number;
        max: number;
        step: number;
        inverted?: boolean;
        value: number;
        onCommit: (value: number) => void;
    };
    /** The line under the slider, e.g. `42% (42 %)` */
    text?: string;
}

/** Content of the dialogs of the dimmer, shutter, blind, valve, Custom10, heating and on/off widgets */
export default function ValueDialog(props: ValueDialogProps): React.JSX.Element {
    const checked = props.buttons.findIndex(item => sameValue(props.value, item.value));
    return (
        <div className="mfd-value-dialog">
            <ButtonSet
                items={props.buttons}
                checked={checked}
                onSelect={item => props.onSelect(item.value)}
            />
            {props.slider ? (
                <Slider
                    min={props.slider.min}
                    max={props.slider.max}
                    step={props.slider.step}
                    inverted={props.slider.inverted}
                    value={props.slider.value}
                    onCommit={props.slider.onCommit}
                />
            ) : null}
            {props.text !== undefined ? <div className="mfd-value-dialog-text">{props.text}</div> : null}
        </div>
    );
}
