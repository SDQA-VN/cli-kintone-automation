import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Basic Authentication with params (-U) (-P)', () => {
    const appInfo = apps.basicAuthApp;
    const adminUser = users.admin;
    const basicAuthUser = users.basicAuthUser;
    const importedCSVFile = filePaths.import_test.importCSVData;
    const query = makeQueryToGetAppData();

    test('C024: Verify that data is imported correctly with correct Basic Authentication Username/Password', async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile);

        const result = await importTest.importWithBasicAuth(basicAuthUser);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile, query, basicAuthUser);
    });

    test('C024: Guest space - Verify that data is imported correctly with correct Basic Authentication Username/Password', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, adminUser);

        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            adminUser,
            importedCSVFile,
            true,
            guestSpaceArg
        );

        const result = await importTest.importWithBasicAuth(basicAuthUser);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataGuestSpaceAppExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile, query, basicAuthUser);

        await deleteAllAppData(guestSpaceApp, adminUser);
    });

    test('C025: Verify that error will be displayed when missing both Basic Authentication username and password', async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyHttpError401Message(result);
    });

    test('C026: Verify that error will be displayed when missing Basic Authentication username', async () => {
        const basicAuthPasswordArg = `-P ${basicAuthUser.password}`;
        const importTest = new ImportTestCommon(
            appInfo,
            adminUser,
            importedCSVFile,
            true,
            basicAuthPasswordArg
        );

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyHttpError401Message(result);
    });

    test('C028: Verify that error will be displayed when using wrong Basic Authentication username', async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile);

        const invalidBasicUser = { username: 'invalidUser', password: basicAuthUser.password };
        const result = await importTest.importWithBasicAuth(invalidBasicUser);

        importTest.verifyHttpError401Message(result);
    });

    test('C029: Verify that error will be displayed when using wrong Basic Authentication password', async () => {
        const importTest = new ImportTestCommon(appInfo, adminUser, importedCSVFile);

        const invalidBasicUser = { username: basicAuthUser.username, password: 'invalidPass' };
        const result = await importTest.importWithBasicAuth(invalidBasicUser);

        importTest.verifyHttpError401Message(result);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, adminUser, basicAuthUser);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, adminUser, basicAuthUser);
    });
});
