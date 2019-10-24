'use strict';
const winston = require('winston');
const CustomTransport = require('./CustomTransport');

const myCustomLevels = {
  levels: {
    error: 0,
    info: 1,
    success: 2,
    maintenance: 3,
    warning: 4
  },
  colors: {
    error: '#E74C3C',
    warn: '#fcb603',
    maintenance: '#C0392B',
    success: '#2ECC71',
    info: '#3498DB'
  }
};
winston.addColors(myCustomLevels.colors);
const logger = winston.createLogger({
  levels: myCustomLevels.levels,
  format: winston.format.combine(
    winston.format.label({ action: '', message: false }),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new CustomTransport({
      filename: './logs/logs.json',
      handleExceptions: true,
      colorize: true,
    })
  ],
});

module.exports = logger;