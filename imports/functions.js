const bot = require("./createBot.js");
const tgbot = require("./tgbot.js");
const myId = require("./config.js");
const fs = require("fs");

function lookAtNearestPlayer() {
  try {
    const playerFilter = (entity) => entity.type === "player";
    const playerEntity = bot.nearestEntity(playerFilter);
    if (!playerEntity) {
      console.log("Can't see any player entity");
      return false;
    }
    const pos = playerEntity.position.offset(0, playerEntity.height, 0);
    bot.lookAt(pos);
    console.log("Executed");
    tgbot.sendMessage(myId, "Executed");
  } catch (error) {
    console.error(error);
    tgbot.sendMessage(
      myId,
      "Error occurred while executing lookAtNearestPlayer function: " +
        error.message
    );
  }
}

function botCoordinates(msg) {
  const x = Math.round(bot.entity.position.x);
  const y = Math.round(bot.entity.position.y);
  const z = Math.round(bot.entity.position.z);
  tgbot.sendMessage(
    msg.chat.id,
    `<b>${bot.username} coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
    { parse_mode: "HTML" }
  );
  console.log(`${bot.username} coordinates: ${x}, ${y}, ${z}`);
}

function sing() {
  fs.readFile("./imports/song.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const lines = data.trim().split("\n");

    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        bot.chat(">" + lines[i]);
        console.log(lines[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15000);
  });
}

async function msgAll() {
  try {
    const listOfPlayers = Object.keys(bot.players);
    for (const player of listOfPlayers) {
      await new Promise((resolve) => {
        setTimeout(() => {
          bot.chat(
            "/w " +
              player +
              " Введите код разблокировки в глобальный чат fdin4 После разблокировки тебе придёт об этом сообщение"
          );
          resolve();
        }, 1111);
      });
    }
  } catch (error) {
    console.error(error);
    tgbot.sendMessage(
      myId,
      "Error occurred while executing farm function: " + error.message
    );
  }
}

async function expunge() {
  var inventoryItemCount = bot.inventory.items().length;
  if (inventoryItemCount === 0) return;
  while (inventoryItemCount > 0) {
    const item = bot.inventory.items()[0];
    await bot.tossStack(item);
    inventoryItemCount--;
  }
}

async function throwAll(msg) {
  if (lookAtNearestPlayer() === false) return;
  await new Promise((resolve) => setTimeout(resolve, 4000));
  expunge();
  tgbot.sendMessage(msg.chat.id, "Throwed");
}

module.exports = {
  expunge,
  lookAtNearestPlayer,
  throwAll,
  msgAll,
  botCoordinates,
  sing,
};
