/*
 * All widgets of the set, for the two preview pages.
 *
 * The widgets extend `window.visRxWidget`, so they may only be imported after the stub is in place - hence the
 * dynamic imports after the import of `./stub`.
 */
import './stub';

const modules = await Promise.all([
    import('../src/MfdLight'),
    import('../src/MfdLightCtrl'),
    import('../src/MfdLightOnOffDialog'),
    import('../src/MfdLightDialog'),
    import('../src/MfdSocket'),
    import('../src/MfdSocketCtrl'),
    import('../src/MfdShutter'),
    import('../src/MfdShutterDialog'),
    import('../src/MfdBlind'),
    import('../src/MfdBlindDialog'),
    import('../src/MfdHeating'),
    import('../src/MfdWindow'),
    import('../src/MfdWindowBool'),
    import('../src/MfdRoofWindowBool'),
    import('../src/MfdDoor'),
    import('../src/MfdGarage'),
    import('../src/MfdValve'),
    import('../src/MfdValveDialog'),
    import('../src/MfdCustom10'),
    import('../src/MfdCustom10Dialog'),
    import('../src/MfdCamSnapshot'),
    import('../src/MfdValCamSnapshot'),
    import('../src/MfdCamMjpg'),
    import('../src/MfdValCamMjpg'),
    import('../src/MfdCamVideo'),
    import('../src/MfdValCamVideo'),
    import('../src/MfdCamVideoObject'),
]);

export const [
    MfdLight,
    MfdLightCtrl,
    MfdLightOnOffDialog,
    MfdLightDialog,
    MfdSocket,
    MfdSocketCtrl,
    MfdShutter,
    MfdShutterDialog,
    MfdBlind,
    MfdBlindDialog,
    MfdHeating,
    MfdWindow,
    MfdWindowBool,
    MfdRoofWindowBool,
    MfdDoor,
    MfdGarage,
    MfdValve,
    MfdValveDialog,
    MfdCustom10,
    MfdCustom10Dialog,
    MfdCamSnapshot,
    MfdValCamSnapshot,
    MfdCamMjpg,
    MfdValCamMjpg,
    MfdCamVideo,
    MfdValCamVideo,
    MfdCamVideoObject,
] = modules.map(module => module.default as any);

/** A picture of a camera for the camera dialogs - a garden at dusk, drawn inline */
export const CAMERA_PICTURE = `data:image/svg+xml;utf8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">' +
        '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27466e"/><stop offset="1" stop-color="#e9a86a"/></linearGradient></defs>' +
        '<rect width="640" height="480" fill="url(#sky)"/>' +
        '<circle cx="480" cy="300" r="46" fill="#ffd18a" opacity="0.9"/>' +
        '<path d="M0 330 Q160 280 320 320 T640 300 V480 H0Z" fill="#35532f"/>' +
        '<path d="M0 380 Q200 350 380 390 T640 380 V480 H0Z" fill="#274022"/>' +
        '<g fill="#1b2d18"><rect x="120" y="250" width="14" height="110"/><circle cx="127" cy="235" r="48"/>' +
        '<rect x="530" y="270" width="10" height="90"/><circle cx="535" cy="258" r="34"/></g>' +
        '<rect x="250" y="300" width="120" height="80" fill="#6b4b3a"/><path d="M240 300 L310 250 L380 300Z" fill="#8a3b2e"/>' +
        '<rect x="295" y="335" width="30" height="45" fill="#3a2a20"/><rect x="262" y="318" width="22" height="18" fill="#ffd98a"/>' +
        '<text x="16" y="30" font-family="monospace" font-size="18" fill="#ffffff">CAM 1  2026-09-18 19:42:07</text>' +
        '</svg>',
)}`;
