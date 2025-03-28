import {EmailTemplateType} from "../../common/types/input-output-types/email-template-type";
import {injectable} from "inversify";


export interface IEmailTemplates {
    registrationEmail: (code: string) => EmailTemplateType,
    passwordRecoveryEmail: (code: string) => EmailTemplateType
}
@injectable()
class EmailTemplates implements IEmailTemplates {

    registrationEmail(code: string): EmailTemplateType {

        return {
            subject: 'Confirmation of registration',
            html: ` <h1>Thanks for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://some-front.com/confirm-registration?code=${code}'>complete registration</a>
              </p>`
        }
    }

    passwordRecoveryEmail(code: string) {

        return {
            subject: 'Password recovery',
            html: ` <h1>Password recovery</h1>
               <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`
        }
    }
}

export {EmailTemplates};