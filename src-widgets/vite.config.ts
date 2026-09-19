// @ts-expect-error no types
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import { readFileSync } from 'node:fs';
import topLevelAwait from 'vite-plugin-top-level-await';

// The shared modules come from @iobroker/types-vis-2, so react and the JSX runtime stay the singletons the vis-2
// host provides instead of being bundled a second time. Passing package.json filters that list down to the
// packages this widget set really uses.
// Every exposed widget must also be listed in io-package.json under common.visWidgets.visJquiMfd.components.
const pack = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const config = {
    plugins: [
        federation({
            manifest: true,
            name: 'visJquiMfd',
            filename: 'customWidgets.js',
            exposes: {
                './MfdLight': './src/MfdLight',
                './MfdLightCtrl': './src/MfdLightCtrl',
                './MfdLightOnOffDialog': './src/MfdLightOnOffDialog',
                './MfdLightDialog': './src/MfdLightDialog',
                './MfdSocket': './src/MfdSocket',
                './MfdSocketCtrl': './src/MfdSocketCtrl',
                './MfdShutter': './src/MfdShutter',
                './MfdShutterDialog': './src/MfdShutterDialog',
                './MfdBlind': './src/MfdBlind',
                './MfdBlindDialog': './src/MfdBlindDialog',
                './MfdHeating': './src/MfdHeating',
                './MfdWindow': './src/MfdWindow',
                './MfdWindowBool': './src/MfdWindowBool',
                './MfdRoofWindowBool': './src/MfdRoofWindowBool',
                './MfdDoor': './src/MfdDoor',
                './MfdGarage': './src/MfdGarage',
                './MfdValve': './src/MfdValve',
                './MfdValveDialog': './src/MfdValveDialog',
                './MfdCustom10': './src/MfdCustom10',
                './MfdCustom10Dialog': './src/MfdCustom10Dialog',
                './MfdCamSnapshot': './src/MfdCamSnapshot',
                './MfdValCamSnapshot': './src/MfdValCamSnapshot',
                './MfdCamMjpg': './src/MfdCamMjpg',
                './MfdValCamMjpg': './src/MfdValCamMjpg',
                './MfdCamVideo': './src/MfdCamVideo',
                './MfdValCamVideo': './src/MfdValCamVideo',
                './MfdCamVideoObject': './src/MfdCamVideoObject',
                './translations': './src/translations.ts',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
            dts: false,
        }),
        topLevelAwait({
            promiseExportName: '__tla',
            promiseImportName: (i: number): string => `__tla_${i}`,
        }),
        react(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/_socket': 'http://localhost:8082',
            '/vis-2': 'http://localhost:8082',
            '/adapter': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082/vis-2',
            '/widgets.html': 'http://localhost:8082/vis-2',
            '/web': 'http://localhost:8082',
            '/state': 'http://localhost:8082',
        },
    },
    base: './',
    resolve: {
        tsconfigPaths: true,
        // Same set as the shared modules above: the fallback copies inside the bundle must be unique too
        dedupe: ['react', 'react-dom'],
    },
    build: {
        target: 'chrome81',
        outDir: './build',
        rollupOptions: {
            onwarn(warning: { code: string }, warn: (warning: { code: string }) => void): void {
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            },
        },
    },
};

export default config;
