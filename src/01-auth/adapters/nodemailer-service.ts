import nodemailer from 'nodemailer';
import {EmailTemplateType} from "../../common/types/input-output-types/email-template-type";

class NodemailerService {

    async sendEmail(
        email: string,
        template: EmailTemplateType
    ): Promise<boolean> {

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

const nodemailerService: NodemailerService = new NodemailerService();

export {nodemailerService};