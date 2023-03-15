# SMRPO Project

## Configuration

### Environment variables

|Name|Description|
|:---:|:---------|
|`DOCS`|Show API documentation|
|`DOC_PATH`|Documentation path (`/api/doc`)|
|`GLOBAL_PREFIX`|API prefix (`/api`)|
|`NODE_ENV`|Node environment|
|`PORT`|Port (3000)|
|`CONFIG`|Path to config file|
|`LOG_REQUESTS`|Log HTTP requests|
|`TYPEORM_HOST`|Database host|
|`TYPEORM_USERNAME`|Database username (root)|
|`TYPEORM_PASSWORD`|Database password|
|`TYPEORM_DATABASE`|Database name|
|`TYPEORM_PORT`|Database port|
|`TYPEORM_SYNCHRONIZE`|Synchronize database model|
|`TYPEORM_LOGGING`|Database query logging| 

[See detials](backend/src/custom-config/config.schema.ts)

### File

If you specify `CONFIG` with path to configuration file, you can set configuration there same with environment variables, [see example](backend/config/example.env).

## Docker

Build image with:

``` bash
docker build -t smrpo .
```

Run environment (database is available on localhost with root user without password):

``` bash
docker run -it --rm --network=host smrpo
```
