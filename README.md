# npmg server
[![Deploy](https://github.com/Mak-Mun/npmg-server/actions/workflows/deploy.yml/badge.svg)](https://github.com/Mak-Mun/npmg-server/actions/workflows/deploy.yml)
[![packages](https://github.com/Mak-Mun/npmg-server/actions/workflows/packages.yml/badge.svg?branch=main)](https://github.com/Mak-Mun/npmg-server/actions/workflows/packages.yml)

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

## Db setup

```bash
  # if prisma setup is changed
  npx prisma migrate dev --preview-feature
```


```bash
  npx prisma migrate prod --preview-feature
```
