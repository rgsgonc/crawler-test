'use strict';

class Simplify {

    constructor(crawlerTest) {
        this.crawler = crawlerTest;
    }

    execute() {
        return new Promise(resolve => {

            // this.crawler.takeScreenshot();

            let result = { site: 'Simplify' };
            this.crawler.getText('//div[contains(@class,"text-simplify")]/small').then(version => {
                result.version = version;
                console.log(version);
                resolve(result);
            });

        });
    }

    static get URL() {
        return 'http://admin.simplifyzone.com.br/app/#!/login';
        // return 'http://localhost:3000/app/#!/login';
    }

}

module.exports = Simplify;