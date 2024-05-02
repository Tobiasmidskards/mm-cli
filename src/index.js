#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const Mattermost = require('./Mattermost');
const Printer = require('./Printer');

const mm = new Mattermost();
const printer = new Printer();

const main = async () => {

    await mm.init({
        loginId: process.env.MM_LOGIN_ID,
        password: process.env.MM_PASSWORD,
        url: process.env.MM_HOST,
    });

    printer.print(
        await mm.collectData()
    );
    
}

main();