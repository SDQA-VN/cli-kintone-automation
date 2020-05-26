import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export without --export option: Basic Authentication (-U) (-P)', () => {
    const appInfo = apps.basicAuthApp.appWithoutAttachment;
    const basicAuthUser = users.basicAuthUser;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 293: Verify that data is exported correctly with correct Basic Authentication Username/Password, and kintone username/password for an app', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithBasicAuth(basicAuthUser);

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 293: Guest space -  Verify that data is exported correctly with correct Basic Authentication Username/Password, and kintone username/password for an app', async () => {
        const guestSpaceApp = apps.guestSpaceApp.appWithoutAttachment;
        const guestSpaceArg = `-g ${guestSpaceApp.spaceId}`;

        // Remove old data if any, then prepare test data for app in guest space
        await deleteAllAppData(guestSpaceApp, userCreds, basicAuthUser);
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
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            guestSpaceArg
        );

        await exportTest.exportWithBasicAuth(basicAuthUser);

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds, basicAuthUser);
    });

    test('Case 294: Verify that error will be displayed when missing both Basic Authentication username and password', async () => {
        const exportTest = new ExportTestCommon(appInfo, userCreds, actualExportedDataFile, false);

        const result = await exportTest.exportWithUserNamePassword();

        exportTest.verifyHttpError401Message(result);
    });

    test('Case 295: Verify that error will be displayed when missing Basic Authentication username', async () => {
        const basicAuthPasswordArg = ' -P ' + basicAuthUser.password;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            basicAuthPasswordArg
        );

        const result = await exportTest.exportWithUserNamePassword();

        exportTest.verifyHttpError401Message(result);
    });

    test('Case 296: Verify that error will be displayed when using wrong Basic Authentication username', async () => {
        const exportTest = new ExportTestCommon(appInfo, userCreds, actualExportedDataFile, false);

        const invalidBasicUser = { username: 'invalidUser', password: basicAuthUser.password };
        const result = await exportTest.exportWithBasicAuth(invalidBasicUser);

        exportTest.verifyHttpError401Message(result);
    });

    test('Case 297: Verify that error will be displayed when using wrong Basic Authentication password', async () => {
        const exportTest = new ExportTestCommon(appInfo, userCreds, actualExportedDataFile, false);

        const invalidBasicUser = { username: basicAuthUser.username, password: 'invalid_password' };
        const result = await exportTest.exportWithBasicAuth(invalidBasicUser);

        exportTest.verifyHttpError401Message(result);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds, basicAuthUser);

        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);

        await importTest.importWithBasicAuth(basicAuthUser);

        fieldNames = await getFieldArray(preparedCSVFile);
        // Remove some field names which their values are incremental ids
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds, basicAuthUser);
    });
});
