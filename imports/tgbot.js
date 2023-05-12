const TelegramBot = require("node-telegram-bot-api");
const { token } = require("./config.js");
const tgbot = new TelegramBot(token, { polling: true });

module.exports = tgbot;
