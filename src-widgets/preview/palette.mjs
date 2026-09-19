/*
 * Draws the preview images of the widget palette (`src-widgets/public/img/prev_*.svg`) from the icons of the
 * widget set: the icon on a button in the look of the jQuery UI theme "redmond" (the default theme of vis-2), with
 * a small badge for the dialog, switch, object ID and Custom10 versions.
 *
 *     node src-widgets/preview/palette.mjs
 *
 * Only needed when a preview should change - the images are committed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const IMG = path.join(ROOT, 'widgets/jqui-mfd/img');
const OUT = path.join(ROOT, 'src-widgets/public/img');
fs.mkdirSync(OUT, { recursive: true });

const ICON = '#2e6e9e';
const BADGE = '#e17009';

function inner(file) {
    let svg = fs.readFileSync(path.join(IMG, `${file}.svg`), 'latin1');
    svg = svg.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    const body = svg.substring(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>'));
    return body
        .replace(/style="([^"]*)"/g, (m, s) => `style="${s.replace(/#ffffff\b|#fff\b/gi, ICON)}"`)
        .replace(/((?:fill|stroke)=")#(?:ffffff|fff)"/gi, `$1${ICON}"`)
        .replace(/\s+id="[^"]*"/g, '')
        .replace(/[\t\r\n]+/g, ' ')
        .replace(/ {2,}/g, ' ')
        .trim();
}

const badges = {
    // a small window with a title bar: the widget opens a dialog
    dialog: `<g transform="translate(52 52)"><rect x="0" y="0" width="24" height="20" rx="3" fill="#ffffff" stroke="${BADGE}" stroke-width="2"/><rect x="0" y="0" width="24" height="6" rx="3" fill="${BADGE}"/><path d="M5 11h14M5 15h9" stroke="${BADGE}" stroke-width="1.6" stroke-linecap="round"/></g>`,
    // a finger tip: the widget switches on click
    ctrl: `<g transform="translate(56 54)"><circle cx="10" cy="10" r="10" fill="#ffffff" stroke="${BADGE}" stroke-width="2"/><circle cx="10" cy="10" r="4" fill="${BADGE}"/></g>`,
    // the value comes from an object
    // eleven images of your own
    custom: `<g transform="translate(52 4)"><rect x="0" y="0" width="24" height="14" rx="3" fill="${BADGE}"/><text x="12" y="10.8" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">10</text></g>`,
    oid: `<g transform="translate(4 4)"><rect x="0" y="0" width="22" height="14" rx="3" fill="${BADGE}"/><text x="11" y="10.8" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">ID</text></g>`,
};

const PREVIEWS = {
    light: ['light_light_dim_60'],
    light_ctrl: ['light_light_dim_100', 'ctrl', true],
    light_onoff_dialog: ['light_light_dim_100', 'dialog', true],
    dimmer_dialog: ['light_light_dim_50', 'dialog', true],
    socket: ['message_socket_on'],
    socket_ctrl: ['message_socket_on', 'ctrl', true],
    shutter: ['fts_shutter_30'],
    shutter_dialog: ['fts_shutter_30', 'dialog'],
    blind: ['fts_markise_75'],
    blind_dialog: ['fts_markise_75', 'dialog'],
    heating: ['sani_heating_temp', 'dialog'],
    window_handle: ['fts_window_2w_tilt_l'],
    window: ['fts_window_1w_open', null, true],
    roof_window: ['fts_window_roof'],
    door: ['fts_door'],
    garage: ['fts_garage_door_100'],
    valve: ['sani_valve_30'],
    valve_dialog: ['sani_valve_30', 'dialog'],
    custom10: ['sani_valve_custom', null, false, 'custom'],
    custom10_dialog: ['sani_valve_custom', 'dialog', false, 'custom'],
    cam_dialog: ['it_camera', 'dialog'],
    cam_dialog_oid: ['it_camera', 'dialog', false, 'oid'],
    cam_video: ['it_camera', 'dialog'],
    cam_video_oid: ['it_camera', 'dialog', false, 'oid'],
};

for (const [name, [icon, badge, active, badge2]] of Object.entries(PREVIEWS)) {
    // the look of the jQuery UI theme "redmond", the default theme of vis-2
    const top = active ? '#f5f8f9' : '#dfeffc';
    const bottom = active ? '#e4ecf3' : '#c9e0f5';
    const border = active ? '#79b7e7' : '#c5dbec';
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">` +
        `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
        `<rect x="1" y="1" width="78" height="78" rx="6" fill="url(#bg)" stroke="${border}" stroke-width="2"/>` +
        `<svg x="2" y="2" width="76" height="76" viewBox="0 0 361 361">${inner(icon)}</svg>` +
        (badge ? badges[badge] : '') +
        (badge2 ? badges[badge2] : '') +
        `</svg>\n`;
    fs.writeFileSync(path.join(OUT, `prev_${name}.svg`), svg);
    console.log(`prev_${name}.svg`);
}
