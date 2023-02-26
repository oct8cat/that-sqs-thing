#!/usr/bin/env node
const util = require("util");
const child_process = require("child_process");
const { ReceiveMessageCommand, SQSClient } = require("@aws-sdk/client-sqs");

const receive = (queueUrl, client = new SQSClient()) =>
  client.send(new ReceiveMessageCommand({ QueueUrl: queueUrl }));

const invoke =
  (fn, logger = console) =>
  async (
    payload,
    event = {
      Records: (payload.Messages || []).map((message) => ({
        messageId: message.MessageId,
        receiptHandle: message.ReceiptHandle,
        body: message.Body,
      })),
    }
  ) => {
    if (!event.Records.length) return;
    const cmd = `sls invoke local -f ${fn} -d '${JSON.stringify(event)}'`;
    logger.info(cmd);
    const { stderr, stdout } = await util.promisify(child_process.exec)(cmd);
    stderr && logger.error(stderr);
    stdout && logger.log(stdout);
  };

const start = ({ fn, interval, logger, queueUrl, once = false }) => {
  const poll = () => receive(queueUrl).then(invoke(fn, logger));
  poll();
  if (once) return;
  return setInterval(poll, interval);
};

if (require.main === module)
  start({
    queueUrl: process.argv[2] || process.env.TST_QUEUE_URL,
    fn: process.argv[3] || process.env.TST_FN,
    interval: process.argv[4] || process.env.TST_INTERVAL || 5000,
    once: process.env.TST_ONCE
  });
