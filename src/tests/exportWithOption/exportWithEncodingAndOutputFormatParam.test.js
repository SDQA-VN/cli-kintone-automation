import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export with --export option: Export data with encoding and output format (-e) (-o)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation;
    let fieldNames = '';

    test('Case 163: Verify that data can be exported in csv format with sjis', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e sjis';
        const outputFormatArg = '-o csv';
        const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            encodingArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataSjisExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 163: Guest space - Verify that data can be exported in csv format with sjis', async () => {
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
        const encodingArg = '-e sjis';
        const outputFormatArg = '-o csv';
        const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;

        const exportTest = new ExportTestCommon(
            guestSpaceApp,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            encodingArg,
            outputFormatArg,
            guestSpaceArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataSjisGuestSpaceAppExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(guestSpaceApp, userCreds);
    });

    test('Case 164: Verify that data can be exported in json format with euc-jp', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e euc-jp';
        const outputFormatArg = '-o json';
        const actualExportedDataFile = filePaths.export_test.actualExportedJsonData;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            encodingArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportJsonDataWithEncodingOutputFormatParamExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile, true);
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
