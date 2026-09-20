# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`iobroker.vis-jqui-mfd` is a **widget set for ioBroker.vis and vis-2**, not a running adapter. `io-package.json`
declares `"mode": "none"`, `"onlyWWW": true`, `"type": "visualization-widgets"` - there is **no Node.js runtime
code**. Everything ships in `widgets/` and runs in the browser inside vis.

Every widget exists **twice**, with the same widget ids and the same attribute names:

| | vis (vis-1) | vis-2 |
|---|---|---|
| source | `widgets/jqui-mfd.html` (hand-maintained) | `src-widgets/src/*.tsx` |
| technique | EJS templates, jQuery, jQuery UI dialogs/sliders/buttonsets | React + TypeScript, no third-party UI libs |
| shipped as | the same file | `widgets/vis-2-widgets-jqui-mfd/` (generated) |

Both use the icons in `widgets/jqui-mfd/img/` (OpenAutomation iconset, CC BY-SA 3.0 DE, see `license.txt` there).

vis-2 loads both and **a React widget replaces the EJS widget of the same id** (`visWidgetsCatalog.tsx`:
`visWidgetTypes.findIndex(item => item.name === widgetObj.name)` -> replace; the runtime then resolves
`VisWidgetsCatalog.rxWidgets[widget.tpl]` first). That is the whole migration mechanism, and it only works while
three things hold:

1. `getWidgetInfo().id` equals the vis-1 `<script id="tplMfd…">`.
2. `getWidgetInfo().visSet` is `'jqui-mfd'` (set by `mfdInfo()`, see below).
3. Every attribute name of the vis-1 template still exists - widget data is stored per attribute name, so a
   renamed field silently drops the user's setting.

`npm run check-widgets` enforces all three; see below.

## Commands

```bash
npm run build          # sync version into the vis-1 set, then npm i + tsc + vite build + copy to widgets/
npm run tsc            # type-check src-widgets only
npm run check-widgets  # validate the widget declarations against the vis-1 templates (see below)
npm run preview        # vite dev server with a stub of vis-2 - shows all widgets without an ioBroker
npm run screenshots    # render the images of docs/img/ with a headless Chrome (see below)
npm run lint           # eslint with @iobroker/eslint-config
npm test               # mocha --exit -> test/testPackageFiles.js (package/io-package validation)
npm run npm            # install in root and src-widgets
npm run release-patch  # release-script; runs lint before the check and build before the commit
```

`npm run build` must not be replaced by a plain vite build: `tasks.js` deletes **only**
`widgets/vis-2-widgets-jqui-mfd` and `src-widgets/build`, never the whole `widgets/` folder - the vis-1 set and the
icons live there and are maintained by hand.

### Version bumps

The version lives in `package.json`, `io-package.json` (both handled by `release-script`), plus the header comment
(`version: "x.y.z"`) and `vis.binds['jqui-mfd'].version` (`version: 'x.y.z',`) in `widgets/jqui-mfd.html`.
`tasks.js` rewrites the latter two by regex from `package.json` on every build (`node tasks --version` does only
that), so keep those literals in a shape the regexes still match.

### `npm run check-widgets`

`src-widgets/checkWidgets.mjs` bundles the widget sources for node, stubs `window.visRxWidget`, calls every
`getWidgetInfo()` and checks the three migration invariants above plus that every `label`/`tooltip`/select option
exists in `src-widgets/src/i18n/en.json`. Attributes the vis-1 template offered but never actually used are
listed in its `DROPPED` map with the reason - add to that list only after confirming the vis-1 code really
ignored the attribute.

## Architecture of the vis-2 widget set (`src-widgets/`)

Vite + `@module-federation/vite`, federation name `visJquiMfd`, remote entry `customWidgets.js`. The exposed
component names and the URL are repeated in `io-package.json` under `common.visWidgets.visJquiMfd` - adding a
widget means touching `vite.config.ts` (`exposes`), that block, the `WIDGETS` list of `checkWidgets.mjs` and
`preview/widgets.ts`.

Every `getWidgetInfo()` returns `mfdInfo({...})` (`Components/fields.ts`). It adds what all widgets share: `visSet`,
the appearance of the set in the palette of the vis-2 editor (`SET_INFO`: label `set_label`, icon, colour - the
palette takes them from any widget of the set), the description under the preview in the palette (`visHelp`, the key
`help_<visWidgetLabel>` in `i18n/`) and the `mui` checkbox. The set icon is `admin/jqui-mfd.svg`, which
`tasks.js` copies to `widgets/vis-2-widgets-jqui-mfd/img/` after the build.

`moduleFederationShared(pack)` from `@iobroker/types-vis-2` filters the shared modules by the dependencies in
`src-widgets/package.json`. React and `react/jsx-runtime` must stay shared, otherwise vis-2's
`visWidgetSetCompatibility.ts` refuses to load the set. MUI and emotion are deliberately not dependencies: the
widgets draw their own dialog with `src/styles.css`.

`@swc/core` is pinned via `overrides` - `vite-plugin-top-level-await` fails on 1.16 with `missing field 'type'`
while printing the AST.

### Widget classes

Every widget extends `Generic` (`src/Generic.tsx`), which extends `window.visRxWidget` provided by the vis-2
runtime, and declares `getI18nPrefix() === 'vis_jqui_mfd_'`. `Generic.t('key')` therefore looks up
`vis_jqui_mfd_key`; the JSON files under `src/i18n/` hold the keys **without** the prefix and `src/translations.ts`
adds it.

- `Components/MfdBase.tsx` - base of all 27 widgets: icon on a jQuery UI button plus the optional dialog.
  Subclasses override hooks: `getIcon()`, `isActive()` (`ui-state-active`), `hasHover()` (the vis-1
  `vis.binds.jqueryui.classes`), `onAction()`/`isClickable()` (switches), `hasDialog()`/`renderDialogContent()`/
  `getDialogSize()` (dialog widgets). The dialog settings (`title`, `noHeader`, `autoclose`, `modal`,
  `dialog_*`, `overflowX/Y`) are handled here for all of them.
- `Components/LevelBase.tsx` - widgets that show a value, plus the value dialog (button row, slider, text):
  `MfdLight*`, `MfdShutter*`, `MfdBlind*`, `MfdValve*`, `MfdCustom10*`. A `LevelScale` with a `shape` is drawn for
  the exact value by `Components/LevelIcons.tsx` (lamp, shutter, valve, awning); its `LevelBand`s (`pickBand` in
  `utils.ts`) then only pick the colour attribute of the vis-1 step. Custom10 has no shape: the band picks one of the
  user's images (`Custom10Base`).
- `Components/mfdShapes.ts` - the outlines of the original icons (361 x 361) that `LevelIcons.tsx` assembles and
  moves. `preview/compare.html` shows every drawn icon next to the vis-1 image of the same step - at 10%, 20%, ...
  they have to match.
- `MfdSocket` (`MfdSocketCtrl` extends it), `MfdLightOnOffDialog`, `MfdHeating`, `MfdDoor`, `MfdWindow` (rotary
  handle), `TwoStateContact` in `MfdWindowBool.tsx` (`MfdWindowBool`, `MfdRoofWindowBool`, `MfdGarage`),
  `Components/CamBase.tsx` (the seven camera widgets; the `MfdVal…` versions only override `getMediaUrl()`).
- `Components/`: `MfdIcon` (SVG recolouring with a per-URL cache), `MfdDialog` (portal into `document.body`),
  `ButtonSet`, `Slider`, `ValueDialog`, `RefreshImage` (the vis-1 `imgRefresh`), `fields.ts` (shared attribute
  declarations - names and defaults exactly as in the vis-1 templates), `toggle.ts` (`vis.binds.basic.toggle`).

### Two looks: `mui` ("vis-2 theme")

Every widget has the checkbox `mui` (`mfdInfo()` in `Components/fields.ts` puts it at the top of the first group),
`default: true`. The editor stores defaults only when it **creates** a widget, so widgets from vis-1 (and from older
versions of this set) do not have it - `MfdBase.isMui()` counts only an explicit `true`, and they keep the jQuery UI
look. Keep it that way: an existing project must not change its look by an update.

- `mui` on: the button is drawn by `styles.css` (`.mfd-mui`, `.mfd-surface`, `.mfd-on`) with the colours of the MUI
  theme vis-2 hands in as `context.theme` (`Components/theme.ts`, CSS variables via `widgetVars()`); icons take the
  text colour (`MfdBase.getIconColor()`), the dialog the theme colours (`dialogVars()`). No MUI dependency.
- `mui` off / missing: the jQuery UI classes on the widget div, white icons, the dialog in its own light/dark look.
- The editor shows a missing value as the default (ticked). `muiField()` therefore marks the field as error while the
  value is missing, and the tooltip explains it.

### Conventions that come from the vis-1 set

- **The button is drawn by the jQuery UI theme of the view.** `MfdBase.renderWidgetBody` appends
  `ui-widget ui-button ui-corner-all ui-state-default` (+ `ui-state-active`/`ui-state-hover`) to `props.className`,
  which vis-2 puts on the widget div - the same div that carried them in vis-1. vis-2 loads the theme scoped to
  `#visview_<view>` (`loadJqueryTheme` in `visView.tsx`). Never style `ui-*` classes in `styles.css`.
- **The dialog cannot use the theme**: it is portaled to `document.body` (so no widget z-index or `overflow` can cut
  it), outside the scope of the theme. It has its own look and follows `context.themeType`. Clicks inside it must
  not bubble (React portals bubble through the React tree) - `MfdDialog` stops them.
- **Attribute values arrive as strings.** `utils.ts` has the coercions: `isTrue`, `toNumber`, `jqData` (what jQuery
  `.data()` returned for the `data-min`/`data-max` of vis-1), `looseEqual` (the `==` comparisons the templates used
  and projects rely on: `'1' == 1`, `true == 1`), `isFalse` (`vis.binds.basic.isFalse`), `sameValue` (which dialog
  button matches the state).
- **Icons**: `widgets/jqui-mfd/img/<name>.svg`, resolved against the vis root. The React widgets always use the SVG
  (vis-1 used the PNG without a colour). Colouring replaces white in `style`, `fill` and `stroke` attributes. Lamp,
  shutter, valve and awning are not loaded at all but drawn inline (`LevelIcons.tsx`).
- **Writes go through `this.props.context.setValue(oid, value)`**; URLs of the socket switch through
  `context.socket.getRawSocket().emit('httpGet', url)` like vis-2's own widgets.
- Behaviour that deliberately differs from vis-1 is listed at the end of `docs/en/README.md` - keep that list in
  sync.

### `src-widgets/preview/` - the development pages

`npm run preview` starts a vite dev server (port 4173, `strictPort`, own `cacheDir`) with a page that renders all
widgets against a stub of `VisRxWidget` (`preview/stub.tsx`). No ioBroker needed, and editing a widget hot-reloads
it. The state values live in the page; a click in a widget writes back through `context.setValue` with
`ack: false` and is confirmed 700 ms later. Toggles for the button, invert icon, icon colour, jQuery UI theme, dark
theme and edit mode.

Set `VIS2_WWW` to the `www` folder of a vis-2 checkout (e.g. `ioBroker.vis-2/packages/iobroker.vis-2/www`): the
vite config then serves `/lib/` from there and the pages load the real jQuery UI themes, scoped like vis-2 does
(`loadTheme` in `stub.tsx`). Without it a small stand-in of "redmond" is used.

`shots.html` holds fixed scenes for the documentation. Every `<section data-shot="name">` of `shots.tsx` becomes
`docs/img/name.png`. `npm run screenshots` (`preview/screenshots.mjs`) starts its own vite on port 4175, drives a
local Chrome over the DevTools protocol (node 22 `WebSocket`, no puppeteer) and saves the sections at 2x;
`npm run screenshots -- overview contacts` renders only those. The dialogs are opened through a ref and placed over
their section with `dialog_top/left`, measured after the page has settled. After changing how a widget looks,
re-render the images with `VIS2_WWW` set and check `docs/en/README.md` and `docs/de/README.md` - both describe
every setting of every widget.

`preview/palette.mjs` draws the palette previews `src-widgets/public/img/prev_*.svg` from the icons; run it only
when a preview should change.

Note that the scripts of `src-widgets` have to be called with `npx` (`cd src-widgets && npx vite …`): `npm run`
only puts the `node_modules/.bin` of the **root** on the PATH. A blank preview page usually means a second vite is
running on the same project.

## The vis-1 widget set (`widgets/`)

Still shipped and still maintained by hand; only touch it for fixes that vis (vis-1) users need.

- `widgets/jqui-mfd.html` - one `<script type="text/ejs" class="vis-tpl" id="tplMfd…">` per widget. The
  `data-vis-attrs*` mini-DSL defines the editor fields (`;`-separated, `group.x` opens a group, `[default]` with
  `~` for `/`, `/type`, `(1-slide_count)` for indexed groups). Labels come from the `systemDictionary` at the top.
- It depends on `vis.binds.jqueryui` (`active`, `classes`, `dialog`, `dialogAutoClose`, `radio`, `slider`,
  `setSvgColor`) and `vis.binds.basic` (`toggle`, `isFalse`, `imgRefresh`) of vis itself, not of this repository.
- The block `<!--script id="tplMfdHueDimmerDialog" … </script-->` (three Hue dialogs) is commented out - dead code,
  not ported.

## Changelog

`README.md` carries the changelog; the release script moves the `### **WORK IN PROGRESS**` section into
`io-package.json` `common.news` with translations. Add entries as `* (author) description`.
