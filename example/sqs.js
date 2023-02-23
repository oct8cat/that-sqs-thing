/** @type {import("aws-lambda").SQSHandler} */
exports.handler = async function (event, context) {
  return { message: "response from test handler", event };
};
