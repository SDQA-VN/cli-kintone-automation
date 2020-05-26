import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Authenticate with token (-t)', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVData;

    test('C031: Verify that data can be imported with API Token', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAuthToken(appInfo.apiToken.fullPermission);
        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C031: Guest space - Verify that data can be imported with API Token', async () => {
        const guestSpaceApp = apps.guestSpaceApp;

        await deleteAllAppData(guestSpaceApp, userCreds);

        const importedFile = filePaths.import_test.importCSVDataGuestSpaceApp;
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            importedFile,
            true,
            guestSpaceArg
        );

        const result = await importTest.importWithAuthToken(guestSpaceApp.apiToken.fullPermission);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedFile);
        const expectedDataFile = filePaths.import_test.importCSVDataGuestSpaceAppExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('C032: Verify that error will be displayed when using wrong API Token', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAuthToken('invalidAppToken');

        const expectedError = errorMessage.INVALID_API_TOKEN_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C033: Verify that error will be displayed when using API Token without View Record permission', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAuthToken(appInfo.apiToken.noPermission);

        const expectedError = errorMessage.NO_PERMISSION_API_TOKEN_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C034: Verify that data can NOT be imported when using API Token without View Record permission + Manage App permission', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);

        const result = await importTest.importWithAuthToken(appInfo.apiToken.noPermission);

        const expectedError = errorMessage.NO_PERMISSION_API_TOKEN_ERROR;
        importTest.verifyAppErrorMessage(result, expectedError);
    });

    test('C035: Verify that data can be imported correctly when using both Basic Authentication and API Token', async () => {
        const basicAuthAppInfo = apps.basicAuthApp;
        const basicAuthUser = users.basicAuthUser;
        const basicAuthArg = `-U ${basicAuthUser.username} -P ${basicAuthUser.password}`;
        const importTest = new ImportTestCommon(
            basicAuthAppInfo,
            userCreds,
            importedCSVFile,
            true,
            basicAuthArg
        );

        const result = await importTest.importWithAuthToken(
            basicAuthAppInfo.apiToken.fullPermission
        );

        importTest.verifyCliKintoneSuccessMessage(result);

        await deleteAllAppData(basicAuthAppInfo, userCreds, users.basicAuthUser);
    });

    test('C036: Verify that data can be imported correctly when using both user/pass and API Token', async () => {
        const appTokenArg = `-t ${appInfo.apiToken.fullPermission}`;
        const importTest = new ImportTestCommon(
            appInfo,
            userCreds,
            importedCSVFile,
            true,
            appTokenArg
        );

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
    });

    test('C037: Verify that data can be imported when using incorrect user/pass but correct API Token', async () => {
        const invalidAuth = { username: 'invalidUser', password: 'wrongPassword' };
        const appTokenArg = `-t ${appInfo.apiToken.fullPermission}`;
        const importTest = new ImportTestCommon(
            appInfo,
            invalidAuth,
            importedCSVFile,
            true,
            appTokenArg
        );

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
