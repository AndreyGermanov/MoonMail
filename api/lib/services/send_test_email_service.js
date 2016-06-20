'use strict';

import { debug } from '../logger';

class SendTestEmailService {

  static create(sesClient, params) {
    return new SendTestEmailService(sesClient, params);
  }

  constructor(sesClient, { body, subject, emails } = {}) {
    this.sesClient = sesClient;
    this.body = body;
    this.subject = subject;
    this.emails = emails;
    this.emailFrom = process.env.DEFAULT_EMAIL_ADDRESS;
  }

  sendEmail() {
    debug('= SendTestEmailService.sendEmail', `Sending test email to ${this.emails}`);
    return this._checkParams()
      .then(() => this._buildSesRequest())
      .then(sesParams => this._deliver(sesParams));
  }

  _checkParams() {
    return new Promise((resolve, reject) => {
      debug('= SendTestEmailService._checkParams', 'Checking parameters');
      if (this.body && this.subject && this.emails) {
        resolve(true);
      } else {
        reject(new Error('Params missing'));
      }
    });
  }

  _buildSesRequest() {
    return new Promise(resolve => {
      debug('= SendTestEmailService._buildSesRequest');
      resolve({
        Source: this.emailFrom,
        Destination: {
          ToAddresses: this.emails
        },
        Message: {
          Body: {Html: {Data: this.body}},
          Subject: {Data: `[TEST] ${this.subject}`}
        }
      });
    });
  }

  _deliver(sesParams) {
    return new Promise((resolve, reject) => {
      debug('= SendTestEmailService._deliver', 'Sending email', JSON.stringify(sesParams));
      this.sesClient.sendEmail(sesParams, (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });
  }
}

module.exports.SendTestEmailService = SendTestEmailService;