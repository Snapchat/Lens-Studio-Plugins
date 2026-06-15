const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const DESIGN_SYSTEM_PATH = path.join(__dirname, '..', '..', 'Internal', 'Gen-Ai-Suite-Design-System', 'Src');
const DESIGN_SYSTEM_NAME = 'Gen-Ai-Suite-Design-System';
const SRC_DIR = path.join(__dirname, 'Src');
const BUILD_DIR = path.join(__dirname, 'Build');
const DESIGN_SYSTEM_OUT = path.join(BUILD_DIR, DESIGN_SYSTEM_NAME);

function getDesignSystemAliases() {
    const tsconfigPath = path.join(__dirname, '..', '..', 'Internal', 'Gen-Ai-Suite-Design-System', 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    const paths = tsconfig.compilerOptions?.paths || {};
    return Object.keys(paths)
        .filter(key => key.startsWith('@') && key.endsWith('/*'))
        .map(key => key.slice(1, -2));
}

const DESIGN_SYSTEM_ALIASES = getDesignSystemAliases();

const ASSET_EXTENSIONS = [
    '.json', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.css', '.html',
    '.lspkg', '.zip', '.remoteReferenceAsset',
];

function findTsFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) files.push(...findTsFiles(fullPath));
        else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) files.push(fullPath);
    }
    return files;
}

function copyAssets(srcDir, destDir) {
    if (!fs.existsSync(srcDir)) return;
    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);
        if (entry.isDirectory()) {
            copyAssets(srcPath, destPath);
        } else if (ASSET_EXTENSIONS.includes(path.extname(entry.name))) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
            console.log(`  Asset: ${path.relative(__dirname, srcPath)}`);
        }
    }
}

function rewriteImports(filePath, isDesignSystem) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileDir = path.dirname(filePath);

    content = content.replace(
        /(from\s+["'])@design-system(\/[^"']*)?(['"]);?/g,
        (_, prefix, subPath, suffix) => {
            const targetPath = subPath
                ? path.join(DESIGN_SYSTEM_OUT, subPath + '.js')
                : path.join(DESIGN_SYSTEM_OUT, 'index.js');
            let rel = path.relative(fileDir, targetPath);
            if (!rel.startsWith('.')) rel = './' + rel;
            return prefix + rel + suffix;
        }
    );

    if (isDesignSystem && DESIGN_SYSTEM_ALIASES.length > 0) {
        const aliasPattern = new RegExp(
            `(from\\s+["'])@(${DESIGN_SYSTEM_ALIASES.join('|')})(\\/[^"']*)?(['"]);?`,
            'g'
        );
        content = content.replace(aliasPattern, (_, prefix, folder, subPath, suffix) => {
            const targetPath = path.join(DESIGN_SYSTEM_OUT, folder, (subPath || '') + '.js');
            let rel = path.relative(fileDir, targetPath);
            if (!rel.startsWith('.')) rel = './' + rel;
            return prefix + rel + suffix;
        });
    }

    content = content.replace(
        /(from\s+["'])(\.\.?\/[^"']+)(['"]);?/g,
        (match, prefix, importPath, suffix) => {
            if (!importPath.endsWith('.js')) return prefix + importPath + '.js' + suffix;
            return match;
        }
    );

    fs.writeFileSync(filePath, content);
}

async function build() {
    console.log('Building BitmojiStories...');

    const mainFiles = findTsFiles(SRC_DIR);
    for (const file of mainFiles) {
        const outFile = path.join(BUILD_DIR, path.relative(SRC_DIR, file).replace('.ts', '.js'));
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        await esbuild.build({
            entryPoints: [file],
            outfile: outFile,
            format: 'esm',
            target: 'es2020',
            bundle: false,
        });
        rewriteImports(outFile, false);
        console.log(`  TS: ${path.relative(__dirname, file)}`);
    }

    const dsFiles = findTsFiles(DESIGN_SYSTEM_PATH);
    for (const file of dsFiles) {
        const outFile = path.join(DESIGN_SYSTEM_OUT, path.relative(DESIGN_SYSTEM_PATH, file).replace('.ts', '.js'));
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        await esbuild.build({
            entryPoints: [file],
            outfile: outFile,
            format: 'esm',
            target: 'es2020',
            bundle: false,
        });
        rewriteImports(outFile, true);
        console.log(`  TS: ${DESIGN_SYSTEM_NAME}/${path.relative(DESIGN_SYSTEM_PATH, file)}`);
    }

    copyAssets(SRC_DIR, BUILD_DIR);
    copyAssets(DESIGN_SYSTEM_PATH, DESIGN_SYSTEM_OUT);

    console.log('Build complete!');
}

function watch() {
    console.log('Watching for changes...');
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([SRC_DIR, DESIGN_SYSTEM_PATH], {
        persistent: true,
        ignoreInitial: true,
        ignored: ['**/*.d.ts']
    });
    watcher.on('all', async (event, filePath) => {
        console.log(`\n${event}: ${filePath}`);
        try {
            await build();
        } catch (err) {
            console.error('Build failed:', err.message || err);
            console.log('Waiting for changes...');
        }
    });
}

build().then(() => {
    if (process.argv.includes('--watch')) watch();
}).catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
