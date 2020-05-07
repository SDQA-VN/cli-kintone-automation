import CliKintoneTestBase from './CliKintoneTestBase';
import { executeCommand, hashCsvFile } from './helper';
import { getAttachmentList } from '../utils/csvUtils';
import { getFileContent, deleteFolderRecursive } from '../utils/fileUtils';
import { getAppDataByApi, getFileContentByApi } from '../utils/kintoneApiUtils';
import { filePaths } from './config';
import * as fs from 'fs';

const os_system = process.platform;

export default class ExportTestCommon extends CliKintoneTestBase {
    constructor(appInfo, auth, exportFile, hasExportArg, ...otherArgs) {
        super(appInfo, auth);
        this._exportFile = exportFile;
        this._exportOption = ' --export';
        if (!hasExportArg) {
            this._exportOption = '';
        }
        this._otherArgs = otherArgs;
    }

    /**
     * @returns {Promise<string>}
     */
    async exportWithUserNamePassword() {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}`;

        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }
        command += `${this._exportOption} > ${this._exportFile}`;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @returns {Promise<string>}
     */
    async exportWithUserNameAndInputPassword() {
        let command =
            `echo ${this._auth.password}|` +
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}`;

        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }
        command += `${this._exportOption} > ${this._exportFile}`;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {Object} basicAuthUser
     * @returns {Promise<string>}
     */
    async exportWithBasicAuth(basicAuthUser) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            ` -U ${basicAuthUser.username}` +
            ` -P ${basicAuthUser.password}`;

        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }
        command += `${this._exportOption} > ${this._exportFile}`;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {string} apiToken
     * @returns {Promise<string>}
     */
    async exportWithAuthToken(apiToken) {
        let command =
            this._kintoneCli +
            ` -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -t ${apiToken}`;

        if (this._otherArgs) {
            this._otherArgs.forEach(arg => {
                command += ` ${arg}`;
            });
        }
        command += `${this._exportOption} > ${this._exportFile}`;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @returns {Promise<string>}
     */
    async exportWithDuplicateArgument() {
        const command =
            this._kintoneCli +
            ` -a -a ${this._appInfo.appId}` +
            ` -d ${this._appInfo.domain}` +
            ` -u ${this._auth.username}` +
            ` -p ${this._auth.password}` +
            `${this._exportOption} > ${this._exportFile}`;

        const result = await executeCommand(command);
        return result;
    }

    /**
     * @param {String} exportDataActual
     * @param {String} exportDataExpected
     * @param {boolean} isJson
     * @returns {Promise<void>}
     */
    async verifyExportedData(exportDataActual, exportDataExpected, isJson = false) {
        const hashOfExportExpectedFile = await hashCsvFile(exportDataExpected, isJson);
        const hashOfExportFile = await hashCsvFile(exportDataActual, isJson);

        await expect(hashOfExportFile).toEqual(hashOfExportExpectedFile);
    }

    /**
     * @param {String} folderAttachmentPath
     * @param {[String]} fieldNames
     * @param {String} query
     * @param {Object} basicAuth
     * @returns {Promise<void>}
     */
    async verifyExportAttachmentFileData(
        folderAttachmentPath,
        fieldNames,
        query = '',
        basicAuth = {}
    ) {
        const expectedAttachmentFileNames = await getAttachmentList(this._exportFile);
        const expectedFileContentArray = [];
        for (const fileName of expectedAttachmentFileNames) {
            const filePath = folderAttachmentPath + fileName;
            expectedFileContentArray.push(await getFileContent(filePath));
        }

        // Verify the attachment file name between csv file and data get from app by rest api
        const folderAndFile = await this._getActualFolderAndFile(
            folderAttachmentPath,
            fieldNames,
            query,
            basicAuth
        );

        await expect(folderAndFile.fileNames).toEqual(
            expect.arrayContaining(expectedAttachmentFileNames)
        );
        await expect(expectedFileContentArray).toEqual(
            expect.arrayContaining(folderAndFile.fileContents)
        );

        // remove folder attachment after verify
        for (const folderPath of folderAndFile.folders) {
            await deleteFolderRecursive(folderPath);
        }

        if (folderAttachmentPath !== filePaths.attachmentFolder) {
            await fs.rmdirSync(folderAttachmentPath);
        }
    }

    async _getActualFolderAndFile(folderAttachmentPath, fieldNames, query, basicAuth = {}) {
        let getAllRecordsRes;
        await getAppDataByApi(this._appInfo, this._auth, fieldNames, query, basicAuth).then(
            (res, err) => {
                if (err) {
                    console.log(err);
                }
                getAllRecordsRes = res;
            }
        );

        const actualAttachmentFileNames = [];
        const actualFileContentArray = [];
        const actutalFolderAttachment = [];
        for (let i = 0; i < getAllRecordsRes.length; i++) {
            const attachmentField = getAllRecordsRes[i].Attachment.value;
            if (attachmentField) {
                for (const element of attachmentField) {
                    if (os_system === 'win32') {
                        actualAttachmentFileNames.push(`Attachment-${i}\\` + element.name);
                    }
                    actualAttachmentFileNames.push(`Attachment-${i}/` + element.name);
                    const res = await getFileContentByApi(
                        this._appInfo,
                        this._auth,
                        element.fileKey
                    );
                    actualFileContentArray.push(res.toString('utf8'));
                    actutalFolderAttachment.push(folderAttachmentPath + `Attachment-${i}`);
                }
            } else {
                actualAttachmentFileNames.push('');
            }
        }

        return {
            folders: actutalFolderAttachment,
            fileNames: actualAttachmentFileNames,
            fileContents: actualFileContentArray,
        };
    }
}
