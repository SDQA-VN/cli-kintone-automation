const { KintoneRestAPIClient } = require('@kintone/rest-api-client');
const fs = require('fs');

/**
 * @param {Object} appInfo
 * @param {Object} userInfo
 * @param {Array} fieldNames
 * @param {String} query
 * @param {Object} basicUserInfo
 * @param {String | Int} guestSpaceId
 */
const getAppDataByApi = async (
    appInfo,
    userInfo,
    fieldNames,
    query,
    basicUserInfo = undefined,
    guestSpaceId = undefined
) => {
    const baseUrl = 'https://' + appInfo.domain;
    const headers = { baseUrl: baseUrl, auth: userInfo };

    if (basicUserInfo) {
        headers.basicAuth = basicUserInfo;
    }
    if (appInfo.spaceId !== undefined) {
        headers.guestSpaceId = appInfo.spaceId;
    } else if (guestSpaceId) {
        headers.guestSpaceId = guestSpaceId;
    }

    const request = new KintoneRestAPIClient(headers);
    try {
        const response = await request.record.getAllRecords({
            app: appInfo.appId,
            fields: fieldNames,
            query: query,
        });

        return sortObjectArray(response);
    } catch (e) {
        if (e.response) {
            return e.response;
        }
        return e;
    }
};

/**
 * @param {Object} appInfo
 * @param {Object} userInfo
 * @param {Object} basicUserInfo
 * @param {String | Int} guestSpaceId
 */
const deleteAllAppData = async (
    appInfo,
    userInfo,
    basicUserInfo = undefined,
    guestSpaceId = undefined
) => {
    const baseUrl = 'https://' + appInfo.domain;
    const headers = { baseUrl: baseUrl, auth: userInfo };

    if (basicUserInfo) {
        headers.basicAuth = basicUserInfo;
    }
    if (appInfo.spaceId !== undefined) {
        headers.guestSpaceId = appInfo.spaceId;
    } else if (guestSpaceId) {
        headers.guestSpaceId = guestSpaceId;
    }

    const request = new KintoneRestAPIClient(headers);
    try {
        const ids = [];
        const response = await request.record.getAllRecords({
            app: appInfo.appId,
            fields: ['$id'],
        });

        response.forEach(record => {
            ids.push(record.$id.value);
        });

        await _deleteRecords(request, appInfo.appId, ids);
    } catch (e) {
        if (e.response) {
            console.log(e.response);
        }
    }
};

// /**
//  * @param {Object} appInfo
//  * @param {Object} userInfo
//  * @param {Object} basicUserInfo
//  * @param {String | Int} guestSpaceId
//  * @returns {Promise<Record[]>}
//  */
// const getAttachmentFieldByApi = async (
//     appInfo,
//     userInfo,
//     basicUserInfo = undefined,
//     guestSpaceId = undefined
// ) => {
//     const baseUrl = 'https://' + appInfo.domain;
//     const headers = { baseUrl: baseUrl, auth: userInfo };
//
//     if (basicUserInfo) {
//         headers.basicAuth = basicUserInfo;
//     }
//     if (guestSpaceId) {
//         headers.guestSpaceId = guestSpaceId;
//     }
//
//     const request = new KintoneRestAPIClient(headers);
//     try {
//         const response = await request.record.getAllRecords({
//             app: appInfo.appId,
//             fields: ['Attachment'],
//         });
//
//         return response;
//     } catch (e) {
//         if (e.response) {
//             console.log(e.response);
//         }
//     }
// };

const _deleteRecords = async (request, appId, recordIds) => {
    const numberOfRecords = recordIds.length;
    const integerNumber = Math.floor(numberOfRecords / 100);

    if (numberOfRecords === 0) {
        return;
    }
    if (integerNumber === 0) {
        await request.record.deleteRecords({ app: appId, ids: recordIds });
    } else {
        const surplusNumber = numberOfRecords % 100;
        if (surplusNumber === 0) {
            for (let i = 0; i < integerNumber; i++) {
                const from = i * 99 + i;
                const to = i * 99 + i + 100;
                const deleteRecordIds = recordIds.slice(from, to);
                await request.record.deleteRecords({ app: appId, ids: deleteRecordIds });
            }
        } else {
            for (let i = 0; i < integerNumber; i++) {
                const from = i * 99 + i;
                const to = i * 99 + i + 100;
                const deleteRecordIds = recordIds.slice(from, to);
                await request.record.deleteRecords({ app: appId, ids: deleteRecordIds });
            }

            const from = integerNumber * 100;
            const to = integerNumber * 100 + surplusNumber;
            const remainRecords = to - from;

            if (remainRecords === 0) {
                const deleteRecordId = recordIds[from];
                await request.record.deleteRecords({ app: appId, ids: [deleteRecordId] });
            } else {
                const deleteRecordIds = recordIds.slice(from, to);
                await request.record.deleteRecords({ app: appId, ids: deleteRecordIds });
            }
        }
    }
};

/**
 * @param {Object} appInfo
 * @param {Object} userInfo
 * @param {Object} basicUserInfo
 * @param {String | Int} guestSpaceId
 * @returns {String}
 */
const getFileContentByApi = async (
    appInfo,
    userInfo,
    fileKey,
    basicUserInfo = undefined,
    guestSpaceId = undefined
) => {
    const baseUrl = 'https://' + appInfo.domain;
    const headers = { baseUrl: baseUrl, auth: userInfo };

    if (basicUserInfo) {
        headers.basicAuth = basicUserInfo;
    }
    if (appInfo.spaceId !== undefined) {
        headers.guestSpaceId = appInfo.spaceId;
    } else if (guestSpaceId) {
        headers.guestSpaceId = guestSpaceId;
    }

    const request = new KintoneRestAPIClient(headers);
    try {
        const result = await request.file.downloadFile({ fileKey: fileKey });

        return result;
    } catch (e) {
        if (e.response) {
            console.log(e.response);
        }
    }
};

/**
 * @param {Object} data
 * @param {string} filePath
 */
const makeJsonDataFile = async (data, filePath) => {
    /*
     * Remove $id of area on subtable
     * Reason: The $id field of subtable will be automatically generated
     * */
    data.forEach(record => {
        if (record.Table.value.length !== 0) {
            delete record.Table.value[0].id;
        }
        delete record.$id;
    });

    const json = JSON.stringify(data);
    try {
        fs.writeFileSync(filePath, json, err => {
            if (err) throw err;
        });
    } catch {
        console.log('Error: can not export json');
    }
};

/**
 * @param {Object} data
 * @param {string} filePath
 */
const makeJsonDataFileWithAttachment = async (data, filePath) => {
    /*
     * Remove $id of area on subtable
     * Reason: The $id field of subtable will be automatically generated
     * */
    data.forEach(record => {
        if (record.Table.value.length !== 0) {
            delete record.Table.value[0].id;
        }
        if (record.Attachment.value.length !== 0) {
            delete record.Attachment.value[0].fileKey;
            delete record.Attachment.value[0].size;
        }
        delete record.$id;
    });

    const json = JSON.stringify(data);
    try {
        fs.writeFileSync(filePath, json, err => {
            if (err) throw err;
        });
    } catch {
        console.log('Error: can not export json');
    }
};

const sortObjectKeysByAlphabet = obj => {
    const ordered = {};
    Object.keys(obj)
        .sort()
        .forEach(function(key) {
            ordered[key] = obj[key];
        });

    return ordered;
};

const sortObjectArray = objectArr => {
    objectArr.forEach(function(el) {
        const i = objectArr.indexOf(el);
        objectArr[i] = sortObjectKeysByAlphabet(el);
    });

    return objectArr;
};

module.exports = {
    getAppDataByApi,
    deleteAllAppData,
    makeJsonDataFile,
    makeJsonDataFileWithAttachment,
    getFileContentByApi,
};
