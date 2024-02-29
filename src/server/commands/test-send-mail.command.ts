import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { EmailService } from '../services/email.service';

@Injectable()
export class TestSendMailCommand {
  constructor(private readonly emailService: EmailService) {}

  @Command({
    command: 'test:send:mail',
    describe: 'test send mail',
  })
  async create() {
    console.log('Sending test mail');
    await this.emailService.sendMail(
      'EDC Monitor',
      'anoop@ispgweb.com',
      'Test',
      '<span>Hello</span>',
    );
    console.log('Done');
    process.exit(0);
  }
}
