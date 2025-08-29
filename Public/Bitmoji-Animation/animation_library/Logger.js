import * as fs from 'LensStudio:FileSystem';
import * as utils from './Utils.js';

const ROOT_DIR = '/tmp/BitmojiAnimation';
const ENABLED = false;
const PRINT = false;

let currentLoggerDirName;
let tempDir;
let logString;

start();

export function start() {
    if (!ENABLED) {
        return;
    }

    currentLoggerDirName = 'Logger_' + utils.formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss');
    tempDir = new Editor.Path(ROOT_DIR + '/' + currentLoggerDirName);
    logString = '';
    log('Log Start');
    log('---------');
    log('');
    log('Logger is writing to: ' + tempDir.toString());
}

export function pack() {
    if (!ENABLED) {
        return 'none';
    }

    logToFile('log.txt', logString);
    const zipFile = new Editor.Path(ROOT_DIR + '/' + currentLoggerDirName + '.zip');
    Editor.Compression.Zip.pack(tempDir, zipFile);

    return zipFile.toString();
}

export function log(str) {
    if (!ENABLED) {
        return;
    }

    if (PRINT) {
        console.log(str);
    }

    logString += '(' + getTimeString() + ') [log] ' + str + '\n';
}

export function debug(str) {
    if (!ENABLED) {
        return;
    }

    if (PRINT) {
        console.log(str);
    }

    logString += '(' + getTimeString() + ') [debug] ' + str + '\n';
}

export function warn(str) {
    if (!ENABLED) {
        return;
    }

    if (PRINT) {
        console.warn(str);
    }

    logString += '(' + getTimeString() + ') [warn] ' + str + '\n';
}

export function error(str) {
    if (!ENABLED) {
        return;
    }

    if (PRINT) {
        console.error(str);
    }

    logString += '(' + getTimeString() + ') [error] ' + str + '\n';
}

export function logToFile(filename, content) {
    if (!ENABLED) {
        return;
    }

    let name = filename;
    let ext = '';
    const dotIndex = filename.indexOf('.');
    if (dotIndex > 0) {
        name = filename.substr(0, dotIndex);
        ext = filename.substr(dotIndex + 1);
    }

    try {
        const fullname = name + '_' + utils.formatDate(new Date(), 'yyyy-MM-dd-HH-mm-ss') + '.' + ext;

        if (!fs.exists(tempDir)) {
            fs.createDir(tempDir, { recursive: true });
        }

        const path = tempDir.appended(new Editor.Path(fullname));
        log('writing debug log to file: ' + path.toString());
        fs.writeFile(path, content);
    } catch (e) {
        error('could not write file: ' + filename);
        error(e);
    }
}

function getTimeString() {
    return utils.formatDate(new Date(), 'HH:mm:ss');
}
