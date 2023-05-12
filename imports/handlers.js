const { myId, GroupID, password } = require("./config.js");
const fs = require("fs");
const tgbot = require("./tgbot.js");
const bot = require("./createBot.js");

const deathHandler = () => {
  console.log("I died!");
  tgbot.sendMessage(GroupID, "Bot died");
};

const players = [];
const mobs = [];

const appearHandler = (entity) => {
  if (entity.username === bot.username) return;
  const x = Math.round(entity.position.x);
  const y = Math.round(entity.position.y);
  const z = Math.round(entity.position.z);
  if (entity.type === "player") {
    players.push(entity.name);
    tgbot.sendMessage(
      GroupID,
      `<b>Player appeared nearby: <code>${entity.username} </code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player appeared nearby: ${entity.username} Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.push(entity.name);
    console.log(
      `Mob appeared nearby: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  }
};

const disappearHandler = (entity) => {
  if (entity.username === bot.username) return;
  const x = Math.round(entity.position.x);
  const y = Math.round(entity.position.y);
  const z = Math.round(entity.position.z);
  if (entity.type === "player") {
    players.splice(players.indexOf(entity.username), 1);
    tgbot.sendMessage(
      GroupID,
      `<b>Player disappearead: <code>${entity.username}</code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player disapparead: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.splice(mobs.indexOf(entity.name), 1);
    console.log(
      `Mob disappeared nearby: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  }
};

const messageHandler = (message) => {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  msgDate =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  console.log(`${message}`);
  const match = message.match(/\b[\d|-\d]+\s+\d+\s+[\d|-\d]+\b/g);
  if (match) {
    console.log("Message contains coordinates:", message);
    tgbot.sendMessage(
      GroupID,
      `<b>Message contains coordinates:<code></b> ${message}</code>`,
      { parse_mode: "HTML"} 
    );
    fs.writeFileSync("./loggers/coordinates.txt", `\n${message}`, {
      flag: "a",
    });
  }
  fs.writeFileSync("./loggers/chat.txt", `\n${message}`, { flag: "a" });
};

const spawnHandler = () => {
  console.info("Bot spawned!");
  setTimeout(() => {
    bot.chat("/login " + password);
  }, 1000);
  bot.autoEat.options.priority = "foodPoints";
  bot.autoEat.options.startAt = 10;
  bot.autoEat.options.bannedFood.push("golden_apple");
};

const loginHandler = () => {
  console.log("Logged in");
  setTimeout(() => {
    tgbot.sendPhoto(myId, "./maps/map_000000.png");
  }, 1000);
};

const chatHandler = (username, message) => {
  switch (message) {
    case "!help": {
      bot.chat(`>${username}, Commands: time, ping, tps; Prefix: "!"`);
      break;
    }
    case "!time": {
      let date_ob = new Date();
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      bot.chat(`>${username}, current time is: ${hours}:${minutes}`);
      break;
    }
    case "!ping": {
      const player = bot.players[username];
      bot.chat(`>${username}, your ping is: ${player.ping}`);
      break
    }
    case "!tps": {
      bot.chat(`>${username}, current tps is: ${bot.getTps()}`);
      break
    }
  }
};

const autoEatHandler = (item, offhand) => {
  console.log(`Eating ${item.name} in ${offhand ? "offhand" : "hand"}`);
};

const autoEatHandlerF = (item, offhand) => {
  console.log(
    `Finished eating ${item.name} in ${offhand ? "offhand" : "hand"}`
  );
};

const autoEatErrHandler = console.error;

module.exports = {
  autoEatErrHandler,
  autoEatHandler,
  autoEatHandlerF,
  messageHandler,
  chatHandler,
  loginHandler,
  spawnHandler,
  appearHandler,
  disappearHandler,
  deathHandler,
};
