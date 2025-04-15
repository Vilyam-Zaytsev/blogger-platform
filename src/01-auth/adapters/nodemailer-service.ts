import nodemailer from 'nodemailer';
import {EmailTemplateType} from "../../common/types/input-output-types/email-template-type";
import {injectable} from "inversify";

@injectable()
class NodemailerService {

    async sendEmail(
        email: string,
        template: EmailTemplateType
    ): Promise<boolean> {

        //TODO: delete log!!!
        console.log('sendEmail invoked')

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const info = await transporter.sendMail({
            from: `Blogger Platform <${process.env.EMAIL}>`,
            to: email,
            subject: template.subject,
            html: template.html,
        });

        return !!info;
    }
}

export {NodemailerService};