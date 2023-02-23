/** @type {import("aws-lambda").SQSHandler} */
exports.handler = async function (event, context) {
  console.log(
    "👋 This is a message from custom SQS handler example.\n" +
      "See sqs.js for details.\n" +
      "Below is the handler execution result (by default it's the event body):"
  );
  return JSON.parse(event.Records[0].body);
};
