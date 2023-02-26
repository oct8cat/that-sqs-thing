# That SQS thing

Poll SQS queue and invoke local serverless function


## Install

```
yarn i -g that-sqs-thing
```

## Usage

```bash
# With CLI args:
tst [queueUrl] [fn] [interval]

# With env vars
TST_QUEUE_URL=my-queue TST_FN=my-function TST_INTERVAL=5000 tst

# With env vars (once, useful for tests)
TST_QUEUE_URL=my-queue TST_FN=my-function TST_INTERVAL=5000 TST_ONCE=true tst

```

## Test

```bash
./test.sh
```