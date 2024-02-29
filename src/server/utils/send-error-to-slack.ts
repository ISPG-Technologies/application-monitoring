import * as Slack from 'slack-node';

function getRemoteAddress(req: any) {
  /* istanbul ignore next */
  return (
    req.headers['x-forwarded-for'] ||
    req.ip ||
    (req.connection && req.connection.remoteAddress)
  );
}

const createCodeBlock = (title: string, code: any) => {
  code = typeof code === 'string' ? code.trim() : JSON.stringify(code, null, 2);
  const tripleBackticks = '```';
  return `_${title}_${tripleBackticks}${code}${tripleBackticks}\n`;
};

export const sendApiErrorToSlack = (webhookUrl: string, req: any, err: any) => {
  if (!webhookUrl) {
    return;
  }
  const slack = new Slack();
  slack.setWebhook(webhookUrl);
  const request = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body || {},
  };

  const attachment = {
    fallback: `${err.name || 'Unknown Error'}: ${err.message}`,
    color: (err.status || 500) < 500 ? 'warning' : 'danger',
    author_name: req.headers.host,
    title: `${err.name || 'Unknown Error'}: ${err.message}`,
    fields: [
      { title: 'Request URL', value: req.url, short: true },
      { title: 'Request Method', value: req.method, short: true },
      { title: 'Status Code', value: err.status || 500, short: true },
      { title: 'Remote Address', value: getRemoteAddress(req), short: true },
    ],
    text: [
      { title: 'Stack', code: err.stack },
      { title: 'Request', code: request },
    ]
      .map((data) => createCodeBlock(data.title, data.code))
      .join(''),
    mrkdwn_in: ['text'],
    footer: `ISPG Monitor Error Logs`,
    ts: Math.floor(Date.now() / 1000),
  };

  slack.webhook({ attachments: [attachment] }, () => {
    // TODO
  });
};

export const sendTaskErrorToSlack = (
  webhookUrl: string,
  err: any,
  taskInfo: { name: string; application: string },
) => {
  if (!webhookUrl) {
    return;
  }
  const slack = new Slack();
  slack.setWebhook(webhookUrl);
  const task = {
    name: taskInfo.name,
    application: taskInfo.application,
  };

  const attachment = {
    fallback: `${err.name || 'Unknown Error'}: ${err.message}`,
    color: (err.status || 500) < 500 ? 'warning' : 'danger',
    author_name: taskInfo.name,
    title: `${err.name || 'Unknown Error'}: ${err.message}`,
    fields: [
      { title: 'Task', value: taskInfo.name, short: true },
      { title: 'Application', value: taskInfo.application, short: true },
    ],
    text: [
      { title: 'Stack', code: err.stack },
      { title: 'Task', code: task },
    ]
      .map((data) => createCodeBlock(data.title, data.code))
      .join(''),
    mrkdwn_in: ['text'],
    footer: `ISPG Monitor Tasks Error Logs`,
    ts: Math.floor(Date.now() / 1000),
  };

  slack.webhook({ attachments: [attachment] }, () => {
    // TODO
  });
};
