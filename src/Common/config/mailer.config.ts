import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService } from '@nestjs/config';

export const mailerConfig = (configService: ConfigService): MailerOptions => ({
  transport: {
    host: configService.get<string>('SMTP_HOST'),
    port: configService.get<number>('SMTP_PORT') || 587,
    secure: false,
    auth: {
      user: configService.get<string>('SMTP_USER'),
      pass: configService.get<string>('SMTP_PASS')
    }
  },
  defaults: {
    from: 'norely@gmail.com'
  },
  template: {
    dir: process.cwd() + '/src/common/templates', 
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true
    }
  },
  options: {
    logger: true,
    debug: true
  }
});
