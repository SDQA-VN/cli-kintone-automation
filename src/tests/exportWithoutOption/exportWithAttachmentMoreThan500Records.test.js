import ImportTestCommon from '../../common/ImportTestCommon';
import ExportTestCommon from '../../common/ExportTestCommon';
import { users, exportTestApps as apps, filePaths } from '../../common/config';
import { getFieldArray } from '../../utils/csvUtils';
import { deleteAllAppData } from '../../utils/kintoneApiUtils';
import { deleteFolderRecursive } from '../../utils/fileUtils';
import * as Path from 'path';

describe('Export without --export option: Export data with number of records > 500', () => {
    let fieldNames = '';
    const appInfo = apps.normalSpaceApp.appWithAttachment;
    const userCreds = users.admin;
    const preparedCSVFile = filePaths.export_test.exportDataPreparationWithAttachment510Record;
    const actualExportedDataFile = filePaths.export_test.actualExportedCSVData;
    const attachmentFolder = filePaths.attachmentFolder;

    // Since this test takes long time to execute, the testTimeout should be set in jest.config.js at least 1500000 ms
    test('Case 180: Verify that the attachment will be displayed as text when specifying -b param', async () => {
        const fieldArg = `-c ${fieldNames}`;
        const attachmentArg = `-b ${attachmentFolder}`;

        const exportTest = new ExportTestCommon(
            appInfo,
            userCreds,
            actualExportedDataFile,
            false,
            fieldArg,
            attachmentArg
        );
        await exportTest.exportWithUserNamePassword();
        await exportTest.verifyExportAttachmentFileData(attachmentFolder, fieldNames);
        const expectedExportedDataFile =
            process.platform === 'win32'
                ? filePaths.export_test.exportCSVDataWithAttachmentAndFolder510RecordWindowsExpected
                : filePaths.export_test.exportCSVDataWithAttachmentAndFolder510RecordExpected;
        await exportTest.verifyExportedData(actualExportedDataFile, expectedExportedDataFile);
    });

    beforeAll(async () => {
        // Remove attachment folders in case they are not deleted completely in previous tests
        for (let i = 0; i < 510; i++) {
            await deleteFolderRecursive(Path.join(attachmentFolder, `Attachment-${i}`));
        }

        // Remove data if exist and prepare new data
        await deleteAllAppData(appInfo, userCreds);
        const importTest = new ImportTestCommon(appInfo, userCreds, preparedCSVFile);
        await importTest.importWithAttachment(attachmentFolder);

        // Get field names and remove some field names which their values are incremental ids
        fieldNames = await getFieldArray(preparedCSVFile);
        fieldNames.splice(fieldNames.indexOf('Table'), 1);
    });

    afterAll(async () => {
        await deleteAllAppData(appInfo, userCreds);
    });
});
