

class Printer {
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

module.exports = Printer;