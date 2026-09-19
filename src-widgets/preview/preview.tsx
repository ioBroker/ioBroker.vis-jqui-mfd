/*
 * Development page for the jqui-mfd widgets.
 *
 * It renders the widgets against a stub of the vis-2 `VisRxWidget` base class, so the whole set can be looked at
 * and clicked without a running ioBroker. The state values are editable on the left, every widget reacts to them
 * live, and clicking a widget (or its dialog) writes back into the same values - first with `ack: false`, a moment
 * later confirmed like a real device would.
 *
 * Not part of the widget set - excluded from lint and never built into `widgets/`.
 * Start with `npm run preview` in the root. `VIS2_WWW` may point to the `www` folder of vis-2 to get the real
 * jQuery UI themes.
 */
import React, { useMemo, useRef, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

import { getTheme, ThemeStyle, THEMES_AVAILABLE, withDefaults } from './stub';
import * as W from './widgets';

type Values = Record<string, any>;

const IDS = {
    light: 'mfd.0.light',
    switch: 'mfd.0.switch',
    shutter: 'mfd.0.shutter',
    blind: 'mfd.0.blind',
    valve: 'mfd.0.valve',
    heating: 'mfd.0.heating',
    contact: 'mfd.0.contact',
    door: 'mfd.0.door',
    sash1: 'mfd.0.sash1',
    sash2: 'mfd.0.sash2',
    working: 'mfd.0.working',
    camera: 'mfd.0.cameraUrl',
};

const INITIAL: Values = {
    [IDS.light]: 60,
    [IDS.switch]: true,
    [IDS.shutter]: 30,
    [IDS.blind]: 50,
    [IDS.valve]: 40,
    [IDS.heating]: 22,
    [IDS.contact]: false,
    [IDS.door]: 0,
    [IDS.sash1]: 0,
    [IDS.sash2]: 2,
    [IDS.working]: false,
    [IDS.camera]: W.CAMERA_PICTURE,
};

const THEMES = ['redmond', 'ui-lightness', 'smoothness', 'start', 'cupertino', 'dark-hive', 'ui-darkness', 'black-tie'];

function toValues(map: Values): Values {
    const values: Values = {};
    for (const [id, val] of Object.entries(map)) {
        values[`${id}.val`] = val;
        values[`${id}.ack`] = true;
    }
    return values;
}

// ------------------------------------------------------------------------------------------------- controls

function Row(props: { label: string; children: React.ReactNode }): React.JSX.Element {
    return (
        <label style={{ display: 'grid', gridTemplateColumns: '100px 1fr 40px', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>{props.label}</span>
            {props.children}
        </label>
    );
}

function Slider(props: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }): React.JSX.Element {
    return (
        <Row label={props.label}>
            <input
                type="range"
                min={props.min}
                max={props.max}
                step={props.step || 1}
                value={props.value}
                onChange={e => props.onChange(parseFloat(e.target.value))}
            />
            <span style={{ fontSize: 12, textAlign: 'right' }}>{props.value}</span>
        </Row>
    );
}

function Toggle(props: { label: string; value: boolean; onChange: (v: boolean) => void }): React.JSX.Element {
    return (
        <Row label={props.label}>
            <input
                type="checkbox"
                style={{ justifySelf: 'start' }}
                checked={!!props.value}
                onChange={e => props.onChange(e.target.checked)}
            />
            <span />
        </Row>
    );
}

function Choice(props: { label: string; value: any; options: [any, string][]; onChange: (v: any) => void }): React.JSX.Element {
    return (
        <Row label={props.label}>
            <select
                value={String(props.value)}
                onChange={e => props.onChange(props.options.find(o => String(o[0]) === e.target.value)?.[0])}
            >
                {props.options.map(([value, text]) => (
                    <option
                        key={String(value)}
                        value={String(value)}
                    >
                        {text}
                    </option>
                ))}
            </select>
            <span />
        </Row>
    );
}

const CONTACT: [any, string][] = [
    [0, 'closed (0)'],
    [2, 'tilted (2)'],
    [1, 'opened (1)'],
];

// ------------------------------------------------------------------------------------------------- the page

function App(): React.JSX.Element {
    const [values, setValues] = useState<Values>(() => toValues(INITIAL));
    const [dark, setDark] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [theme, setTheme] = useState('redmond');
    const [mui, setMui] = useState(true);
    const [asButton, setAsButton] = useState(true);
    const [invertIcon, setInvertIcon] = useState(false);
    const [iconColor, setIconColor] = useState('');
    const [log, setLog] = useState<string[]>([]);
    const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

    const val = (id: string): any => values[`${id}.val`];
    const set = (id: string, value: any, ack = true): void =>
        setValues(prev => ({ ...prev, [`${id}.val`]: value, [`${id}.ack`]: ack }));

    const context = useMemo(
        () => ({
            themeType: dark ? 'dark' : 'light',
            theme: getTheme(dark),
            socket: { getRawSocket: () => ({ emit: (cmd: string, url: string) => setLog(l => [`${cmd} ${url}`, ...l].slice(0, 6)) }) },
            // like vis-2: the value is shown at once with ack=false, the "device" confirms it a moment later
            setValue: (id: string, value: any): void => {
                setLog(l => [`${id} = ${JSON.stringify(value)}`, ...l].slice(0, 6));
                set(id, value, false);
                clearTimeout(timers.current[id]);
                timers.current[id] = setTimeout(() => set(id, value, true), 700);
            },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [dark],
    );

    const common = { mui, asButton, invert_icon: invertIcon, iconColor };
    const dialog = { title: 'Living room', autoclose: 0 };

    const tiles: { type: any; caption: string; data: Values; w?: number; h?: number }[] = [
        { type: W.MfdLight, caption: 'Light', data: { oid: IDS.light, ...common } },
        { type: W.MfdLightCtrl, caption: 'Light switch', data: { oid: IDS.light, ...common } },
        { type: W.MfdLightOnOffDialog, caption: 'On/Off + dialog', data: { oid: IDS.switch, min: 'false', max: 'true', ...common, ...dialog } },
        { type: W.MfdLightDialog, caption: 'Dimmer + dialog', data: { oid: IDS.light, 'oid-working': IDS.working, ...common, ...dialog, show_value: true, units: '%' } },
        { type: W.MfdSocket, caption: 'Socket', data: { oid: IDS.switch, min: 'false', max: 'true', ...common } },
        { type: W.MfdSocketCtrl, caption: 'Socket switch', data: { oid: IDS.switch, min: 'false', max: 'true', ...common } },
        { type: W.MfdSocketCtrl, caption: 'Socket, URLs', data: { urlTrue: 'http://device/on', urlFalse: 'http://device/off', ...common } },
        { type: W.MfdShutter, caption: 'Shutter', data: { oid: IDS.shutter, ...common, show_active: true } },
        { type: W.MfdShutterDialog, caption: 'Shutter + dialog', data: { oid: IDS.shutter, ...common, ...dialog, show_active: true } },
        { type: W.MfdBlind, caption: 'Blind', data: { oid: IDS.blind, ...common } },
        { type: W.MfdBlindDialog, caption: 'Blind + dialog', data: { oid: IDS.blind, ...common, ...dialog } },
        { type: W.MfdHeating, caption: 'Heating', data: { oid: IDS.heating, ...common, ...dialog, step: '1', min: '17', max: '24' } },
        { type: W.MfdHeating, caption: 'Heating, text', data: { oid: IDS.heating, ...common, ...dialog, checkboxDisplay: 'text', roundnumber: '1' } },
        { type: W.MfdWindow, caption: 'Window, 1 sash', data: { 'oid-slide-sensor1': IDS.sash1, slide_count: '1', slide_type1: 'left', ...common } },
        { type: W.MfdWindow, caption: 'Window, 2 sashes', data: { 'oid-slide-sensor1': IDS.sash1, 'oid-slide-sensor2': IDS.sash2, slide_count: '2', slide_type1: 'left', slide_type2: 'right', ...common } },
        { type: W.MfdWindowBool, caption: 'Window', data: { oid: IDS.contact, ...common } },
        { type: W.MfdRoofWindowBool, caption: 'Roof window', data: { oid: IDS.contact, ...common } },
        { type: W.MfdDoor, caption: 'Door', data: { oid: IDS.door, ...common } },
        { type: W.MfdGarage, caption: 'Garage', data: { oid: IDS.contact, ...common } },
        { type: W.MfdValve, caption: 'Valve', data: { oid: IDS.valve, ...common } },
        { type: W.MfdValveDialog, caption: 'Valve + dialog', data: { oid: IDS.valve, ...common, ...dialog } },
        { type: W.MfdCustom10, caption: 'Custom10', data: { oid: IDS.valve, ...common } },
        { type: W.MfdCustom10Dialog, caption: 'Custom10 + dialog', data: { oid: IDS.valve, ...common, ...dialog } },
        { type: W.MfdCamSnapshot, caption: 'Snapshot', data: { url: W.CAMERA_PICTURE, text: '', ...common, title: 'Garden' } },
        { type: W.MfdValCamSnapshot, caption: 'Snapshot (ID)', data: { oid: IDS.camera, ...common, title: 'Garden' } },
        { type: W.MfdCamMjpg, caption: 'MJPEG', data: { url: W.CAMERA_PICTURE, ...common, title: 'Garden' } },
        { type: W.MfdValCamMjpg, caption: 'MJPEG (ID)', data: { oid: IDS.camera, ...common, title: 'Garden' } },
        { type: W.MfdCamVideo, caption: 'Video', data: { src_url: '', poster_url: W.CAMERA_PICTURE, ...common, title: 'Garden' } },
        { type: W.MfdValCamVideo, caption: 'Video (ID)', data: { oid: IDS.camera, ...common, title: 'Garden' } },
        { type: W.MfdCamVideoObject, caption: 'Video (object)', data: { ...common, title: 'Garden' } },
    ];

    const page: CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        minHeight: '100vh',
        background: dark ? '#1b1e23' : '#eef0f3',
        color: dark ? '#e3e6ea' : '#222',
    };
    const panel: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, padding: 16, borderRight: '1px solid rgba(128,128,128,0.3)' };

    return (
        <div style={page}>
            <div style={panel}>
                <b>States</b>
                <Slider label="Light" value={val(IDS.light)} min={0} max={100} onChange={v => set(IDS.light, v)} />
                <Toggle label="Switch" value={val(IDS.switch)} onChange={v => set(IDS.switch, v)} />
                <Slider label="Shutter" value={val(IDS.shutter)} min={0} max={100} onChange={v => set(IDS.shutter, v)} />
                <Slider label="Blind" value={val(IDS.blind)} min={0} max={100} onChange={v => set(IDS.blind, v)} />
                <Slider label="Valve" value={val(IDS.valve)} min={0} max={100} onChange={v => set(IDS.valve, v)} />
                <Slider label="Heating" value={val(IDS.heating)} min={10} max={30} step={0.5} onChange={v => set(IDS.heating, v)} />
                <Toggle label="Contact" value={val(IDS.contact)} onChange={v => set(IDS.contact, v)} />
                <Choice label="Door" value={val(IDS.door)} options={CONTACT} onChange={v => set(IDS.door, v)} />
                <Choice label="Sash 1 (left)" value={val(IDS.sash1)} options={CONTACT} onChange={v => set(IDS.sash1, v)} />
                <Choice label="Sash 2 (right)" value={val(IDS.sash2)} options={CONTACT} onChange={v => set(IDS.sash2, v)} />
                <Toggle label="Working" value={val(IDS.working)} onChange={v => set(IDS.working, v)} />
                <b style={{ marginTop: 12 }}>Look</b>
                <Toggle label="vis-2 theme" value={mui} onChange={setMui} />
                <Toggle label="Button" value={asButton} onChange={setAsButton} />
                <Toggle label="Invert icon" value={invertIcon} onChange={setInvertIcon} />
                <Row label="Icon color">
                    <input value={iconColor} placeholder="e.g. #e17009" onChange={e => setIconColor(e.target.value)} />
                    <span />
                </Row>
                <Choice label="jQuery theme" value={theme} options={THEMES.map(t => [t, t])} onChange={setTheme} />
                {THEMES_AVAILABLE ? null : <span style={{ fontSize: 11, opacity: 0.7 }}>VIS2_WWW not set: stand-in theme</span>}
                <Toggle label="Dark (vis-2)" value={dark} onChange={setDark} />
                <Toggle label="Edit mode" value={editMode} onChange={setEditMode} />
                <b style={{ marginTop: 12 }}>Written</b>
                <div style={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.join('\n')}</div>
            </div>
            <div id="view">
                <ThemeStyle theme={theme} scope="view" />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, padding: 24, alignItems: 'flex-start' }}>
                    {tiles.map((tile, i) => {
                        const Type = tile.type;
                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 100 }}>
                                <Type
                                    context={context}
                                    editMode={editMode}
                                    view="view"
                                    id={`w${i}`}
                                    values={values}
                                    rxStyle={{ width: tile.w || 76, height: tile.h || 76 }}
                                    rxData={withDefaults(Type, tile.data)}
                                />
                                <span style={{ fontSize: 11, textAlign: 'center', opacity: 0.8 }}>{tile.caption}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
