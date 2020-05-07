import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';
import errorMessage from '../../common/kintoneCliErrorMessage.json';
import { getFileContent } from '../../utils/fileUtils';

describe('Export with --export option: Export data using query (-q)', () => {
    const appInfo = apps.normalSpaceApp.appWithoutAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparation11000Record;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    let fieldNames = '';

    test('Case 166: Verify that data will be returned when using the query which match record in kintone', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const queryArg = '-q "Number > 99"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            queryArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVData11000RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 167: Verify that data will be returned when using the query with -q include limit, offset', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const queryArg = '-q "Number > 500 limit 10 offset 0"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            queryArg
        );
        await exportTest.exportWithUserNamePassword();

        const expectedExportedDataFile = filePaths.export_test.exportCSVDataWithQueryLimitExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    test('Case 168: Verify that the error message will be returned in file exported when using the query which doesnot match any record', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const invalidQueryArg = '-q "Number > 50000000 limit 10 offset 0"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            invalidQueryArg
        );
        await exportTest.exportWithUserNamePassword();

        const messageContent = await getFileContent(actualExportedDataFile);
        await exportTest.verifyNoRecordFoundMessage(messageContent);
    });

    test('Case 169: Verify that error will be displayed when using non-existed field code', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const invalidQueryArg = '-q "Invalid > 500 limit 10 offset 0"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            invalidQueryArg
        );
        const result = await exportTest.exportWithUserNamePassword();
        const expectedError = errorMessage.INVALID_FIELD_ERROR;
        expectedError.message = expectedError.message.replace('%FIELD_CODE%', 'Invalid');
        exportTest.verifyAppErrorMessage(result, expectedError);
    });

    test('Case 170: Verify that error will be displayed when using invalid query format', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const invalidQueryArg = '-q "invalid query"';

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            true,
            fieldArg,
            invalidQueryArg
        );
        const result = await exportTest.exportWithUserNamePassword();
        const expectedError = errorMessage.INVALID_QUERY_ERROR;
        exportTest.verifyErrorCommandFailed(result, expectedError);
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
