#!/usr/bin/env node
const { exec } = require("child_process");
const { ReceiveMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

/**
 * @param {SQSClient} client
 * @param {string} src
 * @returns {Promise<import("@aws-sdk/client-sqs").ReceiveMessageCommandOutput>}
 */
const receive = (client, src) => {
  return client.send(new ReceiveMessageCommand({ QueueUrl: src }));
};

/**
 * @param {string} fn
 * @param {import("@aws-sdk/client-sqs").ReceiveMessageCommandOutput} payload
 */
const invoke = (fn, payload) => {
  if (!payload.Messages || !payload.Messages.length) return;
  /** @type {import("aws-lambda").SQSEvent} */
  const event = {
    Records: payload.Messages.map(
      /** @returns {import("aws-lambda").SQSRecord} */
      (message) => ({
        messageId: message.MessageId,
        receiptHandle: message.ReceiptHandle,
        body: message.Body,
      })
    ),
  };
  const cmd = `sls invoke local -f ${fn} -d '${JSON.stringify(event)}'`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) return reject(err);
      console.log(stdout);
      resolve(stdout);
    });
  });
};

module.exports = {
  receive,
  invoke,
};

//

if (require.main === module) {
  const [queueUrl, fn, region] = process.argv.slice(2);
  const client = new SQSClient({ region });
  const poll = () => receive(client, queueUrl).then(invoke.bind(null, fn));
  poll();
  setInterval(poll, 1000);
}
