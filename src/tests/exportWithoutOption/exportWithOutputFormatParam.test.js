import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export without --export option: Export data with output format (-o)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    const actualExportedCSVDataFile = filePaths.export_test.actualExportedCSVData;
    const expectedExportedCSVDataFile = filePaths.export_test.exportCSVDataExpected;
    const actualExportedJsonDataFile = filePaths.export_test.actualExportedJsonData;
    const expectedExportedJsonDataFile = filePaths.export_test.exportJsonDataExpected;
    let fieldNames = '';

    test('Case 307: Verify that data can be exported in csv format as default when executing command without specifying -o', async () => {
        const fieldArg = `-c ${fieldNames}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedCSVDataFile,
            false,
            fieldArg
        );
        await exportTest.exportWithUserNamePassword();

        await exportTest.verifyExportedData(actualExportedCSVDataFile, expectedExportedCSVDataFile);
    });

    test('Case 307: Guest space - Verify that data can be exported in csv format as default when executing command without specifying -o', async () => {
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
            userCreds,
            actualExportedCSVDataFile,
            false,
            fieldArg,
            guestSpaceArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedCSVDataFile = filePaths.export_test.exportCSVDataGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedCSVDataFile, expectedCSVDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 308: Verify that data can be exported in json format', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o json';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedJsonDataFile,
            false,
            fieldArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        await exportTest.verifyExportedData(
            actualExportedJsonDataFile,
            expectedExportedJsonDataFile,
            true
        );
    });

    test('Case 309: Verify that data can be exported in csv format', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o csv';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedCSVDataFile,
            false,
            fieldArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        await exportTest.verifyExportedData(actualExportedCSVDataFile, expectedExportedCSVDataFile);
    });

    test('Case 310: Verify that default value "csv" will be used when using wrong format (e.g.. -o html)', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o html';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedCSVDataFile,
            false,
            fieldArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        await exportTest.verifyExportedData(actualExportedCSVDataFile, expectedExportedCSVDataFile);
    });

    test('Case 311: API Token - Verify that data can be exported in json format', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o json';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedJsonDataFile,
            false,
            fieldArg,
            outputFormatArg
        );
        await exportTest.exportWithAuthToken(appInfo.apiToken.fullPermission);

        await exportTest.verifyExportedData(
            actualExportedJsonDataFile,
            expectedExportedJsonDataFile,
            true
        );
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);

        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithUserNamePassword();

        fieldNames = await getFieldArray(preparedCSVFile);
        // Remove field names which their values are incremental ids
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
