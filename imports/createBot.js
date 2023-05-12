const mineflayer = require("mineflayer");
const path = require("path");
const { serverURL, botUsername, serverVersion } = require("./config.js");
const autoeat = require("mineflayer-auto-eat").plugin;
const { mapDownloader } = require("mineflayer-item-map-downloader");
const tpsPlugin = require('mineflayer-tps')(mineflayer)

const bot = mineflayer.createBot({
  "mapDownloader-saveToFile": true,
  "mapDownloader-outputDir": path.join(__dirname, "../maps"),
  host: serverURL,
  username: botUsername,
  version: serverVersion,
});

bot.loadPlugin(autoeat);
bot.loadPlugin(mapDownloader);
bot.loadPlugin(tpsPlugin)

module.exports = bot;
