import * as Joi from 'joi';

export const ConfigSchema: Joi.ObjectSchema = Joi.object().keys({
  DOCS: Joi.boolean().default(true),
  DOC_PATH: Joi.string().default('doc'),
  GLOBAL_PREFIX: Joi.string().allow(null).default('api'),
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(process.env.PORT || 3000),
  STATIC_DIR: Joi.string().default('static'),

  CONFIG: Joi.string(),
  IGNORE_CONFIG: Joi.boolean(),

  LOG_REQUESTS: Joi.boolean().default(false),

  HTTP_TIMEOUT: Joi.number().min(0).default(5000),
  
  BCRYPT_SALT_ROUNDS: Joi.number().default(10),

  /**
   * TypeORM
   * @see https://typeorm.io/#/using-ormconfig/using-environment-variables
   * @see https://typeorm.io/#/connection-options/
   */
  TYPEORM_CONNECTION: Joi.string().default('mariadb'),
  TYPEORM_HOST: Joi.string().default('localhost'),
  TYPEORM_USERNAME: Joi.string().default('root'),
  TYPEORM_PASSWORD: Joi.string(),
  TYPEORM_DATABASE: Joi.string().default('smrpo'),
  TYPEORM_PORT: Joi.number().default(3306),
  TYPEORM_SYNCHRONIZE: Joi.boolean().default(false),
  TYPEORM_LOGGING: Joi.boolean().default(false),

  /**
	 * Authentication
	 * @see https://github.com/nestjs/jwt
	 */
	JWT_SECRET: Joi.string(),
	JWT_PUBLIC_KEY_PATH: Joi.string(),
	JWT_PRIVATE_KEY_PATH: Joi.string(),
	JWT_ACCESS_TOKEN_EXPIRE: Joi.allow(Joi.string(), Joi.number()).default('1h'),
});
