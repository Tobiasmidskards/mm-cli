class Mattermost {
    csrfToken = '';
    authToken = '';
    baseUrl = '';

    async init({ loginId, password, url }) {
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

    async callApi(uri, method = 'GET', body = null) {
        const url = this.baseUrl + '/' + uri;

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

    async collectData() {
        const data = [];

        const user = await this.me();
        const teams = await this.getTeams();

        for (const team of teams) {
            const boards = await this.getBoards(team.id);

            for (const board of boards) {
                let cards = await this.getCards(board.id);

                if (!cards.length) {
                    continue;
                }

                cards = cards
                    .filter(
                        card =>
                            this.filterToUser(user.id, card) &&
                            this.filterNotCompleted(card, this.getCompletedId(board))
                    )

                if (cards.length === 0) {
                    continue;
                }

                board.cards = cards;

                data.push(board)
            }
        }

        return data;
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
}

module.exports = Mattermost;