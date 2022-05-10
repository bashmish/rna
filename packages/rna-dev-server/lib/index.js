import { stat } from 'fs/promises';
import path from 'path';
import { readConfigFile, mergeConfig, locateConfigFile } from '@chialab/rna-config-loader';
import { createLogger, colors } from '@chialab/rna-logger';
import { DevServer, getPort, portNumbers } from '@chialab/es-dev-server';
import cors from '@koa/cors';
import range from 'koa-range';
import nodeResolvePlugin from '@chialab/wds-plugin-node-resolve';
import { rnaPlugin, entrypointsPlugin } from '@chialab/wds-plugin-rna';
import { hmrCssPlugin } from '@chialab/wds-plugin-hmr-css';
import { hmrPlugin } from './plugins/hmr.js';
import { watchPlugin } from './plugins/watch.js';

/**
 * @typedef {Object} DevServerCoreConfig
 * @property {import('@chialab/rna-logger').Logger} [logger]
 * @property {import('@chialab/rna-config-loader').Entrypoint[]} [entrypoints]
 * @property {string} [manifestPath]
 * @property {string} [entrypointsPath]
 * @property {import('@chialab/node-resolve').AliasMap} [alias]
 * @property {import('esbuild').Plugin[]} [transformPlugins]
 * @property {import('@chialab/rna-config-loader').Target} [target]
 * @property {string} [jsxFactory]
 * @property {string} [jsxFragment]
 * @property {string} [jsxModule]
 * @property {import('@chialab/rna-config-loader').ExportType} [jsxExport]
 */

/**
 * @typedef {Partial<import('@chialab/es-dev-server').DevServerCoreConfig> & DevServerCoreConfig} DevServerConfig
 */

/**
 * Load configuration for the dev server.
 * @param {Partial<DevServerConfig>} [initialConfig]
 * @param {string} [configFile]
 * @returns {Promise<DevServerConfig>}
 */
export async function loadDevServerConfig(initialConfig = {}, configFile = undefined) {
    configFile = configFile || await locateConfigFile();

    const rootDir = initialConfig.rootDir || process.cwd();
    const logger = createLogger();

    /**
     * @type {import('@chialab/rna-config-loader').Config}
     */
    const config = mergeConfig(
        { root: rootDir },
        configFile ? await readConfigFile(configFile, { root: rootDir }, 'serve') : {}
    );

    const finalPlugins = initialConfig.plugins || [];
    const { servePlugins = [], plugins: transformPlugins = [] } = config;

    finalPlugins.push(...servePlugins);

    try {
        if (!finalPlugins.some((p) => p.name === 'legacy')) {
            const { legacyPlugin } = await import('@chialab/wds-plugin-legacy');
            finalPlugins.push(legacyPlugin({
                minify: true,
            }));
        }
    } catch (err) {
        //
    }

    return {
        rootDir: config.root,
        entrypointsPath: config.entrypointsPath,
        entrypoints: config.entrypoints,
        alias: config.alias,
        logger,
        transformPlugins,
        target: config.target,
        jsxFactory: config.jsxFactory,
        jsxFragment: config.jsxFragment,
        jsxModule: config.jsxModule,
        jsxExport: config.jsxExport,
        ...initialConfig,
        plugins: finalPlugins,
    };
}

/**
 * Create a dev server.
 * @param {DevServerConfig} config
 * @returns {Promise<import('@chialab/es-dev-server').DevServer>} The dev server instance.
 */
export async function createDevServer(config) {
    const root = config.rootDir ? path.resolve(config.rootDir) : process.cwd();
    const appIndex = path.join(root, 'index.html');
    let index = false;
    try {
        index = (await stat(appIndex)).isFile();
    } catch {
        //
    }
    const server = new DevServer({
        appIndex: index ? appIndex : undefined,
        ...config,
        injectWebSocket: true,
        hostname: config.hostname || 'localhost',
        port: config.port || await getPort({
            port: [
                ...portNumbers(8080, 8090),
                ...portNumbers(3000, 3100),
            ],
        }),
        rootDir: root,
        middleware: [
            cors({ origin: '*' }),
            range,
            ...(config.middleware || []),
        ],
        plugins: [
            ...(config.plugins || []),
            rnaPlugin({
                alias: config.alias,
                target: config.target,
                jsxFactory: config.jsxFactory,
                jsxFragment: config.jsxFragment,
                jsxModule: config.jsxModule,
                jsxExport: config.jsxExport,
                plugins: config.transformPlugins,
            }),
            entrypointsPlugin(config.entrypoints),
            nodeResolvePlugin({
                alias: config.alias,
            }),
            hmrPlugin(),
            watchPlugin(),
            hmrCssPlugin(),
        ],
    }, config.logger || createLogger());

    return server;
}

/**
 * Start the dev server.
 * @param {DevServerConfig} config
 * @returns {Promise<import('@chialab/es-dev-server').DevServer>} The dev server instance.
 */
export async function serve(config) {
    const root = config.rootDir || process.cwd();
    const server = await createDevServer({
        ...config,
        rootDir: root,
    });

    await server.start();

    process.on('uncaughtException', error => {
        config.logger?.error(error);
    });

    process.on('SIGINT', async () => {
        await server.stop();
        process.exit(0);
    });

    return server;
}

/**
 * @typedef {Object} ServeCommandOptions
 * @property {number} [port]
 * @property {string} [config]
 * @property {boolean|string} [manifest]
 * @property {boolean|string} [entrypoints]
 * @property {import('@chialab/rna-config-loader').Target} [target]
 * @property {string} [jsxFactory]
 * @property {string} [jsxFragment]
 * @property {string} [jsxModule]
 * @property {import('@chialab/rna-config-loader').ExportType} [jsxExport]
 */

/**
 * @param {import('commander').Command} program
 */
export function command(program) {
    program
        .command('serve [root]')
        .description('Start a web dev server (https://modern-web.dev/docs/dev-server/overview/) that transforms ESM imports for node resolution on demand. It also uses esbuild (https://esbuild.github.io/) to compile non standard JavaScript syntax.')
        .option('-P, --port <number>', 'server port number', parseInt)
        .option('-C, --config <path>', 'the rna config file')
        .option('--manifest <path>', 'generate manifest file')
        .option('--entrypoints <path>', 'generate entrypoints file')
        .option('--target <query>', 'output targets (es5, es2015, es2020)')
        .option('--jsxFactory <identifier>', 'jsx pragma')
        .option('--jsxFragment <identifier>', 'jsx fragment')
        .option('--jsxModule <name>', 'jsx module name')
        .option('--jsxExport <type>', 'jsx export mode')
        .action(
            /**
             * @param {string} root
             * @param {ServeCommandOptions} options
             */
            async (root = process.cwd(), options) => {
                const {
                    port,
                    target,
                    jsxFactory,
                    jsxFragment,
                    jsxModule,
                    jsxExport,
                } = options;

                const manifestPath = options.manifest ? (typeof options.manifest === 'string' ? options.manifest : path.join(root, 'manifest.json')) : undefined;
                const entrypointsPath = options.entrypoints ? (typeof options.entrypoints === 'string' ? options.entrypoints : path.join(root, 'entrypoints.json')) : undefined;
                const serveConfig = await loadDevServerConfig({
                    rootDir: root,
                    port,
                    manifestPath,
                    entrypointsPath,
                    target,
                    jsxFactory,
                    jsxFragment,
                    jsxModule,
                    jsxExport,
                }, options.config);

                const server = await serve(serveConfig);

                serveConfig.logger?.log(`
  ${colors.bold('rna dev server started')}

  root:     ${colors.blue.bold(path.resolve(serveConfig.rootDir || root))}
  local:    ${colors.blue.bold(`http://${server.config.hostname}:${server.config.port}/`)}
`);
            }
        );
}
