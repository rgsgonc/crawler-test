'use strict';
global.__CONFIG = require('./config-app');
const { writeFileSync } = require('fs');
const { join } = require('path');
const LOGGER = require('./utils/logger');

function saveResult(data, fileName) {
    writeFileSync(join('./results', `${fileName}.json`), JSON.stringify(data));
}

function init(target) {
    process.argv[2] = target;
    const CrawlerTest = require('./src/crawlerTest');
    const Site = require(`./targets/${target}`);
    const crawlerTest = new CrawlerTest(Site.URL);
    return new Promise(resolve => {
        crawlerTest.start();
        new Site(crawlerTest).execute().then(result => {
            LOGGER.info('Collect Finished');
            crawlerTest.quit();
            saveResult(result, target);
            resolve(result);
        }).catch(err => {
            crawlerTest.takeScreenshot();
            throw err;
        });
    })
}

module.exports = { init };