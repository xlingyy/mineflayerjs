const config = require("./config.js");
const mineflayer = require("mineflayer");
const TelegramBot = require("node-telegram-bot-api");
const token = config.token;
const tgbot = new TelegramBot(token, { polling: true });

const {
  myId,
  HolyBots,
  serverURL,
  serverUsername,
  serverVersion,
  home,
  GroupID,
  OwnerNickname,
  HolyServer,
} = config;

const homeCommand = `/home ${home}`;
let shift = false;
let forward = false;

const bot = mineflayer.createBot({
  host: serverURL,
  username: serverUsername,
  version: serverVersion,
});

const buttons = {
  reply_markup: JSON.stringify({
    keyboard: [["Movement"], ["Cheat"], ["Player"], ["Enter"]],
    resize_keyboard: true,
  }),
};
const MovementButtons = {
  reply_markup: JSON.stringify({
    keyboard: [["/start"], ["Forward", "Shift"], ["LookAtMe"]],
    resize_keyboard: true,
  }),
};

const PlayerButtons = {
  reply_markup: JSON.stringify({
    keyboard: [
      ["/start"],
      ["Tpa", "Home", "Coordinates"],
      ["Enter", "Disconnect"],
    ],
    resize_keyboard: true,
  }),
};

const CheatButtons = {
  reply_markup: JSON.stringify({
    keyboard: [["/start"], ["Farm", "Throw"]],
    resize_keyboard: true,
  }),
};

tgbot.on("message", (msg) => {
  try {
    if (!msg.chat.id == myId) return;
    switch (msg.text) {
      case "Forward": {
        forward = !forward;
        bot.setControlState("forward", forward);
        console.log(msg.text + " executed, current state: " + forward);
        tgbot.sendMessage(
          msg.chat.id,
          msg.text + " executed, current state: " + forward
        );
        break;
      }
      case "Shift": {
        shift = !shift;
        bot.setControlState("sneak", shift);
        console.log(msg.text + " executed, current state: " + shift);
        tgbot.sendMessage(
          msg.chat.id,
          msg.text + " executed, current state: " + shift
        );
        break;
      }
      case "Tpa": {
        bot.chat("/tpa " + OwnerNickname);
        tgbot.sendMessage(msg.chat.id, `${msg.text} executed`);
        break;
      }
      case "Player": {
        tgbot.sendMessage(msg.chat.id, `${msg.text}`, PlayerButtons);
        break;
      }
      case "Movement": {
        tgbot.sendMessage(msg.chat.id, `${msg.text}`, MovementButtons);
        break;
      }
      case "Cheat": {
        tgbot.sendMessage(msg.chat.id, `${msg.text}`, CheatButtons);
        break;
      }
      case "Home": {
        bot.chat(homeCommand);
        tgbot.sendMessage(msg.chat.id, `${msg.text} executed`);
        break;
      }
      case "Enter": {
        tgbot.sendMessage(msg.chat.id, "Executing..");
        EnterServer(msg);
        break;
      }
      case "LookAtMe": {
        console.log("Executing " + msg.text);
        tgbot.sendMessage(myId, "Executing " + msg.text);
        lookAtNearestPlayer();
        break;
      }
      case "Coordinates": {
        const x = Math.round(bot.entity.position.x);
        const y = Math.round(bot.entity.position.y);
        const z = Math.round(bot.entity.position.z);
        tgbot.sendMessage(
          msg.chat.id,
          `<b>${bot.username} coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
          { parse_mode: "HTML" }
        );
        console.log(`${bot.username} coordinates: ${x}, ${y}, ${z}`);
        break;
      }
      case "Disconnect": {
        bot.quit();
        tgbot.sendMessage(msg.chat.id, `Disconnected`);
        break;
      }
      case "Near": {
        const playersToShow = ["<b>List of players:</b>"];
        const players = Object.values(bot.entities).filter(
          (e) => e.type === "player" && e.username !== bot.username
        );
        players.forEach((player) => {
          const x = Math.round(player.position.x);
          const y = Math.round(player.position.y);
          const z = Math.round(player.position.z);
          if (HolyBots.includes(player.username)) return;
          playersToShow.push(
            `<b><code>${player.username}</code> position: <span class="tg-spoiler"><code>${x}, ${y}, ${z}</code></span></b>`
          );
        });
        console.log(
          `${playersToShow.join("\n")} \n\nNumber of players ${
            playersToShow.length - 1
          }`
        );
        tgbot.sendMessage(
          GroupID,
          `${playersToShow.join("\n")} \n\n<b>Number of players</b> <code>${
            playersToShow.length - 1
          }</code>`,
          { parse_mode: "HTML" }
        );
        break;
      }
      case "Farm": {
        FarmFood(msg);
        break;
      }
      case "Throw": {
        throwAll(msg);
        break;
      }
      case "/start": {
        tgbot.sendMessage(msg.chat.id, "Welcome!", buttons);
        break;
      }
      default:
        {
          console.log("Me: " + msg.text);
          tgbot.sendMessage(msg.chat.id, "Sent: " + msg.text);
          bot.chat(msg.text);
        }
        break;
    }
  } catch (err) {
    console.error(err);
    tgbot.sendMessage(msg.chat.id, "An error occurred: " + err.message);
  }
});

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

function EnterServer(msg) {
  try {
    setTimeout(() => {
      bot.clickWindow(HolyServer, 0, 0);
    }, 1500);
    bot.chat("/anarchy");
    console.log("Opened window");
  } catch (error) {
    console.error(error);
    tgbot.sendMessage(
      myId,
      "Error occurred while executing EnterServer function: " + error.message
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

async function FarmFood(msg) {
  let food = 0;
  try {
    const itemsToClick = [
      11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47, 48,
      49, 50, 51,
    ];
    for (let i = 0; i < itemsToClick.length; i++) {
      bot.chat("/anarchy");
      console.log("Opened window");
      await new Promise((resolve) => setTimeout(resolve, 600));
      bot.clickWindow(itemsToClick[i], 0, 0);
      await new Promise((resolve) => setTimeout(resolve, 600));
      bot.chat("/kit start");
      await new Promise((resolve) => setTimeout(resolve, 600));
      bot.chat("/hub");
      food += 8;
      console.log("Server " + i + " ok");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    tgbot.sendMessage(msg.chat.id, "Farmed " + food);
  } catch (error) {
    console.error(error);
    tgbot.sendMessage(
      myId,
      "Error occurred while executing farm function: " + error.message
    );
  }
}

const players = [];
const mobs = [];

bot.on("chat", (message, username) => {
  tgbot.sendMessage(myId, `<code>${username}: ${message}</code> `, {
    parse_mode: "HTML",
  });
});

bot.on("entitySpawn", (entity) => {
  const x = Math.round(entity.position.x);
  const y = Math.round(entity.position.y);
  const z = Math.round(entity.position.z);
  if (HolyBots.includes(entity.username)) return;
  if (entity.type === "player") {
    players.push(entity.name);
    tgbot.sendMessage(
      GroupID,
      `<b>Player spawned nearby: <code>${entity.username} </code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player spawned nearby: ${entity.username} Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.push(entity.name);
    console.log(
      `Mob spawned nearby: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  }
});

bot.on("entityGone", (entity) => {
  const x = Math.round(entity.position.x);
  const y = Math.round(entity.position.y);
  const z = Math.round(entity.position.z);
  if (entity.type === "player") {
    players.splice(players.indexOf(entity.username), 1);
    tgbot.sendMessage(
      GroupID,
      `<b>Player disappearead nearby: <code>${entity.username}</code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player disapparead nearby: ${entity.name}</code> Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.splice(mobs.indexOf(entity.name), 1);
    console.log(
      `Mob disappeared nearby: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  }
});

bot.on("messagestr", (message) => {
  const exceptions = ["ʟ |", "▶"];
  if (exceptions.some((ex) => !message.startsWith(ex))) return;
  console.log(`${message}`);
  tgbot.sendMessage(myId, `${message}`);
});

bot.on("spawn", () => {
  tgbot.sendMessage(myId, `Bot has successfully spawned`);
  console.log("Bot has successfully spawned");
});

bot.on("kicked", (reason) => tgbot.sendMessage(myId, "Kicked for", reason));
bot.on("error", console.error);
bot.on("end", () => tgbot.sendMessage(myId, "Disconnected"));
