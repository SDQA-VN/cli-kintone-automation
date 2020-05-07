import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export with --export option: Export data with number of records > 500', () => {
    let fieldNames = '';
    const appInfo = apps.normalSpaceApp.appWithAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation510Record;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;

    test('Case 148: Verify that data can be exported in json format with euc-jp', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o json';
        const encodingArg = '-e euc-jp';
        const actualExportedJsonDataFile = filePaths.export_test.actualExportedJsonData;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedJsonDataFile,
            true,
            fieldArg,
            outputFormatArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportJsonDataJpEuc510RecordExpected;
        await exportTest.verifyExportedData(actualExportedJsonDataFile, expectedExportedDataFile);
    });

    test('Case 154: Verify that data can be exported to a file with utf-8 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-8';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVData510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 163: Verify that data can be exported in csv format with sjis', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e sjis';
        const outputFormatArg = '-o csv';

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

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataSjis510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 172: Verify that only data of fields listed in -c parameter are returned', async () => {
        // get field names (Link,Text_area,Date,Time,Date_and_time,Multi_choice) for exporting data
        let fieldNameArray = await getFieldArray(preparedCSVFile);
        fieldNameArray = fieldNameArray.slice(1, 7);
        const fieldArg = `-c ${fieldNameArray}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile =
            filePaths.export_test.exportCSVDataWithFieldParam510RecordExpected;
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
