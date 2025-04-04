import {console_log_unit} from "../../../../../__tests__/helpers/test-helpers";
import {
    BadRequestResult,
    ForbiddenResult,
    NotFoundResult,
    SuccessResult,
    UnauthorizedResult
} from "../../result-object";
import {ResultStatus} from "../../../types/result-types/result-status";

describe('CREATE RESULT OBJECT', () => {

    it('should create a result object with the Success status that does not contain data (using the SuccessResult class).', () => {

        const resultObject = SuccessResult
            .create(null);

        expect(resultObject).toMatchObject({
            status: ResultStatus.Success,
            extensions: [],
            data: null
        });

        console_log_unit(resultObject, 'Test 1: Create result object');
    });

    it('should create a result object with the Success status that contains the data (using the SuccessResult class).', () => {

        const resultObject = SuccessResult
            .create<string>('success');

        expect(resultObject).toMatchObject({
            status: ResultStatus.Success,
            extensions: [],
            data: 'success'
        });

        console_log_unit(resultObject, 'Test 2: Create result object');
    });

    it('should create a result object with the status BadRequest, (using the BadRequestResult class).', () => {

        const resultObject = BadRequestResult
            .create(
                'fieldName',
                'Extension error.',
                'Common error.'
            );

        expect(resultObject).toMatchObject({
            status: ResultStatus.BadRequest,
            errorMessage: 'Common error.',
            extensions: [{
                field: 'fieldName',
                message: 'Extension error.'
            }],
            data: null
        });

        console_log_unit(resultObject, 'Test 3: Create result object');
    });

    it('should create a result object with the status Unauthorized, (using the UnauthorizedResult class).', () => {

        const resultObject = UnauthorizedResult
            .create(
                'fieldName',
                'Extension error.',
                'Common error.'
            );

        expect(resultObject).toMatchObject({
            status: ResultStatus.Unauthorized,
            errorMessage: 'Common error.',
            extensions: [{
                field: 'fieldName',
                message: 'Extension error.'
            }],
            data: null
        });

        console_log_unit(resultObject, 'Test 4: Create result object');
    });

    it('should create a result object with the status Forbidden, (using the ForbiddenResult class).', () => {

        const resultObject = ForbiddenResult
            .create(
                'fieldName',
                'Extension error.',
                'Common error.'
            );

        expect(resultObject).toMatchObject({
            status: ResultStatus.Forbidden,
            errorMessage: 'Common error.',
            extensions: [{
                field: 'fieldName',
                message: 'Extension error.'
            }],
            data: null
        });

        console_log_unit(resultObject, 'Test 5: Create result object');
    });

    it('should create a result object with the status NotFound, (using the NotFoundResult class).', () => {

        const resultObject = NotFoundResult
            .create(
                'fieldName',
                'Extension error.',
                'Common error.'
            );

        expect(resultObject).toMatchObject({
            status: ResultStatus.NotFound,
            errorMessage: 'Common error.',
            extensions: [{
                field: 'fieldName',
                message: 'Extension error.'
            }],
            data: null
        });

        console_log_unit(resultObject, 'Test 6: Create result object');
    });
});