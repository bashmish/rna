import { access } from 'fs/promises';
import path from 'path';

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/**
 * @typedef {import('esbuild').Format} Format
 */

/**
 * @typedef {import('esbuild').Loader} Loader
 */

/**
 * @typedef {import('esbuild').Platform} Platform
 */

/**
 * @typedef {import('esbuild').Plugin} Plugin
 */

/**
 * @typedef {import('esbuild').LogLevel} LogLevel
 */

/**
 * @typedef {import('@chialab/es-dev-server').Plugin} ServePlugin
 */

/**
 * @typedef {boolean|'external'|'inline'|'both'} SourcemapType
 */

/**
 * @typedef {{ [key: string]: string }} DefineMap
 */

/**
 * @typedef {'default'|'named'|'namespace'} ExportType
 */

/**
 * @typedef {Object} CoreTransformConfig
 * @property {Format} format
 * @property {string} target
 * @property {Platform} platform
 * @property {SourcemapType} sourcemap
 * @property {string} entryNames
 * @property {string} chunkNames
 * @property {string} assetNames
 * @property {DefineMap} define
 * @property {string[]} external
 * @property {import('@chialab/node-resolve').AliasMap} alias
 * @property {string} [jsxFactory]
 * @property {string} [jsxFragment]
 * @property {string} [jsxModule]
 * @property {ExportType} [jsxExport]
 * @property {boolean} minify
 * @property {boolean} bundle
 * @property {boolean} clean
 * @property {Plugin[]} plugins
 * @property {LogLevel} logLevel
 * @property {boolean} [splitting]
 * @property {boolean|import('esbuild').WatchMode} [watch]
 */

/**
 * @typedef {Object} EntrypointConfig
 * @property {string|string[]} input
 * @property {string} [output]
 * @property {boolean} [bundle]
 * @property {Loader} [loader]
 * @property {string} [globalName]
 * @property {string} [name]
 * @property {string} [code]
 * @property {string} [root]
 * @property {string} [publicPath]
 * @property {string} [manifestPath]
 * @property {string} [entrypointsPath]
 */

/**
 * @typedef {Partial<CoreTransformConfig> & EntrypointConfig} Entrypoint
 */

/**
 * @typedef {Object} ProjectConfig
 * @property {Entrypoint[]} [entrypoints]
 * @property {string} [root]
 * @property {string} [publicPath]
 * @property {string} [manifestPath]
 * @property {string} [entrypointsPath]
 * @property {ServePlugin[]} [servePlugins]
 */

/**
 * @typedef {Partial<CoreTransformConfig> & ProjectConfig} Config
 */

/**
 * @typedef {CoreTransformConfig & Entrypoint & Omit<ProjectConfig, 'entrypoints'> & { root: string, publicPath: string, write?: boolean }} EntrypointFinalConfig
 */

/**
 * @typedef {EntrypointFinalConfig & { output: string }} EntrypointFinalBuildConfig
 */

/**
 * Convert a file path to CamelCase.
 *
 * @param {string} file The file path.
 * @returns {string}
 */
export function camelize(file) {
    const filename = path.basename(file, path.extname(file));
    return filename.replace(/(^[a-z0-9]|[-_]([a-z0-9]))/g, (g) => (g[1] || g[0]).toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * @param {Entrypoint} entrypoint
 * @param {Config} config
 * @returns {EntrypointFinalConfig}
 */
export function getEntryConfig(entrypoint, config) {
    const root = entrypoint.root || config.root || process.cwd();
    const publicPath = entrypoint.publicPath || config.publicPath || '/';
    const format = entrypoint.format || config.format || 'esm';
    const target = entrypoint.target || config.target || (format === 'iife' ? 'es5' : 'es2020');
    const platform = entrypoint.platform || config.platform || (format === 'cjs' ? 'node' : 'browser');

    if (!entrypoint.input) {
        throw new Error('Missing required `input` option');
    }

    return {
        ...entrypoint,
        root,
        publicPath,
        format,
        target,
        platform,
        sourcemap: entrypoint.sourcemap ?? config.sourcemap ?? true,
        bundle: entrypoint.bundle ?? config.bundle ?? false,
        minify: entrypoint.minify ?? config.minify ?? false,
        clean: entrypoint.clean ?? config.clean ?? false,
        splitting: entrypoint.splitting ?? config.splitting,
        globalName: entrypoint.globalName || entrypoint.name || (format === 'iife' ? camelize(Array.isArray(entrypoint.input) ? entrypoint.input[0] : entrypoint.input) : undefined),
        entryNames: entrypoint.entryNames || config.entryNames || '[name]',
        chunkNames: entrypoint.chunkNames || config.chunkNames || '[name]',
        assetNames: entrypoint.assetNames || config.assetNames || '[name]',
        define: {
            ...(entrypoint.define || {}),
            ...(config.define || {}),
        },
        external: [
            ...(entrypoint.external || []),
            ...(config.external || []),
        ],
        alias: {
            ...(entrypoint.alias || {}),
            ...(config.alias || {}),
        },
        jsxFactory: entrypoint.jsxFactory || config.jsxFactory,
        jsxFragment: entrypoint.jsxFragment || config.jsxFragment,
        jsxModule: entrypoint.jsxModule || config.jsxModule,
        jsxExport: entrypoint.jsxExport || config.jsxExport,
        plugins: [
            ...(entrypoint.plugins || []),
            ...(config.plugins || []),
        ],
        logLevel: config.logLevel || 'warning',
        watch: config.watch,
        entrypointsPath: entrypoint.entrypointsPath || config.entrypointsPath,
        manifestPath: entrypoint.manifestPath || config.manifestPath,
    };
}

/**
 * @param {Entrypoint} entrypoint
 * @param {Config} config
 * @returns {EntrypointFinalBuildConfig}
 */
export function getEntryBuildConfig(entrypoint, config) {
    if (!entrypoint.output) {
        throw new Error('Missing required `output` path');
    }

    const format = entrypoint.format || config.format;

    return /** @type {EntrypointFinalBuildConfig} */ (getEntryConfig({
        ...entrypoint,
        globalName: entrypoint.globalName || entrypoint.name || (format === 'iife' ? camelize(entrypoint.output) : undefined),
    }, config));
}

/**
 * @param {Config[]} entries
 * @returns {Config}
 */
export function mergeConfig(...entries) {
    return entries
        .reduce((config, entry) => {
            const keys = /** @type {(keyof Config)[]} */ (Object.keys(entry));

            /**
             * @type {Config}
             */
            const clone = keys
                .reduce((config, key) => {
                    if (entry[key] != null) {
                        config[key] = entry[key];
                    }

                    return config;
                }, /** @type {*} */ ({}));

            return {
                ...config,
                ...clone,
                entrypoints: [
                    ...(config.entrypoints || []),
                    ...(clone.entrypoints || []),
                ],
                external: [
                    ...(config.external || []),
                    ...(clone.external || []),
                ],
                plugins: [
                    ...(config.plugins || []),
                    ...(clone.plugins || []),
                ],
                servePlugins: [
                    ...(config.servePlugins || []),
                    ...(clone.servePlugins || []),
                ],
            };
        }, {});
}

/**
 * @typedef {'build'|'serve'} Mode
 */

/**
 * @typedef {Config|Promise<Config>|((input: Config, mode: Mode) => Config|Promise<Config>)} InputConfig
 */

/**
 * @param {string} configFile
 * @param {Config} inputConfig
 * @param {Mode} [mode]
 * @param {string} [cwd]
 * @returns {Promise<Config>}
 */
export async function readConfigFile(configFile, inputConfig, mode = 'build', cwd = process.cwd()) {
    configFile = path.isAbsolute(configFile) ? configFile : `./${configFile}`;
    const configModule = await import(path.resolve(cwd, configFile));

    /**
     * @type {InputConfig}
     */
    let config = configModule.default;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (typeof config === 'function') {
            config = config(inputConfig, mode);
            continue;
        }

        if (config instanceof Promise) {
            config = await config;
            continue;
        }

        return config || {};
    }
}

/**
 * Find the config file of the project.
 * @param {string} root The root dir to check.
 * @returns {Promise<string|undefined>} The path of the config file.
 */
export async function locateConfigFile(root = process.cwd()) {
    const file = path.join(root, 'rna.config.js');
    try {
        await access(file);
        return file;
    } catch {
        //
    }

    return;
}
