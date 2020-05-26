import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Import new attachment with file (-b)', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVDataWithAttachment;
    const attachmentFolder = filePaths.attachmentFolder;
    const query = makeQueryToGetAppData();

    test('C050: Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachmentExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C050: Guest space - Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            true,
            guestSpaceArg
        );

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachmentExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C051: Verify the case with attachment are text files, image files or exe files (doc, xls, csv, png, jpg, exe)', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithMultiAttachments;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithMultiAttachmentsExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    // This case take a lot of time to execute, especially when the network is slow
    // So it will be temporary set as skip
    test('C052: Verify the case in which upload file size is large (e.g.. <=10 Mb)', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithLargeAttachment;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C053: Verify the case uploading multiple files to one record', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithMultiAttachmentsOnOneRecord;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C055: Using API Token - Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            attachmentFolder
        );
        await importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C056: Verify that error will be displayed when user import a file with file size over 10MB', async () => {
        const importedDataFile = filePaths.import_test.importDataWithAttachmentOver10M;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile);

        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            attachmentFolder
        );

        importTest.verifyAttachmentFileOver10MBError(result);
    });

    test('C057: Verify that error will be displayed when user specify wrong path to attachment files', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);
        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            'src'
        );

        importTest.verifyNonexistentDirectoryError(result);
    });

    test('C058: Verify that error will be displayed if user do not have proper permission on the attachment field', async () => {
        const userCredsWithoutAttachmentFieldView = users.userNoViewAttachmentFile;
        const importTest = new ImportTestCommon(
            appInfo,
            userCredsWithoutAttachmentFieldView,
            importedCSVFile
        );
        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyNoViewPermissionErrorMessage(result, 'Attachment');
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
