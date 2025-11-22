"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MOVIES = ['Inception', 'Interstellar', 'The Dark Knight', 'Tenet', 'Dunkirk', 'Memento'];
const command = {
    name: 'search',
    description: 'Search for a movie',
    type: 'slash', // Autocomplete works best with slash, but our system supports both if we wanted
    args: '<movie:auto>',
    async run(ctx) {
        const { movie } = ctx.args;
        await ctx.reply(`🎬 You selected: **${movie}**`);
    },
    async auto(ctx) {
        // ctx.raw is the interaction
        const interaction = ctx.raw; // AutocompleteInteraction
        const focusedValue = interaction.options.getFocused();
        const filtered = MOVIES.filter(choice => choice.toLowerCase().startsWith(focusedValue.toLowerCase()));
        await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
    }
};
exports.default = command;
