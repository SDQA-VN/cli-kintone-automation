const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const jsonHash = require('json-hash');

const os_system = process.platform;

/**
 * @param {string} cmd
 * @param {boolean} showHelp
 * @returns {Promise<unknown>}
 */
function executeCommand(cmd, showHelp = false) {
    return new Promise(resolve => {
        exec(cmd, (error, stdout, stderr) => {
            if (error && !showHelp) {
                if (
                    stdout &&
                    stdout.indexOf('Password') === -1 &&
                    stdout.indexOf('--help') === -1
                ) {
                    resolve(stdout);
                }
                resolve(error);
            }
            if (stderr) {
                resolve(stderr);
            }
            resolve(stdout);
        });
    });
}

/**
 * Hash csv file to string by SHA-256
 * @param {string} filePath
 * @param {boolean} isJson
 * @param {string} algorithm
 * @return {Promise<string>}
 */
function hashCsvFile(filePath, isJson = false, algorithm = 'sha256') {
    if (!isJson) {
        return new Promise((resolve, reject) => {
            const shasum = crypto.createHash(algorithm);
            try {
                const s = fs.createReadStream(filePath);
                s.on('data', function(data) {
                    shasum.update(data);
                });
                s.on('end', function() {
                    const hash = shasum.digest('hex');
                    return resolve(hash);
                });
            } catch (error) {
                return reject('calc fail');
            }
        });
    } else {
        return new Promise((resolve, reject) => {
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const jsonHashValue = jsonHash.digest(jsonData);

            return resolve(jsonHashValue);
        });
    }
}

/**
 * Detect OS (Windows, Linux, MacOS) then return appropriate cli-kintone command
 */

function getCliKintoneCommand() {
    if (os_system === 'win32') {
        return 'cli-kintone.exe';
    }
    return './cli-kintone';
}

/**
 * Make query to get data from kintone app
 */
function makeQueryToGetAppData() {
    if (os_system === 'win32') {
        return '"order by $id asc"';
    }
    return '"order by \\$id asc"';
}

module.exports = {
    hashCsvFile,
    executeCommand,
    getCliKintoneCommand,
    makeQueryToGetAppData,
};
