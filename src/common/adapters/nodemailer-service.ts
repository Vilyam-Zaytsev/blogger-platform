import nodemailer from 'nodemailer';

const nodemailerService = {
    async sendEmail(email, code: string, template: (code: string) => string): Promise<boolean> {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_BLOGGER_PLATFORM,
                pass: process.env.PASSWORD_GMAIL
            }
        });

        const info = await transporter.sendMail({
            from: '"Kek 👻" <codeSender>',
            to: email,
            subject: "Your code is here",
            html: template(code),
        });

        return !!info;
    }
};

export {nodemailerService};