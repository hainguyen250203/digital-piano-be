import configuration from '@/Common/config/configuration';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),

    // Mailer config
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
          from: 'noreply@gmail.com'
        },
        template: {
          dir: process.cwd() + '/src/Common/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        },
        options: {
          logger: true,
          debug: true,
          helpers: {
            eq: (a, b) => a === b
          }
        }
      })
    }),

    // HTTP config
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT') || 5000,
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS') || 5
      }),
      inject: [ConfigService]
    })
  ],
  exports: [ConfigModule, MailerModule, HttpModule]
})
export class CommonConfigModule { }
