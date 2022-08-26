import { createMailer } from '@config/mailer';

interface SendOptions {
  to: string[];
  html: string;
  from?: string;
  subject?: string;
}

export type MailService = ReturnType<typeof mailService>

export const mailService = () => {
  const mailer = createMailer();
  const baseConfig = {
    from: '"Checkpoint" admin@checkpoint.guide',
    subject: 'Message from Checkpoint',
  };

  const send = async ({ to, html, ...options }: SendOptions) => {
    const resultConfig = { ...baseConfig, ...options };
    const toRes = to.join(', ');

    return await mailer.sendMail({
      ...resultConfig,
      to: toRes,
      html,
    });
  };

  return {
    send
  };
};

export default {
  middleware: (service: MailService) => (_, res, next) => {
    res.locals.mailer = service;
    next();
  },
  service: mailService
};
