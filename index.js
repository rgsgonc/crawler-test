'use strict';
if (!process.argv[2]) throw Error('Informe o nome do site!');
const { existsSync, mkdirSync } = require('fs');

const path = './results';
!existsSync(path) && mkdirSync(path);

const { init } = require('./collect');
init(process.argv[2]);