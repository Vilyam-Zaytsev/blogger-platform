// import {console_log_unit} from "../../../../../__tests__/helpers/test-helpers";
// import {ResultObject, SuccessResult} from "../../result-object";
// import {ResultStatus} from "../../../types/result-types/result-status";
//
// describe('CREATE RESULT OBJECT', () => {
//
//     it('should create a result object with the Success status, with the "data: null" field (using the static' +
//         ' "positive" method of the Result Object class).', () => {
//
//             const resultObject: ResultObject<null> = ResultObject
//                 .positive(
//                     ResultStatus.Success
//                 );
//
//             expect(resultObject).toMatchObject({
//                 status: ResultStatus.Success,
//                 extensions: [],
//                 data: null
//             });
//
//             console_log_unit(resultObject, 'Test 1: Create result object');
//     });
//
//     it('should create a result object with the Success status, with data (using the static "positive" method of the Result Object class).', () => {
//
//             const resultObject: ResultObject<string> = ResultObject
//                 .positive(
//                     ResultStatus.Success,
//                     'success',
//                 );
//
//             expect(resultObject).toMatchObject({
//                 status: ResultStatus.Success,
//                 extensions: [],
//                 data: 'success'
//             });
//
//             console_log_unit(resultObject, 'Test 2: Create result object');
//     });
//
//     it('should create a result object with the Success status that does not contain data (using the SuccessResult class).', () => {
//
//         const resultObject = SuccessResult
//             .create(null);
//
//         expect(resultObject).toMatchObject({
//             status: ResultStatus.Success,
//             extensions: [],
//             data: null
//         });
//
//         console_log_unit(resultObject, 'Test 3: Create result object');
//     });
//
//     it('should create a result object with the Success status that contains the data (using the SuccessResult class).', () => {
//
//         const resultObject = SuccessResult
//             .create<string>('success');
//
//         expect(resultObject).toMatchObject({
//             status: ResultStatus.Success,
//             extensions: [],
//             data: 'success'
//         });
//
//         console_log_unit(resultObject, 'Test 4: Create result object');
//     });
// });