'use strict';
const request = require('request');
const qs = require('querystring');
// const { writeFileSync, existsSync, mkdirSync } = require('fs');
// const { join } = require('path');

class Mei {

    /**
     * @param {CrawlerTest} crawlerTest
     */
    constructor(crawlerTest) {
        this._crawler = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            this.loggerInfo('INICIANDO coleta do MEI');

            this._crawler.type('04156228916', '//input[@id="meiMB_cpf"]');
            this._crawler.type('14/08/1984', '//input[@id="meiMB_dataNascimento"]');

            this._crawler.sleep(10000); //tempo de quebrar o captcha

            this._crawler.click('//input[@id="form:btnContinuar"]');

            this._crawler.waitFor('//*[@id="j_id6:downloadBtn"]');

            let result = {};
            this.downloadPDF(result).then(() => {
                result.site = 'MEI-Download PDF';
                resolve(result);
            });

        });
    }

    downloadPDF(result) {
        return this._crawler.executeInflow(() => {
            let cookieSessionID, viewStateValue;
            this._crawler.driver.manage().getCookie('JSESSIONID')
                .then(sessionID => cookieSessionID = sessionID.value);

            this._crawler.getElement('//*[@id="javax.faces.ViewState"]').getAttribute('value')
                .then(viewStateID => viewStateValue = viewStateID);

            this._crawler.executeInflow(() => {
                const headers = {
                    'Cookie': '_skinNameCookie=mei;JSESSIONID=' + cookieSessionID,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    // 'Accept-Encoding': 'gzip, deflate',

                    // 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3380.0 Safari/537.36',
                    // 'Referer': 'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado_acesso.jsf;jsessionid=' + cookieSessionID,
                    // 'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7'
                    // 'DNT': 1,
                    // 'Connection': 'keep-alive',
                    // 'Upgrade-Insecure-Requests': 1,
                };
                const body = {
                    'j_id6': 'j_id6',
                    'uniqueToken': '',
                    'j_id6:downloadBtn': 'FAZER DOWNLOAD DO CERTIFICADO EM PDF',
                    'javax.faces.ViewState': viewStateValue
                };

                this._crawler.loggerDebug(`Efetuando download do PDF...
                    HEADER >>>>>>>\n', ${headers}
                    BODY >>>>>>>\n', ${body}
                    COOKIE >>>>>>>\n', ${cookieSessionID}
                `);

                this._crawler.driver.controlFlow().wait(this.downloadThroughPost(
                    'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado.jsf',//essa URL não joga para fora
                    headers, body, false, false))
                    .then(pdfBuffer => {
                        const pdfStr = Buffer.from(pdfBuffer).toString();
                        result.successDownload = /(Title\(Certificado da Condi)(.*?)(o de Microempreendedor Individual\))/g.test(pdfStr);
                        result.pdf = pdfBuffer;
                        // const filePath = join(__dirname, '..', 'download');
                        // if (!existsSync(filePath)) {
                        //     mkdirSync(filePath);
                        // }
                        // writeFileSync(join(filePath, 'certificado.pdf'), pdfBuffer, 'binary');

                        this._crawler.loggerInfo('FINALIZADO coleta do MEI');
                    })
                    .catch(err => this._crawler.loggerError(err));
            });
        });
    }

    downloadThroughPost(resourceURL, headers, body, redirect, isRejectUnauthorized = true) {
        let formData = qs.stringify(body);
        return new Promise((resolve, reject) => {
            let options = {
                url: resourceURL,
                encoding: null,
                followRedirect: redirect,
                headers: headers || {},
                body: formData,
                rejectUnauthorized: isRejectUnauthorized
            };
            request.post(options, (error, response, body) => {
                if (error) reject(error);
                resolve(body);
            });
        });
    }

    static get URL() {
        return 'http://www22.receita.fazenda.gov.br/inscricaomei/private/pages/certificado_acesso.jsf';
    }

}

module.exports = Mei;