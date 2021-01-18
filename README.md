# VeChainPrivate
A simple app to listen to AWS SQS and inturn create, sign and broadcast transactions to send VET

## TODO

* Add circle ci config

## Install

```ssh
npm install
```

## Watch Tests

```ssh
npm run devtests
```

## Start

```ssh
npm run start
```

## Docker

```ssh
npm run docker
```

## Lint

```ssh
tslint --project .
```

## Deploy

* Create a new lambda function
* npm install inside the lambda directory
* Zip the contents of the lambda directory 
* Upload the zip file to the lambda function