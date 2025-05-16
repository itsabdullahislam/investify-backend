// src/services/mail.service.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'SendGrid', 'Outlook', etc.
  auth: {
    user: process.env.EMAIL_USER,      // your email address
    pass: process.env.EMAIL_PASS       // your email password or app-specific password
  }
});

export const MailService = {
  async sendCampaignCreatedEmail(to: string, campaignTitle: string, campaignStatus: string) {
    const mailOptions = {
      from: `"Investify" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your Campaign is Live on Investify!',
      html: `<p>Hi Innovator,</p>
             <p>Your campaign <strong>${campaignTitle}</strong> has been successfully created with status : ${campaignStatus}.</p>
             <p>Good luck!</p>
             <br/><p>– The Investify Team</p>`
    };

    await transporter.sendMail(mailOptions);
  }
};
