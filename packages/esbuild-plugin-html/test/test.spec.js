import esbuild from 'esbuild';
import htmlPlugin from '@chialab/esbuild-plugin-html';
import virtualPlugin from '@chialab/esbuild-plugin-virtual';
import { expect } from 'chai';

describe('esbuild-plugin-html', () => {
    it('should bundle webapp with scripts', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-R3ICRKFP.css">
</head>

<body>
    <script src="1-JOUMWTNZ.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/1-JOUMWTNZ.js')).to.be.true;
        expect(js.text).to.be.equal(`(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
`);

        expect(css.path.endsWith('/out/1-R3ICRKFP.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with scripts and sourcemaps', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            sourcemap: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index,, js,, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-JIRSVTF3.css">
</head>

<body>
    <script src="1-MFHSZCSP.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/1-MFHSZCSP.js')).to.be.true;
        expect(js.text).to.be.equal(`(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
//# sourceMappingURL=1-MFHSZCSP.js.map
`);

        expect(css.path.endsWith('/out/1-JIRSVTF3.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
/*# sourceMappingURL=1-JIRSVTF3.css.map */
`);
    });

    it('should bundle webapp with modules', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.esm.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.esm.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-R3ICRKFP.css">
</head>

<body>
    <script src="1-6ZJC3XWM.js" type="module"></script>
</body>

</html>`);

        expect(js.path.endsWith('1-6ZJC3XWM.js')).to.be.true;
        expect(js.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});

// fixture/1.js
log("test");
`);

        expect(css.path.endsWith('1-R3ICRKFP.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with modules and chunks', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.chunks.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            splitting: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, lib, chunk, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.chunks.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-R3ICRKFP.css">
</head>

<body>
    <script src="1-CHKD3JX6.js" type="module"></script>
</body>

</html>`);

        expect(js.path.endsWith('1-CHKD3JX6.js')).to.be.true;
        expect(js.text).to.be.equal(`import {
  log
} from "./chunk-GNFD7QL2.js";

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});

// fixture/1.js
import("./lib-476DRX7L.js").then(({ log: log2 }) => {
  log2("test");
});
`);

        expect(lib.path.endsWith('lib-476DRX7L.js')).to.be.true;
        expect(lib.text).to.be.equal(`import {
  log
} from "./chunk-GNFD7QL2.js";
export {
  log
};
`);

        expect(chunk.path.endsWith('chunk-GNFD7QL2.js')).to.be.true;
        expect(chunk.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

export {
  log
};
`);

        expect(css.path.endsWith('1-R3ICRKFP.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with modules and scripts', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.mixed.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const index = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('.html')));
        const iife = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('1-JOUMWTNZ.js')));
        const esm = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('2-T7UKAOZB.js')));
        const esmCss = /** @type {import('esbuild').OutputFile} */ (outputFiles.find((file) => file.path.endsWith('2-KQM7Y3VQ.css')));

        expect(outputFiles).to.have.lengthOf(5);

        expect(index.path.endsWith('/out/index.mixed.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="2-KQM7Y3VQ.css">
</head>

<body>
    <script src="1-JOUMWTNZ.js" type="application/javascript" nomodule=""></script>
    <script src="2-T7UKAOZB.js" type="module"></script>
</body>

</html>`);

        expect(iife.path.endsWith('/out/1-JOUMWTNZ.js')).to.be.true;
        expect(iife.text).to.be.equal(`(() => {
  // fixture/lib.js
  var log = console.log.bind(console);

  // fixture/index.js
  window.addEventListener("load", () => {
    log("test");
  });
})();
`);

        expect(esm.path.endsWith('/out/2-T7UKAOZB.js')).to.be.true;
        expect(esm.text).to.be.equal(`// fixture/lib.js
var log = console.log.bind(console);

// fixture/index.js
window.addEventListener("load", () => {
  log("test");
});
`);

        expect(esmCss.path.endsWith('/out/2-KQM7Y3VQ.css')).to.be.true;
        expect(esmCss.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}
`);
    });

    it('should bundle webapp with styles', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.css.html', import.meta.url).pathname],
            sourceRoot: '/',
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(2);

        expect(index.path.endsWith('/out/index.css.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-OFYYZ7M5.css">
</head>

<body>
</body>

</html>`);

        expect(css.path.endsWith('/out/1-OFYYZ7M5.css')).to.be.true;
        expect(css.text).to.be.equal(`/* fixture/index.css */
html,
body {
  margin: 0;
  padding: 0;
}

/* fixture/1.css */
body {
  color: red;
}
`);
    });

    it('should bundle webapp with virtual styles', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('./index.html', import.meta.url).pathname],
            sourceRoot: new URL('.', import.meta.url).pathname,
            chunkNames: '[name]-[hash]',
            outdir: 'out',
            bundle: true,
            write: false,
            plugins: [
                virtualPlugin([
                    {
                        path: new URL('./index.html', import.meta.url).pathname,
                        contents: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="index.css">
</head>
<body>

</body>
</html>
`,
                    },
                    {
                        path: './index.css',
                        contents: '@import \'lib.css\';',
                        loader: 'css',
                    },
                    {
                        path: 'lib.css',
                        contents: 'html { padding: 0; }',
                        loader: 'css',
                    },
                ]),
                htmlPlugin(),
            ],
        });

        const [index, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(2);

        expect(index.path.endsWith('/out/index.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1-PQALMFMQ.css">
</head>

<body>
</body>

</html>`);

        expect(css.path.endsWith('/out/1-PQALMFMQ.css')).to.be.true;
        expect(css.text).to.be.equal(`/* lib.css */
html {
  padding: 0;
}

/* index.css */

/* 1.css */
`);
    });

    it('should bundle webapp with png favicons', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.icons.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'icons/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...icons] = outputFiles;

        expect(outputFiles).to.have.lengthOf(7);

        expect(index.path.endsWith('/out/index.icons.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="icon" sizes="16x16" href="icons/favicon-16x16.png">
    <link rel="icon" sizes="32x32" href="icons/favicon-32x32.png">
    <link rel="icon" sizes="48x48" href="icons/favicon-48x48.png">
    <link rel="shortcut icon" href="icons/favicon-196x196.png">
    <link rel="icon" sizes="196x196" href="icons/favicon-196x196.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="167x167" href="icons/apple-touch-icon-ipad.png">
</head>

<body>
</body>

</html>`);

        expect(icons[0].path.endsWith('/out/icons/favicon-16x16.png')).to.be.true;
        expect(icons[0].contents.byteLength).to.be.equal(459);

        expect(icons[3].path.endsWith('/out/icons/favicon-196x196.png')).to.be.true;
        expect(icons[3].contents.byteLength).to.be.equal(6366);
    });

    it('should bundle webapp with svg favicon', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.svgicons.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'icons/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, icon] = outputFiles;

        expect(outputFiles).to.have.lengthOf(2);

        expect(index.path.endsWith('/out/index.svgicons.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="shortcut icon" href="icons/icon.svg" type="image/svg+xml">
</head>

<body>
</body>

</html>`);

        expect(icon.path.endsWith('/out/icons/icon.svg')).to.be.true;
        expect(icon.contents.byteLength).to.be.equal(1475);
    });

    it('should bundle webapp with ios splashscreens', async function() {
        this.timeout(15000);

        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.screens.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'screens/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...screens] = outputFiles;

        expect(outputFiles).to.have.lengthOf(8);

        expect(index.path.endsWith('/out/index.screens.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="screens/apple-launch-iphonex.png">
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-iphone8.png">
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="screens/apple-launch-iphone8-plus.png">
    <link rel="apple-touch-startup-image" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-iphone5.png">
    <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadair.png">
    <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadpro10.png">
    <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="screens/apple-launch-ipadpro12.png">
</head>

<body>
</body>

</html>`);

        expect(screens[0].path.endsWith('/out/screens/apple-launch-iphonex.png')).to.be.true;
        expect(screens[0].contents.byteLength).to.be.equal(21254);

        expect(screens[3].path.endsWith('/out/screens/apple-launch-iphone5.png')).to.be.true;
        expect(screens[3].contents.byteLength).to.be.equal(8536);
    });

    it('should bundle webapp with assets', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.assets.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'assets/[dir]/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...assets] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);

        expect(index.path.endsWith('/out/index.assets.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="preload" href="assets/icon.svg">
</head>

<body>
    <img src="assets/img/icon.png" alt="">
</body>

</html>`);

        assets.sort((a1, a2) => a2.contents.byteLength - a1.contents.byteLength);

        expect(assets[0].path.endsWith('/out/assets/img/icon.png')).to.be.true;
        expect(assets[0].contents.byteLength).to.be.equal(20754);

        expect(assets[1].path.endsWith('/out/assets/icon.svg')).to.be.true;
        expect(assets[1].contents.byteLength).to.be.equal(1475);
    });

    it('should bundle webapp with a webmanifest', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.manifest.html', import.meta.url).pathname],
            sourceRoot: '/',
            assetNames: 'assets/[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, ...assets] = outputFiles;
        const icons = assets.slice(0, 9);
        const manifest = assets[assets.length - 1];

        expect(outputFiles).to.have.lengthOf(17);

        expect(index.path.endsWith('/out/index.manifest.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Test">
    <title>Document</title>
    <link rel="icon" sizes="16x16" href="assets/favicon-16x16.png">
    <link rel="icon" sizes="32x32" href="assets/favicon-32x32.png">
    <link rel="icon" sizes="48x48" href="assets/favicon-48x48.png">
    <link rel="shortcut icon" href="assets/favicon-196x196.png">
    <link rel="icon" sizes="196x196" href="assets/favicon-196x196.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="167x167" href="assets/apple-touch-icon-ipad.png">
    <link rel="manifest" href="assets/manifest.webmanifest">
</head>

<body>
</body>

</html>`);

        expect(icons).to.have.lengthOf(9);
        expect(icons[0].path.endsWith('/out/assets/android-chrome-36x36.png')).to.be.true;
        expect(icons[0].contents.byteLength).to.be.equal(1135);
        expect(icons[8].path.endsWith('/out/assets/android-chrome-512x512.png')).to.be.true;
        expect(icons[8].contents.byteLength).to.be.equal(24012);

        expect(manifest.path.endsWith('/out/assets/manifest.webmanifest')).to.be.true;
        expect(manifest.text).to.be.equal(`{
  "name": "Document",
  "short_name": "Document",
  "description": "Test",
  "start_url": "/",
  "scope": "",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#fff",
  "lang": "en",
  "icons": [
    {
      "src": "./assets/android-chrome-36x36.png?hash=b3c59d86",
      "sizes": "36x36",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-48x48.png?hash=888e8a41",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-72x72.png?hash=7e749c52",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-96x96.png?hash=760fa674",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-144x144.png?hash=4dc61811",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-192x192.png?hash=9a8c49b7",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-256x256.png?hash=19ceae5d",
      "sizes": "256x256",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-384x384.png?hash=599c2926",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "./assets/android-chrome-512x512.png?hash=373686d8",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`);
    });

    it('should bundle webapp with [dir] and outbase', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            outbase: new URL('./', import.meta.url).pathname,
            entryNames: '[dir]/[name]',
            chunkNames: '[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);
        expect(index.path.endsWith('/out/fixture/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="../1.css">
</head>

<body>
    <script src="../1.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/1.js')).to.be.true;
        expect(css.path.endsWith('/out/1.css')).to.be.true;
    });

    it('should bundle webapp with [dir] without outbase', async () => {
        const { outputFiles } = await esbuild.build({
            absWorkingDir: new URL('.', import.meta.url).pathname,
            entryPoints: [new URL('fixture/index.iife.html', import.meta.url).pathname],
            sourceRoot: '/',
            entryNames: '[dir]/[name]',
            chunkNames: '[name]',
            outdir: 'out',
            format: 'esm',
            bundle: true,
            write: false,
            plugins: [
                htmlPlugin(),
            ],
        });

        const [index, js, css] = outputFiles;

        expect(outputFiles).to.have.lengthOf(3);
        expect(index.path.endsWith('/out/index.iife.html')).to.be.true;
        expect(index.text).to.be.equal(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="1.css">
</head>

<body>
    <script src="1.js" type="application/javascript"></script>
</body>

</html>`);

        expect(js.path.endsWith('/out/1.js')).to.be.true;
        expect(css.path.endsWith('/out/1.css')).to.be.true;
    });
});
