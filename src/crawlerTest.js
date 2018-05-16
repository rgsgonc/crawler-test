'use strict';

const Core = require('./core');
const Screenshot = require('../utils/screenshot');
const LOGGER = require('../utils/logger');
const { until, By } = require('selenium-webdriver');
const { CookieManager } = require('../utils/cookie-manager');
const TIMEOUT = 30000;

class CrawlerTest {

    constructor(URL) {
        this._URL = URL;
        this._driver = new Core().driver;
    }

    sleep(timeout = 5000) {
        this.loggerInfo(`Sleeping - ${timeout/1000} seconds`);
        this._driver.sleep(timeout);
    }

    getElement(xpath) {
        return this.waitFor(xpath);
    }

    type(text, xpath) {
        this.getElement(xpath).sendKeys(text);
    }

    submit(xpath) {
        this.waitFor(xpath).then(elm => elm.submit());
    }

    click(xpath) {
        this.getElement(xpath).click();
    }

    goTo(target) {
        this._driver.get(target);
    }

    getText(xpath) {
        return this.waitFor(xpath).then(elm => elm.getText());
    }

    waitFor(xpath) {
        this.loggerInfo(`Waiting '${xpath}' for ${TIMEOUT}`);
        return this._driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT);
    }

    executeInflow(callback) {
        return this._driver.controlFlow().execute(callback);
    }

    executeScript(callback) {
        return this._driver.executeScript(callback);
    }

    quit() {
        this._driver.quit();
    }

    takeScreenshot() {
        new Screenshot(this._driver).take();
    }

    reload() {
        this.loggerInfo("Reloading ...");
        this._driver.navigate().refresh();
    }

    doLogin(user, pass) {
        this.type(user.data, user.xpath);
        this.type(pass.data, pass.xpath);
        this.submit(pass.xpath + "//ancestor::form");
    }

    authenticate(dto) {
        this.goTo(dto.loginURL);
        dto.beforeLogin && this.executeInflow(dto.beforeLogin);
        const cookies = `${process.argv[2]}-${dto.user.data}`;
        const cookieManager = new CookieManager(cookies, this._driver);

        if (dto.cookies && cookieManager.exists()) {
            this.loggerInfo(`Using cookies: ${cookies}`);
            this.executeInflow(() => cookieManager.inject(() => this.reload()));
            this.sleep(3000);
        } else {
            this.loggerInfo('Doing login ...');
            this.doLogin(dto.user, dto.pass);
            this.sleep(3000);
            this.executeInflow(() => cookieManager.store());
        }

    }

    _logger(msg, level, addInFlow = true) {
        addInFlow ? this.executeInflow(() => LOGGER.log(level, msg)) : LOGGER.log(level, msg);
    }

    loggerDebug(message, addInFlow) {
        this._logger(message, 'debug', addInFlow);
    }

    loggerInfo(message, addInFlow) {
        this._logger(message, 'info', addInFlow);
    }

    loggerWarn(message, addInFlow) {
        this._logger(message, 'warn', addInFlow);
    }

    loggerError(message, addInFlow) {
        this._logger(message, 'error', addInFlow);
    }

    get driver() {
        return this._driver;
    }

    start() {
        const target = this._URL;
        if (!target) return this.loggerWarn( 'Target is required!');
        this.loggerInfo(`Initializing... TARGET: ${target}`);
        this.goTo(target);
    }

}

module.exports = CrawlerTest;