/*
 * Build of the vis-2 (React) widget set.
 *
 * Careful with the `widgets/` folder: unlike a pure vis-2 widget set it is NOT generated here. It also holds the
 * vis-1 widget set (`widgets/jqui-mfd.html` and `widgets/jqui-mfd/**` with all the icons), which is maintained by
 * hand and still shipped for vis. The React widgets use the same icons. Only the sub folder of the React build is
 * deleted and rebuilt.
 */
const { deleteFoldersRecursive, buildReact, npmInstall, copyFiles } = require('@iobroker/build-tools');
const fs = require('node:fs');

/** Where the built React widget set ends up. Must match `common.visWidgets.*.url` in io-package.json. */
const TARGET = 'widgets/vis-2-widgets-jqui-mfd';

function copyAllFiles() {
    copyFiles(['src-widgets/build/**/*', '!src-widgets/build/index.html'], `${TARGET}/`);
    // the icon of the widget set in the palette of the vis-2 editor (`visSetIcon`) is the adapter icon
    fs.mkdirSync(`${__dirname}/${TARGET}/img`, { recursive: true });
    fs.copyFileSync(`${__dirname}/admin/jqui-mfd.svg`, `${__dirname}/${TARGET}/img/jqui-mfd.svg`);
}

/** Keeps the version in the vis-1 widget set in sync with package.json */
function syncLegacyVersion() {
    const pack = require('./package.json');

    const files = ['widgets/jqui-mfd.html'];
    for (const file of files) {
        const content = fs.readFileSync(`${__dirname}/${file}`, 'utf8');
        const updated = content
            .replace(/version: "\d+\.\d+\.\d+"/, `version: "${pack.version}"`)
            .replace(/version: '\d+\.\d+\.\d+',/, `version: '${pack.version}',`);
        if (content !== updated) {
            fs.writeFileSync(`${__dirname}/${file}`, updated);
            console.log(`${file} updated`);
        }
    }
}

if (process.argv.includes('--copy-files')) {
    copyAllFiles();
} else if (process.argv.includes('--build')) {
    buildReact(`${__dirname}/src-widgets`, { rootDir: __dirname, vite: true }).catch(e => {
        console.error(`Error by build: ${e}`);
        process.exit(1);
    });
} else if (process.argv.includes('--version')) {
    syncLegacyVersion();
} else {
    syncLegacyVersion();
    deleteFoldersRecursive(`${__dirname}/src-widgets/build`);
    deleteFoldersRecursive(`${__dirname}/${TARGET}`);
    npmInstall('src-widgets')
        .then(() => buildReact(`${__dirname}/src-widgets`, { rootDir: __dirname, vite: true }))
        .then(() => copyAllFiles())
        .catch(e => {
            console.error(`Error by build: ${e}`);
            process.exit(1);
        });
}
