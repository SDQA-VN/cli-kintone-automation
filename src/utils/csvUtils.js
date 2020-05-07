const csv = require('csv-parser');
const fs = require('fs');

/**
 * @param {string} csvFilePath
 * @returns {Promise<>}
 */
const getAttachmentList = async csvFilePath => {
    return new Promise(resolve => {
        const fileNameArray = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', row => {
                const filenameArray = row.Attachment.split('\n');
                for (const i of filenameArray) {
                    fileNameArray.push(i.trim());
                }
            })
            .on('end', () => {
                resolve(fileNameArray);
            });
    });
};

/**
 * @param {string} csvFilePath
 * @returns {Promise<>}
 */
const getFieldArray = async csvFilePath => {
    return new Promise(resolve => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('headers', headers => {
                resolve(headers);
            });
    });
};

module.exports = { getAttachmentList, getFieldArray };
