const figlet = require('figlet');

console.log('--- ANSI Shadow (Default) ---');
console.log(figlet.textSync('AVINEX', { font: 'ANSI Shadow', horizontalLayout: 'default' }));

console.log('\n--- ANSI Shadow (Full) ---');
console.log(figlet.textSync('AVINEX', { font: 'ANSI Shadow', horizontalLayout: 'full', verticalLayout: 'full', textAlignment: 'center' }));
