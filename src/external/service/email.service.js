import transporter from "../../../config/mailer.js";
import { prepareAdminMail, prepareUserMail } from "../processor/mail.processor.js";
import { environment } from "../../../config/env.config.js";
export default class EmailService {

    static async sendMail(mailOptions) {
        return await transporter.sendMail(mailOptions);
    }

    static async sendMailWithTemplate(data) {
        const adminMail = prepareAdminMail(data);
        const userMail = prepareUserMail(data);

        if(environment === 'DEVELOPMENT') {
            console.log("Sending Email...");
            console.log("Admin Mail Options:", adminMail);
            console.log("User Mail Options:", userMail);
            console.log("Emails not sent in DEVELOPMENT environment.");
            return true;
        }

        await this.sendMail(adminMail);
        await this.sendMail(userMail);

        console.log("Emails Sent Successfully");

        return true;
    }
}