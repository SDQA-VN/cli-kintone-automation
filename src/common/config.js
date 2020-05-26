import { User, App } from './Entities';
import initialData from '../resources/initialization/InitializationData.json';
import initialDataBasicAuth from '../resources/initialization/InitializationDataBasicAuth.json';

const userList = initialData.users.clone;
const normalSpaceApps = initialData.normalSpaceInfo[0].apps;
const guestSpaceApps = initialData.guestSpaceInfo[0].apps;
const basicAuthNormalSpaceApps = initialDataBasicAuth.normalSpaceInfo[0].apps;
const domain = process.env.DOMAIN;
const basicAuthDomain = process.env.BASIC_DOMAIN;

const fileType = {
    csv: 'csv',
    json: 'json',
};

const fileInfo = {
    encoding: 'utf-8',
    format: fileType,
};

const users = {
    admin: new User(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD),
    basicAuthUser: new User(process.env.BASIC_USERNAME, process.env.BASIC_PASSWORD),
    normalUser: userList[0],
    userNoViewPermission: userList[1],
    userNoViewAttachmentFile: new User('user3', 'user3'),
};

const importTestApps = {
    normalSpaceApp: new App(
        domain,
        normalSpaceApps[0].appId,
        normalSpaceApps[0].fieldCodes,
        normalSpaceApps[0].apiToken
    ),
    guestSpaceApp: new App(
        domain,
        guestSpaceApps[0].appId,
        guestSpaceApps[0].fieldCodes,
        guestSpaceApps[0].apiToken,
        guestSpaceApps[0].spaceId
    ),
    basicAuthApp: new App(
        basicAuthDomain,
        basicAuthNormalSpaceApps[0].appId,
        basicAuthNormalSpaceApps[0].fieldCodes,
        basicAuthNormalSpaceApps[0].apiToken
    ),
    prohibitDuplicateApp: new App(
        domain,
        normalSpaceApps[4].appId,
        normalSpaceApps[4].fieldCodes,
        normalSpaceApps[4].apiToken
    ),
    invalidApp: new App('invalid-cli-kintone.cybozu-dev.com', '10000', [], 'invalidtokentotest'),
};

const exportTestApps = {
    normalSpaceApp: {
        appWithAttachment: new App(
            domain,
            normalSpaceApps[2].appId,
            normalSpaceApps[2].fieldCodes,
            normalSpaceApps[2].apiToken
        ),
        appWithoutAttachment: new App(
            domain,
            normalSpaceApps[3].appId,
            normalSpaceApps[3].fieldCodes,
            normalSpaceApps[3].apiToken
        ),
    },
    guestSpaceApp: {
        appWithAttachment: new App(
            domain,
            guestSpaceApps[2].appId,
            guestSpaceApps[2].fieldCodes,
            guestSpaceApps[2].apiToken,
            guestSpaceApps[2].spaceId
        ),
        appWithoutAttachment: new App(
            domain,
            guestSpaceApps[3].appId,
            guestSpaceApps[3].fieldCodes,
            guestSpaceApps[3].apiToken,
            guestSpaceApps[3].spaceId
        ),
    },
    basicAuthApp: {
        appWithAttachment: new App(
            basicAuthDomain,
            basicAuthNormalSpaceApps[0].appId,
            basicAuthNormalSpaceApps[0].fieldCodes,
            basicAuthNormalSpaceApps[0].apiToken
        ),
        appWithoutAttachment: new App(
            basicAuthDomain,
            basicAuthNormalSpaceApps[0].appId,
            basicAuthNormalSpaceApps[0].fieldCodes,
            basicAuthNormalSpaceApps[0].apiToken
        ),
    },
    invalidApp: new App('invalid-cli-kintone.cybozu-dev.com', '10000', [], 'invalidtokentotest'),
};

const importTestDataPath = 'src/resources/test_data/import_test';
const exportTestDataPath = 'src/resources/test_data/export_test';
const filePaths = {
    import_test: {
        importCSVData: `${importTestDataPath}/importCSVData.csv`,
        importCSVData110Record: `${importTestDataPath}/importCSVData110Record.csv`,
        importCSVDataExpected: `${importTestDataPath}/importCSVDataExpected.json`,
        importCSVData110RecordExpected: `${importTestDataPath}/importCSVData110RecordExpected.json`,
        importCSVDataGuestSpaceApp: `${importTestDataPath}/importCSVDataGuestSpaceApp.csv`,
        importCSVDataGuestSpaceAppExpected: `${importTestDataPath}/importCSVDataGuestSpaceAppExpected.json`,
        importCSVData2: `${importTestDataPath}/importCSVData2.csv`,
        importCSVData2Expected: `${importTestDataPath}/importCSVData2Expected.json`,
        importDataWithLineParam: `${importTestDataPath}/importDataWithLineParam.csv`,
        importDataWithLineParamExpected: `${importTestDataPath}/importDataWithLineParamExpected.json`,
        importDataWithLineParam110RecordExpected: `${importTestDataPath}/importDataWithLineParam110RecordExpected.json`,
        importDataWithLineParamEqual1Expected: `${importTestDataPath}/importDataWithLineParamEqual1Expected.json`,
        importCSVDataWithTwoRowExpected: `${importTestDataPath}/importCSVDataWithTwoRowExpected.json`,
        importCSVDataWithQuery: `${importTestDataPath}/importCSVDataWithQuery.csv`,
        importCSVDataWithQueryExpected: `${importTestDataPath}/importCSVDataWithQueryExpected.json`,

        // Fields and data:
        // Link,Text_area
        // https://vnexpress.net,This is text area
        importCSVDataWithSomeFieldsExpected: `${importTestDataPath}/importCSVDataWithSomeFieldsExpected.json`,

        // Data to test attachment file
        importCSVDataWithAttachment: `${importTestDataPath}/importCSVDataWithAttachment.csv`,
        importCSVDataWithAttachment110Record: `${importTestDataPath}/importCSVDataWithAttachment110Record.csv`,
        importCSVDataWithAttachmentExpected: `${importTestDataPath}/importCSVDataWithAttachmentExpected.json`,
        importCSVDataWithAttachment110RecordExpected: `${importTestDataPath}/importCSVDataWithAttachment110RecordExpected.json`,
        importCSVDataWithMultiAttachmentsExpected: `${importTestDataPath}/importCSVDataWithMultiAttachmentsExpected.json`,
        importCSVDataWithLargeAttachment: `${importTestDataPath}/importCSVDataWithLargeAttachment.csv`,
        importCSVDataWithMultiAttachments: `${importTestDataPath}/importCSVDataWithMultiAttachmentFileTypes.csv`,
        importCSVDataWithMultiAttachmentsOnOneRecord: `${importTestDataPath}/importCSVDataWithMultiAttachmentsOnOneRecord.csv`,
        importDataWithAttachmentOver10M: `${importTestDataPath}/importCSVDataWithAttachmentOver10M.csv`,
        updateDataUsingAsteriskSymbol: `${importTestDataPath}/updateDataUsingAsteriskSymbol.csv`,
        updateDataUsingAsteriskSymbolExpected: `${importTestDataPath}/updateDataUsingAsteriskSymbolExpected.json`,
        updateDataUsingAsteriskSymbolMultiField: `${importTestDataPath}/updateDataUsingAsteriskSymbolMultiField.csv`,
        updateDataUsingAsteriskSymbolMultiFieldExpected: `${importTestDataPath}/updateDataUsingAsteriskSymbolMultiFieldExpected.json`,
        updateDataUsingAsteriskSymbolBlankValue: `${importTestDataPath}/updateDataUsingAsteriskSymbolBlankValue.csv`,
        updateDataUsingAsteriskSymbolBlankExpected: `${importTestDataPath}/updateDataUsingAsteriskSymbolBlankExpected.json`,
        // actual data
        actualJsonDataGetFromAppByApi: 'src/resources/actualJsonDataGetFromAppByApi.json',
    },
    export_test: {
        exportDataPreparation: `${exportTestDataPath}/exportDataPreparation.csv`,
        exportCSVDataExpected: `${exportTestDataPath}/exportCSVDataExpected.csv`,
        exportCSVDataGuestSpaceAppExpected: `${exportTestDataPath}/exportCSVDataGuestSpaceAppExpected.csv`,
        exportCSVDataSjisExpected: `${exportTestDataPath}/exportCSVDataSjisExpected.csv`,
        exportCSVDataSjis510RecordExpected: `${exportTestDataPath}/exportCSVDataSjis510RecordExpected.csv`,
        exportCSVDataSjisGuestSpaceAppExpected: `${exportTestDataPath}/exportCSVDataSjisGuestSpaceAppExpected.csv`,
        exportCSVDataJpEucExpected: `${exportTestDataPath}/exportCSVDataJpEucExpected.csv`,
        exportCSVDataUtf16Expected: `${exportTestDataPath}/exportCSVDataUtf16Expected.csv`,
        exportCSVDataUtf16510RecordExpected: `${exportTestDataPath}/exportCSVDataUtf16510RecordExpected.csv`,
        exportCSVDataUtf16beWithSignatureExpected: `${exportTestDataPath}/exportCSVDataUtf16beWithSignatureExpected.csv`,
        exportCSVDataUtf16leWithSignatureExpected: `${exportTestDataPath}/exportCSVDataUtf16leWithSignatureExpected.csv`,
        exportCSVDataWithInputPasswordExpected: `${exportTestDataPath}/exportCSVDataWithInputPasswordExpected.csv`,
        exportCSVDataWithFieldParamExpected: `${exportTestDataPath}/exportCSVDataWithFieldParamExpected.csv`,
        exportCSVDataWithFieldParam510RecordExpected: `${exportTestDataPath}/exportCSVDataWithFieldParam510RecordExpected.csv`,
        exportCSVDataWithFieldEncodingQueryParamExpected: `${exportTestDataPath}/exportCSVDataWithFieldEncodingQueryParamExpected.csv`,
        exportJsonDataExpected: `${exportTestDataPath}/exportJsonDataExpected.json`,
        exportJsonDataJpEuc510RecordExpected: `${exportTestDataPath}/exportJsonDataJpEuc510RecordExpected.json`,
        exportJsonDataWithEncodingOutputFormatParamExpected: `${exportTestDataPath}/exportJsonDataWithEncodingOutputFormatParamExpected.json`,
        exportDataPreparation510Record: `${exportTestDataPath}/exportDataPreparation510Record.csv`,
        exportCSVData510RecordExpected: `${exportTestDataPath}/exportCSVData510RecordExpected.csv`,
        exportDataPreparation11000Record: `${exportTestDataPath}/exportDataPreparation11000Record.csv`,
        exportCSVData11000RecordExpected: `${exportTestDataPath}/exportCSVData11000RecordExpected.csv`,
        exportCSVDataWithQueryLimitExpected: `${exportTestDataPath}/exportCSVDataWithQueryLimitExpected.csv`,
        exportCSVDataWithNoRecordFound: `${exportTestDataPath}/exportCSVDataWithNoRecordFound.csv`,
        exportDataPreparationWithAttachment: `${exportTestDataPath}/exportDataPreparationWithAttachment.csv`,
        exportDataPreparationWithAttachment510Record: `${exportTestDataPath}/exportDataPreparationWithAttachment510Record.csv`,
        exportCSVDataWithAttachmentExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentExpected.csv`,
        exportCSVDataWithAttachmentAndFolderExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolderExpected.csv`,
        exportCSVDataWithAttachmentAndFolderWindowsExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolderWindowsExpected.csv`,
        exportCSVDataWithAttachmentAndFolder510RecordExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolder510RecordExpected.csv`,
        exportCSVDataWithAttachmentAndFolder510RecordWindowsExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolder510RecordWindowsExpected.csv`,
        exportCSVDataWithoutViewAttachmentExpected: `${exportTestDataPath}/exportCSVDataWithoutViewAttachmentExpected.csv`,
        exportCSVDataWithAttachmentAndFolderWindowsGuestSpaceExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolderWindowsGuestSpaceExpected.csv`,
        exportCSVDataWithAttachmentAndFolderGuestSpaceExpected: `${exportTestDataPath}/exportCSVDataWithAttachmentAndFolderGuestSpaceExpected.csv`,

        // actual data
        actualExportedCSVData: 'src/resources/actualExportedCSVData.csv',
        actualExportedJsonData: 'src/resources/actualExportedJsonData.json',
    },

    // Attachment folder
    attachmentFolder: 'src/resources/files/',
};

module.exports = {
    users,
    importTestApps,
    exportTestApps,
    fileInfo,
    filePaths,
};
