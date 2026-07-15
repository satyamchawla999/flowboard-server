import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { existsSync } from 'fs';
import { join } from 'path';
import { createTransport, type Transporter } from 'nodemailer';

type IdentityEmailTemplate = 'password-reset' | 'email-verification';

interface TemplateContext {
  appName: string;
  displayName: string;
  actionUrl: string;
  supportEmail: string;
  currentYear: number;
}

@Injectable()
export class IdentityEmailService {
  private readonly logger = new Logger(IdentityEmailService.name);
  private readonly transporter: Transporter | null;
  private readonly templatesDir: string;

  constructor(private readonly config: ConfigService) {
    this.templatesDir = this.resolveTemplatesDir();
    this.transporter = this.createTransporter();
  }

  async sendPasswordResetEmail(params: {
    to: string;
    displayName: string;
    token: string;
    expiresInMinutes: number;
  }): Promise<void> {
    const actionUrl = this.buildUrl('/reset-password', params.token);

    await this.sendTemplatedEmail({
      to: params.to,
      subject: 'Reset your FlowBoard password',
      template: 'password-reset',
      context: {
        displayName: params.displayName,
        actionUrl,
        expiresInMinutes: params.expiresInMinutes,
      },
    });
  }

  async sendEmailVerificationEmail(params: {
    to: string;
    displayName: string;
    token: string;
    expiresInHours: number;
  }): Promise<void> {
    const actionUrl = this.buildUrl('/verify-email', params.token);

    await this.sendTemplatedEmail({
      to: params.to,
      subject: 'Verify your FlowBoard email',
      template: 'email-verification',
      context: {
        displayName: params.displayName,
        actionUrl,
        expiresInHours: params.expiresInHours,
      },
    });
  }

  private async sendTemplatedEmail(params: {
    to: string;
    subject: string;
    template: IdentityEmailTemplate;
    context: Record<string, unknown> & Pick<TemplateContext, 'displayName' | 'actionUrl'>;
  }): Promise<void> {
    const html = await this.renderTemplate(params.template, params.context);
    const text = this.createTextFallback(params.context.actionUrl);

    console.log(this.transporter, 'transporter');
    if (!this.transporter) {
      this.logger.warn(
        `Mail is disabled or not configured. Skipping "${params.subject}" email to ${params.to}. Link: ${params.context.actionUrl}`,
      );
      return;
    }

    console.log(`Sending "${params.subject}" email to ${params.to}. Link: ${params.context.actionUrl}`);
    await this.transporter.sendMail({
      to: params.to,
      from: this.getFromAddress(),
      subject: params.subject,
      html,
      text,
    });
  }

  private async renderTemplate(
    template: IdentityEmailTemplate,
    context: Record<string, unknown>,
  ): Promise<string> {
    return ejs.renderFile(join(this.templatesDir, `${template}.ejs`), {
      ...context,
      appName: this.config.get<string>('app.name') ?? 'FlowBoard',
      supportEmail: this.config.get<string>('mail.fromAddress') ?? 'no-reply@flowboard.local',
      currentYear: new Date().getFullYear(),
    });
  }

  private createTransporter(): Transporter | null {
    const enabled = this.config.get<boolean>('mail.enabled') ?? false;
    const host = this.config.get<string>('mail.host');
    const user = this.config.get<string>('mail.user');
    const password = this.config.get<string>('mail.password');

    if (!enabled || !host || !user || !password) {
      return null;
    }

    return createTransport({
      host,
      port: this.config.get<number>('mail.port') ?? 587,
      secure: this.config.get<boolean>('mail.secure') ?? false,
      auth: { user, pass: password },
    });
  }

  private buildUrl(pathname: string, token: string): string {
    const frontendUrl = this.config.get<string>('mail.frontendUrl') ?? 'http://localhost:3000';
    const url = new URL(pathname, frontendUrl);
    url.searchParams.set('token', token);
    return url.toString();
  }

  private getFromAddress(): string {
    const name = this.config.get<string>('mail.fromName') ?? 'FlowBoard';
    const address = this.config.get<string>('mail.fromAddress') ?? 'no-reply@flowboard.local';
    return `"${name}" <${address}>`;
  }

  private createTextFallback(actionUrl: string): string {
    return `Open this FlowBoard link to continue: ${actionUrl}`;
  }

  private resolveTemplatesDir(): string {
    const distPath = join(process.cwd(), 'dist/modules/identity/infrastructure/email/templates');
    if (existsSync(distPath)) return distPath;

    return join(process.cwd(), 'src/modules/identity/infrastructure/email/templates');
  }
}
