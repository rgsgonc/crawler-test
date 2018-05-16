> PS: Project for test purposes only

### Install project

    npm install

### Run tests

    npm test (it needs mocha to be installed)

### Start project

Important settings for running on `config-app.json`:
    
```javascript
{
 ...
	"name": "chrome", //<chrome/phantomjs>
	"isHeadless": true //<true/false>
 ...
}
```
    
The execution can be done with the command:

```bash
npm start <nome do site_arquivo> <navegador> <optional - isHeadless>
ex: npm start simplify OR npm start simplify chrome OR npm start simplify chrome false
```
OR    

```
node server.js
Init collect in 'http://localhost:3001/<target>' - ex: http://localhost:3001/simplify
```

### Selenium api documents

[selenium-webdriver Docs](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/)