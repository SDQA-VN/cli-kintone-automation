import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe.skip('Import with --import without option: Import new attachment with file (-b)', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVDataWithAttachment;
    const attachmentFolder = filePaths.attachmentFolder;
    const query = makeQueryToGetAppData();

    test('C227: Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile, false);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachmentExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C227: Guest space - Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedCSVFile,
            false,
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

    test('C228: Verify the case with attachment are text files, image files or exe files (doc, xls, csv, png, jpg, exe)', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithMultiAttachments;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile, false);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithMultiAttachmentsExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    // This case take a lot of time to execute, especially when the network is slow
    // So it will be temporary set as skip
    test.skip('C229: Verify the case in which upload file size is large (e.g.. <=10 Mb)', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithLargeAttachment;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile, false);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C230: Verify the case uploading multiple files to one record', async () => {
        const importedDataFile = filePaths.import_test.importCSVDataWithMultiAttachmentsOnOneRecord;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile, false);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedDataFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C232: Using API Token - Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile, false);

        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            attachmentFolder
        );

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    test('C233: Verify that error will be displayed when user import a file with file size over 10MB', async () => {
        const importedDataFile = filePaths.import_test.importDataWithAttachmentOver10M;
        const importTest = new ImportTestCommon(appInfo, userCreds, importedDataFile, false);

        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            attachmentFolder
        );

        importTest.verifyAttachmentFileOver10MBError(result);
    });

    test('C234: Verify that error will be displayed when user specify wrong path to attachment files', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile, false);
        const result = await importTest.importWithAttachmentByAuthToken(
            appInfo.apiToken.fullPermission,
            'src'
        );

        importTest.verifyNonexistentDirectoryError(result);
    });

    test('C235: Verify that error will be displayed if user do not have proper permission on the attachment field', async () => {
        const userCredsWithoutAttachmentFieldView = users.userNoViewAttachmentFile;
        const importTest = new ImportTestCommon(
            appInfo,
            userCredsWithoutAttachmentFieldView,
            importedCSVFile,
            false
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
