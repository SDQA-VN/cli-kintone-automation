import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Export without --export option: Export data with number of records > 500', () => {
    let fieldNames = '';
    const appInfo = apps.normalSpaceApp.appWithAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation510Record;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;

    test('Case 280: Verify that data is exported correctly with username/password for an app', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVData510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 293: Verify that data is exported correctly with correct Basic Authentication Username/Password, and kintone username/password for an app', async () => {
        const appBasicAuth = apps.basicAuthApp.appWithoutAttachment;
        const basicAuthUser = users.basicAuthUser;

        await deleteAllAppData(appBasicAuth, userCreds, basicAuthUser);
        const importTest = new ImportTestCommon(appBasicAuth, userCreds, preparedCSVFile);
        await importTest.importWithBasicAuth(basicAuthUser);

        const fieldArg = `-c ${fieldNames}`;
        const exportTest = new ExportTestCommon(
            appBasicAuth,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg
        );

        await exportTest.exportWithBasicAuth(basicAuthUser);

        const expectedExportedDataFile = filePaths.export_test.exportCSVData510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);

        await deleteAllAppData(appBasicAuth, userCreds, basicAuthUser);
    });

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

        const expectedExportedDataFile = filePaths.export_test.exportCSVData510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 308: Verify that data can be exported in json format with euc-jp', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const outputFormatArg = '-o json';
        const encodingArg = '-e euc-jp';
        const actualExportedJsonDataFile = filePaths.export_test.actualExportedJsonData;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedJsonDataFile,
            false,
            fieldArg,
            outputFormatArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportJsonDataJpEuc510RecordExpected;
        await exportTest.verifyExportedData(actualExportedJsonDataFile, expectedExportedDataFile);
    });

    test('Case 315: Verify that data can be exported to a file with utf-16 encoding', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e utf-16';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataUtf16510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 323: Verify that data can be exported in csv format with sjis', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const encodingArg = '-e sjis';
        const outputFormatArg = '-o csv';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            encodingArg,
            outputFormatArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataSjis510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 332: Verify that only data of fields listed in -c parameter are returned', async () => {
        // get field names (Link,Text_area,Date,Time,Date_and_time,Multi_choice) for exporting data
        let fieldNameArray = await getFieldArray(preparedCSVFile);
        fieldNameArray = fieldNameArray.slice(1, 7);
        const fieldArg = `-c ${fieldNameArray}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
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
