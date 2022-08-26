import nodemailer from 'nodemailer';
import vars from '@server/config/vars';

export const createMailer = () => {
  const transporter = nodemailer.createTransport({
    host: vars.mail.host,
    port: 465,
    secure: true,
    auth: {
      user: vars.mail.user,
      pass: vars.mail.password,
    },
  });

  return {
    sendMail: transporter.sendMail.bind(transporter),
  };
};

export default { createMailer };
