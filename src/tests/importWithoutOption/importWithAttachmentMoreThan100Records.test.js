import ImportTestCommon from '../../common/ImportTestCommon';
import { users, importTestApps as apps, filePaths } from '../../common/config';
import { makeQueryToGetAppData } from '../../common/helper';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';

describe('Import without --import option: Import data with number of records > 100', () => {
    const appInfo = apps.normalSpaceApp;
    const userCreds = users.admin;
    const importedCSVFile = filePaths.import_test.importCSVDataWithAttachment110Record;
    const attachmentFolder = filePaths.attachmentFolder;
    const query = makeQueryToGetAppData();

    test('C050: Verify that data in attachment folder is uploaded and imported correctly', async () => {
        const importTest = new ImportTestCommon(appInfo, userCreds, importedCSVFile, false);

        const result = await importTest.importWithAttachment(attachmentFolder);

        importTest.verifyCliKintoneSuccessMessage(result);

        const fieldNames = await getFieldArray(importedCSVFile);
        const expectedDataFile = filePaths.import_test.importCSVDataWithAttachment110RecordExpected;
        await importTest.verifyImportedDataWithAttachment(fieldNames, expectedDataFile, query);
        await importTest.verifyImportedAttachments(fieldNames, query);
    });

    beforeAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });

    afterEach(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
