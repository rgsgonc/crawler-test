'use strict';
const fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    LOGGER = require('./logger');

/**
 * @author Laisson R. Silveira
 */
class Screenshot {
    /**
     * @constructor
     * @param {Webdriver} driver - Driver do Selenium
     */
    constructor(driver) {
        this.driver = driver;
        this._CONFIG = __CONFIG.screenshot;
        this._PATH = __CONFIG.screenshot.path;
        this._deleteOldScreenshots();
        this._makeScreenshotFolder();
    }

    /**
     * @private
     */
    _deleteOldScreenshots() {
        if (fs.existsSync(this._PATH)) {
            LOGGER.debug('[SCREENSHOT] - Removendo screenshots antigos...');
            fs.readdir(this._PATH, (err, files) => {
                if (err) return LOGGER.warn('[SCREENSHOT] - Não foi possível ler o diretório (' + this._PATH + '):', err);
                files.forEach(file => {
                    let filePath = path.join(this._PATH, file);
                    fs.stat(filePath, (err, stat) => {
                        if (err) return LOGGER.warn('[SCREENSHOT] - Não foi possível recuperar data dos screenshots antigos a serem deletados:', err);
                        if (moment() > moment(stat.ctime).add(this._CONFIG.timeToDelete.amount, this._CONFIG.timeToDelete.time)) {
                            fs.unlink(filePath, err => {
                                if (err) LOGGER.warn('[SCREENSHOT] - Não foi possível remover screenshots antigos:', err);
                            });
                        }
                    });
                });
            });
        }
    }

    /**
     * @private
     */
    _makeScreenshotFolder() {
        if (!fs.existsSync(this._PATH)) {
            LOGGER.debug('[SCREENSHOT] - Criando pasta para guardar imagens de erro...');
            let sep = '/', current = '', i = 0,
                segments = this._PATH.split(sep);
            while (i < segments.length) {
                current = current + sep + segments[i];
                if (!fs.existsSync(current)) {
                    try {
                        fs.mkdirSync(current);
                        LOGGER.info('[SCREENSHOT] - Diretório \'' + current + '\' criado com sucesso!');
                    } catch (e) {
                        LOGGER.warn('[SCREENSHOT] - Não foi possível criar diretório \'' + current + '\' para salvar screenshot do erro:', e.message);
                        i = segments.length;
                    }
                }
                i++;
            }
        }
    }

    /**
     * Salva imagem no caminho configurado em <code>basic-config.json: screenshot.path</code>
     * OBS: Caso não tenha sido informado ainda o caminho completo da pasta do usuário na config, a pasta informada
     * será concatenada com a pasta do usuário que está executando o serviço do crawler.
     */
    take() {
        this._setBackground();

        let fileName = moment().format('YYYY-MM-DD_HH-mm-ss') + '.png';
        let filePath = path.join(this._PATH, fileName);
        this.driver.takeScreenshot().then(image => {
            try {
                fs.writeFileSync(filePath, image.replace(/^data:image\/png;base64,/, ''), 'base64');
                LOGGER.info('[SCREENSHOT] - Screenshot salvo em \'' + filePath + '\'');
            } catch (err) {
                LOGGER.warn('[SCREENSHOT] - Não foi possível salvar screenshot:', err.message);
            }
        });
    }

    /**
     * @private
     */
    _setBackground() {
        return this.driver.executeScript(function () {
            var style = document.createElement('style'),
                text = document.createTextNode('body { background: #fff }');
            style.setAttribute('type', 'text/css');
            style.appendChild(text);
            document.head.insertBefore(style, document.head.firstChild);
        });
    }
}

module.exports = Screenshot;