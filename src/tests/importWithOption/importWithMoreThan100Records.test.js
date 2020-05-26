import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Import data with number of records > 100', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData110Record;
    const expectedDataFile = filePaths.import_test.importCSVData110RecordExpected;
    let fieldNames = '';

    test('C011: Verify that data is imported correctly with username/password for an app', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C024: Verify that data is imported correctly with correct Basic Authentication Username/Password', async () => {
        const basicAuthUser = users.basicAuthUser;
        const appBasicAuth = apps.basicAuthApp;
        await deleteAllAppData(appBasicAuth, userCreds, basicAuthUser);

        const importTest = new ImportTestCommon(appBasicAuth, userCreds, importedCSVFile);

        const result = await importTest.importWithBasicAuth(basicAuthUser);

        importTest.verifyCliKintoneSuccessMessage(result);

        await importTest.verifyImportedData(fieldNames, expectedDataFile, '', basicAuthUser);

        await deleteAllAppData(appBasicAuth, userCreds, basicAuthUser);
    });

    test('C031: Verify that data can be imported with API Token', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAuthToken(appInfo.apiToken.fullPermission);
        importTest.verifyCliKintoneSuccessMessage(result);

        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C100: Verify that all records will be deleted before inserting', async () => {
        // Import data in the first time
        const importTest1 = new ImportTestCommon(appInfo, userCreds, importedCSVFile);
        const result1 = await importTest1.importWithUserNamePassword();

        // Import data in the second time with delete record argument (-D)
        const otherArg = '-D';
        const importTest2 = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );
        const result2 = await importTest2.importWithUserNamePassword();

        // Verify cli-kintone success message in the first time
        importTest1.verifyCliKintoneSuccessMessage(result1);
        // Verify cli-kintone success message in the second time
        importTest2.verifyCliKintoneSuccessMessage(result2);

        // Verify imported data from kintone app just include data from the second import
        const fieldNamesArray = await getFieldArray(importedCSVFile);
        await importTest2.verifyImportedData(fieldNamesArray, expectedDataFile);
    });

    test('C110: Verify that user can specify which line will be imported from file and data will be imported correctly', async () => {
        const otherArg = '-l 5';
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            otherArg
        );

        const result = await importTest.importWithUserNamePassword();

        // Verify cli-kintone success message
        importTest.verifyCliKintoneSuccessMessage(result);

        // Verify imported data from kintone app
        const expectedFile = filePaths.import_test.importDataWithLineParam110RecordExpected;
        await importTest.verifyImportedData(fieldNames, expectedFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
        fieldNames = await getFieldArray(importedCSVFile);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
