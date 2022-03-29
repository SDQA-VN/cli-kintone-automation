const fs = require('fs-extra');
const mv = require('mv');
const request = require('request');
const unzip = require('unzip-stream');
const progress = require('cli-progress');

const releasedVersion = process.env.RELEASE_VERSION;

const baseReleasedUrl = `https://github.com/kintone-labs/cli-kintone/releases/download/${releasedVersion}`;
    // Ref: https://nodejs.org/api/process.html#process_process_platform
    macOS: 'darwin',
    windows: 'win32',
    linux: ['linux', 'freebsd', 'openbsd', 'sunos', 'aix'],
};

/**
 * @param {string} platform
 * @returns {{fileName: string, archiveName: string, filePath: string, releasedUrl: string}|{fileName: string, archiveName: string, filePath: string, releasedUrl: string}|{fileName: string, archiveName: string, filePath: string, releasedUrl: string}}
 */
const getCompatibleBuild = platform => {
    let buildInfo = {};
    switch (platform) {
        case platforms.macOS:
            buildInfo = {
                fileName: 'cli-kintone',
                filePath: 'build/macos-x64/',
                archiveName: 'macos-x64.zip',
                releasedUrl: `${baseReleasedUrl}/macos-x64.zip`,
            };
            break;
        case platforms.windows:
            buildInfo = {
                fileName: 'cli-kintone.exe',
                filePath: 'build/windows-x64/',
                archiveName: 'windows-x64.zip',
                releasedUrl: `${baseReleasedUrl}/windows-x64.zip`,
            };
            break;
        default:
            // linux cases
            buildInfo = {
                fileName: 'cli-kintone',
                filePath: 'build/linux-x64/',
                archiveName: 'linux-x64.zip',
                releasedUrl: `${baseReleasedUrl}/linux-x64.zip`,
            };
    }
    return buildInfo;
};

/**
 * @param {string} releasedUrl
 * @param {string} archiveName
 * @returns {Promise<>}
 */
async function downloadCliKintoneBuild(releasedUrl, archiveName) {
    return new Promise(resolve => {
        const progressBar = new progress.SingleBar(
            {
                format: 'Downloading progress: {bar} {percentage}% | ETA: {eta}s',
            },
            progress.Presets.legacy
        );

        const writer = fs.createWriteStream(archiveName);
        let receivedBytes = 0;

        request
            .get(releasedUrl)
            .on('response', response => {
                if (response.statusCode !== 200) {
                    console.error('Response status was ' + response.statusCode);
                    return;
                }
                const totalBytes = response.headers['content-length'];
                progressBar.start(totalBytes, 0);
            })
            .on('data', chunk => {
                receivedBytes += chunk.length;
                progressBar.update(receivedBytes);
            })
            .pipe(writer)
            .on('error', err => {
                fs.unlink(archiveName);
                progressBar.stop();
                console.error(err.message);
                return;
            });

        writer.on('finish', () => {
            progressBar.stop();
            writer.close(resolve);
        });

        writer.on('error', err => {
            fs.unlink(archiveName);
            progressBar.stop();
            console.error(err.message);
            return;
        });
    });
}

/**
 * @param {string} archiveName
 * @returns {Promise<>}
 */
async function unzipCliKintoneBuild(archiveName) {
    return new Promise(resolve => {
        fs.createReadStream(`./${archiveName}`)
            .pipe(unzip.Extract({ path: './' }))
            .on('close', () => {
                resolve();
            });
    });
}

/**
 * @param {string} filePath
 * @param {string} fileName
 * @returns {Promise<void>}
 */
async function moveCliKintoneToRootFolder(filePath, fileName) {
    const currentPath = `./${filePath}${fileName}`;
    const newPath = `./${fileName}`;

    mv(currentPath, newPath, err => {
        if (err) {
            console.error(err);
        } else {
            fs.chmodSync(newPath, '777');
        }
    });
}

async function removeBuildFolder() {
    try {
        await fs.remove('./build');
    } catch (err) {
        console.error(err);
    }
}

/**
 * @param {string} archiveName
 * @returns {Promise<void>}
 */
async function removeBuildArchive(archiveName) {
    fs.unlinkSync(archiveName);
}

module.exports = async () => {
    const buildInfo = getCompatibleBuild(process.platform);
    const path = './' + buildInfo.fileName;

    if (!fs.existsSync(path)) {
        console.log(`\n--------- START PREPARATION CLI-KINTONE BUILD ${releasedVersion}----------`);
        await downloadCliKintoneBuild(buildInfo.releasedUrl, buildInfo.archiveName);

        console.log('start unzip ... ');
        await unzipCliKintoneBuild(buildInfo.archiveName);
        console.log('unzip finished ... ');

        console.log('move cli to root ... ');
        await moveCliKintoneToRootFolder(buildInfo.filePath, buildInfo.fileName);
        console.log('move finished ... ');

        console.log('remove build folder ... ');
        await removeBuildFolder('./build');
        console.log('remove finished ... ');

        console.log('remove archive folder ... ');
        await removeBuildArchive(buildInfo.archiveName);
        console.log('remove finished ... ');

        console.log(`--------- FINISHED PREPARATION CLI-KINTONE BUILD ${releasedVersion}----------`);
    } else {
        console.log('\n--------- CLI-KINTONE EXIT ----------');
    }
};
