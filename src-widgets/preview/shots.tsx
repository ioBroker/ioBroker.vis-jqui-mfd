/*
 * Scenes for the screenshots of the documentation (`docs/img/*.png`).
 *
 * Every `<section data-shot="name">` becomes one image: `screenshots.mjs` opens this page in a headless Chrome and
 * cuts the sections out. All values are fixed, so the images only change when a widget changes.
 *
 * The buttons are drawn by jQuery UI themes like in vis-2; with `VIS2_WWW` the real themes of vis-2 are used,
 * otherwise a stand-in of "redmond". The dialogs lie in `document.body` like in vis-2 and are placed over their
 * section with "Dialog top/left".
 *
 * Not part of the widget set - excluded from lint and never built into `widgets/`.
 */
import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';

import { getTheme, ThemeStyle, withDefaults } from './stub';
import * as W from './widgets';

type Values = Record<string, any>;

/** Acknowledged states, `{ 'a.b': 1 }` -> `{ 'a.b.val': 1, 'a.b.ack': true }` */
function states(map: Record<string, any>): Values {
    const values: Values = {};
    for (const [id, val] of Object.entries(map)) {
        values[`${id}.val`] = val;
        values[`${id}.ack`] = true;
    }
    return values;
}

const CONTEXT = {
    light: { setValue: (): void => {}, socket: {}, themeType: 'light', theme: getTheme(false) },
    dark: { setValue: (): void => {}, socket: {}, themeType: 'dark', theme: getTheme(true) },
};

const ID = 'mfd.0.value';

/**
 * Settings of the section a widget is in: `dark` is the theme of vis-2, `mui` the "vis-2 theme" option of the
 * widgets. The scenes of the jQuery UI look set it to `false` - `withDefaults` would switch it on like the editor.
 */
const ShotContext = React.createContext({ dark: false, mui: false });

let shotCounter = 0;

/**
 * One screenshot. `theme` is the jQuery UI theme of the "view", `dark` the theme of vis-2, `mui` shows the widgets
 * in the vis-2 theme.
 */
function Shot(props: {
    name: string;
    theme?: string;
    dark?: boolean;
    mui?: boolean;
    style?: CSSProperties;
    children: React.ReactNode;
}): React.JSX.Element {
    const [scope] = useState(() => `shot${++shotCounter}`);
    const darkBackground = props.dark || ['vader', 'black-tie', 'ui-darkness', 'dark-hive'].includes(props.theme || '');
    return (
        <ShotContext.Provider value={{ dark: !!props.dark, mui: !!props.mui }}>
            <section
                id={scope}
                data-shot={props.name}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    gap: 16,
                    width: 'max-content',
                    padding: 16,
                    boxSizing: 'border-box',
                    background: props.mui ? (props.dark ? '#121212' : '#fafafa') : darkBackground ? '#23272e' : '#fafafa',
                    color: darkBackground ? '#dfe3e8' : '#333',
                    ...props.style,
                }}
            >
                <ThemeStyle
                    theme={props.theme || 'redmond'}
                    scope={scope}
                />
                {props.children}
            </section>
        </ShotContext.Provider>
    );
}

/** One widget with a caption under it */
function Tile(props: {
    type: any;
    data: Values;
    value?: any;
    values?: Values;
    caption?: string;
    size?: number;
    widgetRef?: React.Ref<any>;
}): React.JSX.Element {
    const { dark, mui } = React.useContext(ShotContext);
    const Type = props.type;
    const size = props.size || 76;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: Math.max(size + 8, 92) }}>
            <Type
                ref={props.widgetRef}
                context={dark ? CONTEXT.dark : CONTEXT.light}
                editMode={false}
                view="view"
                id="w"
                values={props.values || states({ [ID]: props.value })}
                rxStyle={{ width: size, height: size }}
                rxData={withDefaults(Type, { oid: ID, asButton: true, mui, ...props.data })}
            />
            {props.caption !== undefined ? (
                <span style={{ fontSize: 12, textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.3 }}>{props.caption}</span>
            ) : null}
        </div>
    );
}

/** A caption on the left of a row of tiles */
function RowTitle(props: { children: React.ReactNode }): React.JSX.Element {
    return <div style={{ width: 110, alignSelf: 'center', fontSize: 13, fontWeight: 'bold' }}>{props.children}</div>;
}

function Row(props: { children: React.ReactNode }): React.JSX.Element {
    return <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%' }}>{props.children}</div>;
}

/** A widget with its open dialog next to it */
function DialogShot(props: {
    name: string;
    type: any;
    data: Values;
    value?: any;
    values?: Values;
    dark?: boolean;
    mui?: boolean;
    theme?: string;
    dialogWidth: number;
    dialogHeight: number;
}): React.JSX.Element {
    const refBox = useRef<HTMLDivElement>(null);
    const refWidget = useRef<any>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

    // measured once the themes and images above have loaded and the page does not move any more
    useEffect(() => {
        const timer = setTimeout(() => {
            const box = refBox.current?.getBoundingClientRect();
            if (box) {
                setPos({ top: Math.round(box.top), left: Math.round(box.left + 124) });
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (pos) {
            refWidget.current?.setState({ dialogOpen: true });
        }
    }, [pos]);

    return (
        <Shot
            name={props.name}
            dark={props.dark}
            mui={props.mui}
            theme={props.theme}
            style={{ width: 124 + props.dialogWidth + 48, height: props.dialogHeight + 32 }}
        >
            <div ref={refBox}>
                <Tile
                    type={props.type}
                    value={props.value}
                    values={props.values}
                    widgetRef={refWidget}
                    data={{
                        ...props.data,
                        dialog_width: String(props.dialogWidth),
                        dialog_top: pos ? String(pos.top) : undefined,
                        dialog_left: pos ? String(pos.left) : undefined,
                    }}
                />
            </div>
        </Shot>
    );
}

const WHITE_ICONS_THEME = 'dark-hive';

function Scenes(): React.JSX.Element {
    useEffect(() => {
        // the themes, the SVG icons and the coloured icons are loaded asynchronously
        const timer = setTimeout(() => ((window as any).__shotsReady = true), 4000);
        return () => clearTimeout(timer);
    }, []);

    const dialog = { title: 'Living room', autoclose: 0 };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 64, padding: 24, alignItems: 'flex-start' }}>
            {/* ------------------------------------------------------------------------------------ overview */}
            <Shot name="overview" theme={WHITE_ICONS_THEME} style={{ width: 9 * 108 + 32 - 16 }}>
                <Tile type={W.MfdLight} value={60} caption="Light" data={{}} />
                <Tile type={W.MfdLightCtrl} value={0} caption="Light switch" data={{}} />
                <Tile type={W.MfdLightOnOffDialog} value={true} caption={'On/Off\n+ dialog'} data={{}} />
                <Tile type={W.MfdLightDialog} value={30} caption={'Dimmer\n+ dialog'} data={{}} />
                <Tile type={W.MfdSocket} value={1} caption="Socket" data={{}} />
                <Tile type={W.MfdSocketCtrl} value={0} caption="Socket switch" data={{}} />
                <Tile type={W.MfdShutter} value={30} caption="Shutter" data={{}} />
                <Tile type={W.MfdShutterDialog} value={60} caption={'Shutter\n+ dialog'} data={{}} />
                <Tile type={W.MfdBlind} value={75} caption="Blind" data={{}} />
                <Tile type={W.MfdBlindDialog} value={50} caption={'Blind\n+ dialog'} data={{}} />
                <Tile type={W.MfdHeating} value={21} caption={'Heating\n+ dialog'} data={{}} />
                <Tile type={W.MfdWindow} values={states({ 's1': 2, 's2': 0 })} caption={'Window with\nrotary handle'} data={{ slide_count: '2', slide_type1: 'left', slide_type2: 'right', 'oid-slide-sensor1': 's1', 'oid-slide-sensor2': 's2' }} />
                <Tile type={W.MfdWindowBool} value={true} caption="Window" data={{}} />
                <Tile type={W.MfdRoofWindowBool} value={false} caption="Roof window" data={{}} />
                <Tile type={W.MfdDoor} value={0} caption="Door" data={{}} />
                <Tile type={W.MfdGarage} value={false} caption="Garage" data={{}} />
                <Tile type={W.MfdValve} value={30} caption="Valve" data={{}} />
                <Tile type={W.MfdValveDialog} value={70} caption={'Valve\n+ dialog'} data={{}} />
                <Tile type={W.MfdCustom10} value={50} caption="Custom10" data={{}} />
                <Tile type={W.MfdCustom10Dialog} value={80} caption={'Custom10\n+ dialog'} data={{}} />
                <Tile type={W.MfdCamSnapshot} caption={'Cam/Snapshot\n+ dialog'} data={{}} />
                <Tile type={W.MfdValCamSnapshot} caption={'Snapshot (ID)\n+ dialog'} data={{}} />
                <Tile type={W.MfdCamMjpg} caption={'Cam/Video img\n+ dialog'} data={{}} />
                <Tile type={W.MfdValCamMjpg} caption={'Video img (ID)\n+ dialog'} data={{}} />
                <Tile type={W.MfdCamVideo} caption={'Cam/Video html5\n+ dialog'} data={{}} />
                <Tile type={W.MfdValCamVideo} caption={'Video html5 (ID)\n+ dialog'} data={{}} />
                <Tile type={W.MfdCamVideoObject} caption={'Cam/Video object\n+ dialog'} data={{}} />
            </Shot>

            {/* ------------------------------------------------------------------------- vis-2 theme (mui) */}
            {[false, true].map(dark => (
                <Shot key={String(dark)} name={dark ? 'mui-dark' : 'mui-light'} mui dark={dark}>
                    <Tile type={W.MfdLight} value={80} caption="Light on" data={{}} />
                    <Tile type={W.MfdLightCtrl} value={0} caption="Light off" data={{}} />
                    <Tile type={W.MfdSocket} value={1} caption="Socket on" data={{}} />
                    <Tile type={W.MfdShutterDialog} value={40} caption="Shutter" data={{ show_active: true }} />
                    <Tile type={W.MfdWindowBool} value={true} caption="Window open" data={{}} />
                    <Tile type={W.MfdDoor} value={0} caption="Door closed" data={{}} />
                    <Tile type={W.MfdValve} value={60} caption="Valve" data={{}} />
                    <Tile type={W.MfdHeating} value={21.5} caption="Heating" data={{ checkboxDisplay: 'text', roundnumber: '1' }} />
                    <Tile type={W.MfdLight} value={100} caption={'No button,\nlight on'} data={{ asButton: false }} />
                </Shot>
            ))}
            <DialogShot name="mui-dialog-light" type={W.MfdLightDialog} value={50} mui dialogWidth={470} dialogHeight={210} data={{ ...dialog, show_value: true, units: '%' }} />
            <DialogShot name="mui-dialog-dark" type={W.MfdShutterDialog} value={75} mui dark dialogWidth={450} dialogHeight={210} data={{ ...dialog }} />

            {/* -------------------------------------------------------------------------------------- themes */}
            <div style={{ display: 'flex', gap: 0 }}>
                {['redmond', 'ui-lightness', 'dark-hive', 'ui-darkness'].map(theme => {
                    const white = theme === 'dark-hive' || theme === 'ui-darkness';
                    const data = { invert_icon: !white };
                    return (
                        <Shot key={theme} name={`theme-${theme}`} theme={theme} style={{ width: 2 * 108 + 16 }}>
                            <Tile type={W.MfdLight} value={100} caption="on" data={data} />
                            <Tile type={W.MfdLight} value={0} caption="off" data={data} />
                        </Shot>
                    );
                })}
            </div>

            {/* ---------------------------------------------------------------------------------- light steps */}
            <Shot name="light-steps" theme={WHITE_ICONS_THEME}>
                {[0, 5, 15, 30, 45, 60, 75, 90, 100].map(value => (
                    <Tile key={value} type={W.MfdLight} value={value} caption={`${value}%`} data={{}} />
                ))}
            </Shot>

            {/* ---------------------------------------------------------------------------------- level widgets */}
            <Shot name="levels" theme={WHITE_ICONS_THEME} style={{ flexDirection: 'column', gap: 12 }}>
                <Row>
                    <RowTitle>Shutter</RowTitle>
                    {[100, 85, 60, 35, 0].map(value => (
                        <Tile key={value} type={W.MfdShutter} value={value} caption={`${value}%`} data={{}} />
                    ))}
                </Row>
                <Row>
                    <RowTitle>Blind</RowTitle>
                    {[0, 20, 45, 70, 100].map(value => (
                        <Tile key={value} type={W.MfdBlind} value={value} caption={`${value}%`} data={{}} />
                    ))}
                </Row>
                <Row>
                    <RowTitle>Valve</RowTitle>
                    {[0, 15, 40, 65, 100].map(value => (
                        <Tile key={value} type={W.MfdValve} value={value} caption={`${value}%`} data={{}} />
                    ))}
                </Row>
            </Shot>

            {/* ---------------------------------------------------------------------------------- icon colours */}
            <Shot name="icon-colors" theme={WHITE_ICONS_THEME}>
                <Tile type={W.MfdLight} value={100} caption={'Light 100%\niconColor10'} data={{ iconColor10: '#ffd83a' }} />
                <Tile type={W.MfdLight} value={0} caption={'Light 0%\niconColor0'} data={{ iconColor0: '#8a8a8a' }} />
                <Tile type={W.MfdSocket} value={1} caption={'Socket on\niconColor_on'} data={{ iconColor_on: '#58d05a' }} />
                <Tile type={W.MfdSocket} value={0} caption={'Socket off\niconColor_off'} data={{ iconColor_off: '#ff6259' }} />
                <Tile type={W.MfdShutter} value={40} caption={'Shutter\niconColor'} data={{ iconColor: '#6cc6ff' }} />
                <Tile type={W.MfdWindowBool} value={true} caption={'Window opened\nopened_iconColor'} data={{ opened_iconColor: '#ff6259' }} />
                <Tile type={W.MfdWindowBool} value={false} caption={'Window closed\nclosed_iconColor'} data={{ closed_iconColor: '#58d05a' }} />
            </Shot>

            {/* ------------------------------------------------------------------------------- button options */}
            <Shot name="button-options" theme="redmond">
                <Tile type={W.MfdLight} value={0} caption={'Button\nwhite icon'} data={{}} />
                <Tile type={W.MfdLight} value={0} caption={'Button\ninverted icon'} data={{ invert_icon: true }} />
                <Tile type={W.MfdLight} value={100} caption={'Button active\ninverted icon'} data={{ invert_icon: true }} />
                <Tile type={W.MfdLight} value={100} caption={'No button\ninverted icon'} data={{ invert_icon: true, asButton: false }} />
                <Tile type={W.MfdLight} value={100} caption={'Button active\nicon color'} data={{ iconColor: '#e17009' }} />
                <Tile type={W.MfdShutter} value={50} caption={'Shutter with\nactive background'} data={{ invert_icon: true, show_active: true }} />
            </Shot>

            {/* ------------------------------------------------------------------------------------- contacts */}
            <Shot name="contacts" theme={WHITE_ICONS_THEME} style={{ flexDirection: 'column', gap: 12 }}>
                <Row>
                    <RowTitle>Window</RowTitle>
                    <Tile type={W.MfdWindowBool} value={false} caption="closed" data={{}} />
                    <Tile type={W.MfdWindowBool} value={true} caption="opened" data={{}} />
                    <RowTitle>Roof window</RowTitle>
                    <Tile type={W.MfdRoofWindowBool} value={false} caption="closed" data={{}} />
                    <Tile type={W.MfdRoofWindowBool} value={true} caption="opened" data={{}} />
                </Row>
                <Row>
                    <RowTitle>Door</RowTitle>
                    <Tile type={W.MfdDoor} value={0} caption="closed (0)" data={{}} />
                    <Tile type={W.MfdDoor} value={2} caption="tilted (2)" data={{}} />
                    <Tile type={W.MfdDoor} value={1} caption="opened (1)" data={{}} />
                    <RowTitle>Garage</RowTitle>
                    <Tile type={W.MfdGarage} value={false} caption="closed" data={{}} />
                    <Tile type={W.MfdGarage} value={true} caption="opened" data={{}} />
                </Row>
            </Shot>

            {/* ---------------------------------------------------------------------------- rotary handles */}
            <Shot name="window-handle" theme={WHITE_ICONS_THEME} style={{ flexDirection: 'column', gap: 12 }}>
                <Row>
                    <RowTitle>1 sash, left</RowTitle>
                    {[
                        [0, 'closed (0)'],
                        [2, 'tilted (2)'],
                        [1, 'opened (1)'],
                    ].map(([value, caption]) => (
                        <Tile
                            key={caption}
                            type={W.MfdWindow}
                            values={states({ s1: value })}
                            caption={caption as string}
                            data={{ slide_count: '1', slide_type1: 'left', 'oid-slide-sensor1': 's1' }}
                        />
                    ))}
                    <RowTitle>1 sash, right</RowTitle>
                    <Tile type={W.MfdWindow} values={states({ s1: 2 })} caption="tilted (2)" data={{ slide_count: '1', slide_type1: 'right', 'oid-slide-sensor1': 's1' }} />
                </Row>
                <Row>
                    <RowTitle>2 sashes</RowTitle>
                    {[
                        [0, 0],
                        [2, 0],
                        [0, 1],
                        [2, 1],
                        [1, 2],
                        [2, 2],
                        [1, 1],
                    ].map(([left, right]) => (
                        <Tile
                            key={`${left}${right}`}
                            type={W.MfdWindow}
                            values={states({ s1: left, s2: right })}
                            caption={`left ${left}\nright ${right}`}
                            data={{ slide_count: '2', slide_type1: 'left', slide_type2: 'right', 'oid-slide-sensor1': 's1', 'oid-slide-sensor2': 's2' }}
                        />
                    ))}
                </Row>
            </Shot>

            {/* ----------------------------------------------------------------------------------- heating */}
            <Shot name="heating" theme={WHITE_ICONS_THEME}>
                <Tile type={W.MfdHeating} value={21.5} caption={'Display:\nimage'} data={{}} />
                <Tile type={W.MfdHeating} value={21.5} caption={'Display: text\n1 decimal place'} data={{ checkboxDisplay: 'text', roundnumber: '1' }} />
            </Shot>

            {/* ---------------------------------------------------------------------------------- Custom10 */}
            <Shot name="custom10" theme={WHITE_ICONS_THEME}>
                {[
                    ['off', 'icon value "off"'],
                    ['on', 'icon value "on"'],
                    [35, 'no match: 35\n= step 30%'],
                ].map(([value, caption]) => (
                    <Tile
                        key={String(value)}
                        type={W.MfdCustom10}
                        value={value}
                        caption={caption as string}
                        data={{
                            iconValue0: 'off',
                            icon0: 'widgets/jqui-mfd/img/message_socket_off.svg',
                            iconValue1: 'on',
                            icon1: 'widgets/jqui-mfd/img/message_socket_on.svg',
                            iconColor1: '#58d05a',
                        }}
                    />
                ))}
            </Shot>

            {/* ----------------------------------------------------------------------------------- cameras */}
            <Shot name="cameras" theme={WHITE_ICONS_THEME}>
                <Tile type={W.MfdCamSnapshot} caption="default icon" data={{}} />
                <Tile type={W.MfdCamSnapshot} caption="with text" data={{ text: 'Garden' }} />
                <Tile type={W.MfdCamSnapshot} caption={'own icon:\nthe snapshot'} data={{ icon: W.CAMERA_PICTURE }} />
            </Shot>

            {/* ----------------------------------------------------------------------------------- dialogs */}
            <DialogShot name="dimmer-dialog" type={W.MfdLightDialog} value={50} theme={WHITE_ICONS_THEME} dialogWidth={470} dialogHeight={210} data={{ ...dialog, show_value: true, units: '%' }} />
            <DialogShot name="shutter-dialog" type={W.MfdShutterDialog} value={75} theme={WHITE_ICONS_THEME} dialogWidth={450} dialogHeight={210} data={{ ...dialog }} />
            <DialogShot name="onoff-dialog" type={W.MfdLightOnOffDialog} value={true} theme={WHITE_ICONS_THEME} dialogWidth={440} dialogHeight={150} data={{ ...dialog, min: 'false', max: 'true' }} />
            <DialogShot name="heating-dialog" type={W.MfdHeating} value={22} theme={WHITE_ICONS_THEME} dark dialogWidth={600} dialogHeight={210} data={{ ...dialog, title: 'Bathroom', min: '18', max: '28', step: '1' }} />
            <DialogShot name="camera-dialog" type={W.MfdCamSnapshot} theme={WHITE_ICONS_THEME} dialogWidth={480} dialogHeight={360 + 44} data={{ title: 'Garden', url: W.CAMERA_PICTURE, dialog_height: '360', interval: '0' }} />
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<Scenes />);
