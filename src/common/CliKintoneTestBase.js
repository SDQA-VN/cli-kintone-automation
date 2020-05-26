import { getCliKintoneCommand } from './helper';

export default class CliKintoneTestBase {
    constructor(appInfo, auth, fileInfo = { encoding: 'utf-8', format: 'csv' }) {
        this._appInfo = appInfo;
        this._auth = auth;
        this._fileInfo = fileInfo;
        this._kintoneCli = getCliKintoneCommand();
    }

    /**
     * @param {string} result
     */
    verifyCliKintoneSuccessMessage(result) {
        expect(result).toEqual(expect.stringContaining('SUCCESS'));
        expect(result).toEqual(expect.stringContaining('DONE'));
    }

    /**
     * @param {string} result
     * @param {Object} expectedError
     */
    verifyAppErrorMessage(result, expectedError) {
        const message =
            'AppError: ' +
            expectedError.errorType +
            ` [${expectedError.code}] ` +
            expectedError.message;
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     * @param {Object} expectedError
     */
    verifyErrorCommandFailed(result, expectedError) {
        expect(result.toString()).toEqual(expect.stringContaining('Error: Command failed'));
        if (typeof expectedError === 'string') {
            expect(result.toString()).toEqual(expect.stringContaining(expectedError));
        } else {
            expect(result.toString()).toEqual(expect.stringContaining(expectedError.message));
        }
    }

    /**
     * @param {string} result
     * @param {string} field
     */
    verifyNoViewPermissionErrorMessage(result, field) {
        const message = 'Edit permissions are required to edit field "' + field + '".';
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     */
    verifyHttpError404Message(result) {
        const message = 'HTTP error: 404 Not Found';
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     */
    verifyHttpError401Message(result) {
        const message = 'HTTP error: 401 Unauthorized';
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     */
    verifyAttachmentFileOver10MBError(result) {
        const message = 'file must be less than 10 MB';
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     */
    verifyNonexistentDirectoryError(result) {
        let message = 'no such file or directory';
        if (process.platform === 'win32') {
            message = 'The system cannot find the file specified.';
        }
        expect(result.toString()).toEqual(expect.stringContaining(message));
    }

    /**
     * @param {string} result
     */
    verifyNoRecordFoundMessage(message) {
        const expectedMessage1 = 'No record found.';
        const expectedMessage2 = 'Please check your query or permission settings.';

        expect(message.toString()).toEqual(expect.stringContaining(expectedMessage1));
        expect(message.toString()).toEqual(expect.stringContaining(expectedMessage2));
    }
}
