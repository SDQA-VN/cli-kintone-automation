import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';
import errorMessage from '../../common/kintoneCliErrorMessage';

describe('Export without --export option: Authenticate with token (-t)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 299: Verify that data can be exported with API Token', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            undefined,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithAuthToken(appInfo.apiToken.fullPermission);

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 299: Guest space -  Verify that data can be exported with API Token', async () => {
        const guestSpaceApp = apps.guestSpaceApp.appWithoutAttachment;
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;

        // Remove old data if any, then prepare test data for app in guest space
        await deleteAllAppData(guestSpaceApp, userCreds);
        const importTest = new ImportTestCommon(
            guestSpaceApp,
            userCreds,
            preparedCSVFile,
            true,
            guestSpaceArg
        );
        await importTest.importWithUserNamePassword();

        // Test exporting data
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            guestSpaceApp,
            undefined,
            actualExportedDataFile,
            false,
            fieldArg,
            guestSpaceArg
        );

        await exportTest.exportWithAuthToken(guestSpaceApp.apiToken.fullPermission);

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 300: Verify that error will be displayed when using wrong API Token', async () => {
        const exportTest = new ExportTestCommon(appInfo, undefined, actualExportedDataFile, false);

        const result = await exportTest.exportWithAuthToken('invalid_token');

        const expectedError = errorMessage.INVALID_API_TOKEN_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('Case 301: Verify that error will be displayed when using API Token without View Record permission', async () => {
        const exportTest = new ExportTestCommon(appInfo, undefined, actualExportedDataFile, false);

        const result = await exportTest.exportWithAuthToken(appInfo.apiToken.noPermission);

        const expectedError = errorMessage.NO_PERMISSION_API_TOKEN_ERROR;
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('Case 303: Verify that data can be exported correctly when using both Basic Authentication and API Token', async () => {
        // Delete existing records (if any), then prepare records for app with basice authentication
        const basicAuthUser = users.basicAuthUser;
        const basicAuthAppInfo = apps.basicAuthApp.appWithoutAttachment;
        await deleteAllAppData(basicAuthAppInfo, userCreds, basicAuthUser);

        const importTest = new ImportTestCommon(basicAuthAppInfo, userCreds, preparedCSVFile);

        await importTest.importWithBasicAuth(basicAuthUser);

        // Export data using both Basic Authentication and API Token
        const basicAuthArg = ` -U ${basicAuthUser.username} -P ${basicAuthUser.password}`;
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            basicAuthAppInfo,
            undefined,
            actualExportedDataFile,
            false,
            fieldArg,
            basicAuthArg
        );

        await exportTest.exportWithAuthToken(basicAuthAppInfo.apiToken.fullPermission);

        // Verification
        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        // Remove test data
        await deleteAllAppData(basicAuthAppInfo, userCreds, basicAuthUser);
    });

    test('Case 304: Verify that data can be exported correctly when using both user/pass and API Token', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const appTokenArg = ' -t ' + appInfo.apiToken.fullPermission;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            appTokenArg
        );

        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 305: Verify that data can be exported when using incorrect user/pass but correct API Token', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const invalidAuth = { username: 'invalidUser', password: 'wrongPassword' };
        const appTokenArg = ' -t ' + appInfo.apiToken.fullPermission;
        const exportTest = new ExportTestCommon(
            appInfo,
            invalidAuth,
            actualExportedDataFile,
            false,
            fieldArg,
            appTokenArg
        );

        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);

        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithUserNamePassword();

        fieldNames = await getFieldArray(preparedCSVFile);
        // Remove some field names which their values are incremental ids
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
