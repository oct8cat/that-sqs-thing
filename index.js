#!/usr/bin/env node
const { exec } = require("child_process");
const { ReceiveMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

/** @type {(client: SQSClient, queueUrl: string) => Promise<import("@aws-sdk/client-sqs").ReceiveMessageCommandOutput>)} */
const receive = (client, queueUrl) => {
  return client.send(new ReceiveMessageCommand({ QueueUrl: queueUrl }));
};

/** @type {(fn: string, payload: import("@aws-sdk/client-sqs").ReceiveMessageCommandOutput) => Promise<string | undefined>} */
const invoke = (fn, payload) => {
  const event = createEvent(payload.Messages);
  if (!event.Records.length) return;
  const cmd = `sls invoke local -f ${fn} -d '${JSON.stringify(event)}'`;
  console.log(`🤏 ${cmd}`);
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) return reject(err);
      console.log(stdout);
      resolve(stdout);
    });
  });
};

/** @type {(messages: import("@aws-sdk/client-sqs").Message[]) => import("aws-lambda").SQSEvent} */
const createEvent = (messages = []) => ({
  Records: messages.map(
    /** @type {(message: import("@aws-sdk/client-sqs").Message) => import("aws-lambda").SQSRecord} */
    (message) => ({
      messageId: message.MessageId,
      receiptHandle: message.ReceiptHandle,
      body: message.Body,
    })
  ),
});

module.exports = {
  receive,
  invoke,
  createEvent,
};

//

if (require.main === module) {
  const [queueUrl, fn, region] = process.argv.slice(2);
  const client = new SQSClient({ region });
  const poll = () => receive(client, queueUrl).then(invoke.bind(null, fn));
  poll();
  setInterval(poll, 5000);
}
