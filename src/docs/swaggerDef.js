const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Eikova API documentation',
    version,
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      // url: `http://localhost:${config.port}/v1`,
      url: config.env === 'production' ? `${config.baseApiUrl}/v1` : `http://localhost:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
