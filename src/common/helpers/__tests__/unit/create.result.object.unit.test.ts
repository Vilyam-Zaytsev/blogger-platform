import {console_log_unit} from "../../../../../__tests__/helpers/test-helpers";
import {BadRequestResult, ResultObject, SuccessResult} from "../../result-object";
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

    it('...', () => {

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
});