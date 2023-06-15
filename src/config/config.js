const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    USE_PORT: Joi.bool().default(false).description('This is to determine whether to use the PORT value'),
    ENFORCE_SSL: Joi.bool().default(false).description('This is to determine whether to use HTTP or HTTPS'),
    API_DOMAIN: Joi.string().description('API Domain'),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    JWT_USER_INVITATION_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which user invitation token expires'),
    SMTP_HOST: Joi.string().description('server that will send the emails'),
    SMTP_PORT: Joi.number().description('port to connect to the email server'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    SERVICE:Joi.string().description('server that will send the emails'),
    USER:Joi.string().description('server that will send the emails'),
    PASS: Joi.string().description('server that will send the emails'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

let DB_URL = process.env.MONGODB_URL.replace('<password>', process.env.MONGODB_PASSWORD);
DB_URL = DB_URL.replace('<username>', process.env.MONGODB_USERNAME);
DB_URL = DB_URL.replace('<database>', process.env.MONGODB_DATABASE);

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  baseApiUrl: `${envVars.ENFORCE_SSL ? 'https' : 'http'}://${envVars.API_DOMAIN}:${envVars.USE_PORT ? envVars.PORT : ''}`,
  mongoose: {
    url: DB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  service: envVars.SERVICE,
  user: envVars.USER,
  pass:envVars.PASS,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
    userInvitationExpirationMinutes: envVars.JWT_USER_INVITATION_EXPIRATION_MINUTES,
    oneTimeTokenExpirationMinutes: envVars.JWT_USER_ACCESS_EXPIRATION_MINUTES,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};
