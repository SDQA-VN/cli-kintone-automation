import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { executeCommand, getCliKintoneCommand } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import with --import option: Import with stdout', () => {
    const os = process.platform;
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const kintoneCli = getCliKintoneCommand();
    const importedCSVFile = filePaths.import_test.importCSVData;

    test('C136: Import from result of export to stdout', async () => {
        const prepareTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile);
        await prepareTest.importWithUserNamePassword();

        const fieldNames = await getFieldArray(importedCSVFile);
        const otherArg =
            `--export -c ${fieldNames} | ` +
            `${kintoneCli} -a ${appInfo.appId} -d ${appInfo.domain} -u ${userCreds.username} -p ${userCreds.password} -D --import`;

        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, false, otherArg);

        const result = await importTest.importWithUserNamePassword();

        importTest.verifyCliKintoneSuccessMessage(result);

        const expectedDataFile = filePaths.import_test.importCSVDataExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    test('C138: Import from print/echo', async () => {
        const headerRow = 'Link,Text_area,Date,Time,Date_and_time';
        const fieldData = 'https://vnexpress.net,This is text area,2020-03-03,15:43:00,';
        let inputStringCommand = `(echo ${headerRow} && echo ${fieldData})`;
        const command =
            `${inputStringCommand}| ` +
            `${kintoneCli} -a ${appInfo.appId} -d ${appInfo.domain} -u ${userCreds.username} -p ${userCreds.password} --import`;
        const importTest = new ImportTestCommon(appInfo, userCreds, undefined, false);

        const result = await executeCommand(command);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithSomeFieldsExpected;
        await importTest.verifyImportedData(fieldNames, expectedDataFile);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
