#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

class Mattermost {
    csrfToken = '';
    authToken = '';
    baseUrl = '';

    constructor() {}

    async init({
        loginId,
        password,
        url
    }) {
        this.baseUrl = url;
        await this.getCsrftoken(loginId, password);
    }

    async getCsrftoken(login_id, password) {
        const url = this.baseUrl + '/api/v4/users/login';

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                login_id,
                password
            })
        })

        if (res.status !== 200) {
            console.log();
            console.log('\x1b[31m', 'Error: Could not login to Mattermost. Check your credentials and try again.', '\x1b[0m');
            console.log();
            console.log('Ensure that the .env file in ' + process.cwd() + ' contains correct values for MM_LOGIN_ID, MM_PASSWORD, and MM_HOST');
            process.exit(1);
        }

        const cookies = res.headers.get('set-cookie');
        const csrfToken = cookies.match(/MMCSRF=(.*?);/)[1];
        const authToken = cookies.match(/MMAUTHTOKEN=(.*?);/)[1];

        this.csrfToken = csrfToken;
        this.authToken = 'Bearer ' + authToken;
    }

    async callApi(uri, method = 'GET', body = null, baseUrl = this.baseUrl) {
        const url = `${baseUrl}/${uri}`;
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': this.authToken,
                'X-CSRF-Token': this.csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body
        })

        const data = await res.json();

        return data;

    }

    async getTeams() {
        return await this.callApi(
            'plugins/focalboard/api/v2/teams'
        );
    }

    async getBoards(teamId) {
        return await this.callApi(
            `plugins/focalboard/api/v2/teams/${teamId}/boards`
        );
    }

    async getBoardMetaData(boardId) {
        return await this.callApi(
            `plugins/focalboard/api/v2/boards/${boardId}`
        );
    }

    async getCards(boardId) {
        return await this.callApi(
            `plugins/focalboard/api/v2/boards/${boardId}/cards`
        );
    }

    async getBoardSharing(boardId) {
        return await this.callApi(
            `plugins/focalboard/api/v2/boards/${boardId}/sharing`
        );
    }

    async searchBoards(query) {
        return await this.callApi(
            `plugins/focalboard/api/v2/boards/search?query=${query}`
        );
    }

    async me() {
        return await this.callApi(
            'api/v4/users/me'
        );
    }

    filterToUser(userId, card) {
        const props = card.properties;

        for (const key in props) {
            if (props[key] === userId) {
                return true;
            }
        }

        return false;
    }

    filterNotCompleted(card, completedValueId) {
        const props = card.properties;

        for (const key in props) {
            if (props[key] === completedValueId) {
                return false;
            }
        }

        return true;
    }

    getCompletedId(board) {
        const properties = board.cardProperties;

        for (const prop of properties) {
            if (prop.name === 'Status') {
                for (const option of prop.options) {
                    if (option.value.includes('Completed') || option.value.includes('Done')) {
                        return option.id;
                    }
                }
            }
        }

        return null;

    }    

    print = (data) => {
        // make it to a table with the board name as the header and colors for the cards
        // It will be printed to the cli with colors
    
        console.log();
        
        data.forEach(async board => {
            console.log(this.makeLink(
                '', //`${this.baseUrl}/${board.teamId}/${board.id}/${board.viewId}`,
                board.title,
                '\x1b[32m',
                true
            ));

            if (board.description) {
                console.log(`\x1b[2m${board.description}\x1b[0m`);
            }

            board.cards.forEach((task, index) => {
                const createdAt = new Date(task.createAt);
                const daysAgo = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
                const color = daysAgo > 7 ? '\x1b[31m' : daysAgo > 3 ? '\x1b[33m' : '\x1b[32m';
                console.log(`\x1b[36m${(index + 1).toString()}:\x1b[0m ${task.title} |${color} ● \x1b[0m\x1b[2m${createdAt.toLocaleDateString()}\x1b[0m`); // Cyan for numbers
            });
            console.log();
        });
    }

    makeLink = (url, text, color, underlined) => {
        return `\x1b]8;;${url}\x1b\\${color}${underlined ? '\x1b[4m' : ''}${text}\x1b[0m\x1b]8;;\x1b\\`;
    }
}



const main = async () => {
    const mm = new Mattermost();

    await mm.init({
        loginId: process.env.MM_LOGIN_ID,
        password: process.env.MM_PASSWORD,
        url: process.env.MM_HOST,
    });

    mm.userId = (await mm.me()).id;

    const data = [];

    const teams = await mm.getTeams();

    for (const team of teams) {
        const boards = await mm.getBoards(team.id);

        for (const board of boards) {
            let cards = await mm.getCards(board.id);

            if (!cards.length) {
                continue;
            }

            cards = cards
                .filter(
                    card => 
                        mm.filterToUser(mm.userId, card) && 
                        mm.filterNotCompleted(card, mm.getCompletedId(board))
                )

            if (cards.length === 0) {
                continue;
            }

            board.cards = cards;

            data.push(board)
        }
    }

    // console.log(JSON.stringify(data, null, 2));

    mm.print(data);

    return data;
}

main();