# SMRPO backend

## Description

Backend for SMRPO project. It also serves frontend.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuration

Configuration options are specified [here](./src//custom-config/config.schema.ts). Using `CONFIG` variable you can also specify config file path (default uses only environment variables). See [example configuration file](./config/example.env).

### Default user

By default if there are no users in database, default user `admin:admin` is automaticaly generated.

