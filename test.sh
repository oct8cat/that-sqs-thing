#!/usr/bin/env bash
TST_QUEUE_URL=$(aws sqs create-queue --queue-name=tst-queue-$(date +%s) --output=text) \
  && echo $TST_QUEUE_URL \
  && aws sqs send-message --queue-url=$TST_QUEUE_URL --message-body='{"foo": "bar"}' \
  && cd example \
  && TST_ONCE=true ../index.js $TST_QUEUE_URL sqs \
  && aws sqs delete-queue --queue-url=$TST_QUEUE_URL