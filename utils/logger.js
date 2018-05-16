const moment = require("moment"),
    winston = require("winston");
module.exports = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: __CONFIG.logLevel,
            timestamp: function () {
                return `[ ${ process.pid } ] ${ moment().format("DD/MM/YY HH:mm:ss") }`;
            },
            colorize: true
        })
    ]
});


