const config = require('./config.js');
const mineflayer = require("mineflayer");
const TelegramBot = require("node-telegram-bot-api");
const tgbot = new TelegramBot(config.token, { polling: true });

let HolyBots = ["§f§e", "§7", "§6Буржуй", "§6Скупердяй", "CIT-6dbc3d29d962"];
const myid = config.myid
shift = false;
forward = false;

const bot = mineflayer.createBot({
  host: "mc.holyworld.me",
  username: "YOUR NICKNAME",
  version: "1.19.2",
});

const buttons = {
  reply_markup: JSON.stringify({
    keyboard: [
      ["Tpa", "Home", "Coordinates"],
      ["Enter", "Near", "Disconnect"],
      ["Forward", "Shift", "LookAtMe"],
    ],
    resize_keyboard: true,
  }),
};


tgbot.on("message", (msg) => {
  if (!msg.chat.id == myid) return;
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
      bot.chat("/tpa ");
      tgbot.sendMessage(msg.chat.id, `${msg.text} executed`);
      break;
    }
    case "Home": {
      bot.chat("/home "+ config.home);
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
      tgbot.sendMessage(myid, "Executing " + msg.text);
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
        {parse_mode: "HTML"}
      );
      console.log(`${bot.username} coordinates: ${x}, ${y}, ${z}`)
      break;
    }
    case "Dissconnect": {
      bot.quit();
      tgbot.sendMessage(msg.chat.id, `Disconnected from ${bot.host}`);
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
        msg.chat.id,
        `${playersToShow.join(
          "\n"
        )} \n\n<b>Number of players</b> <code>${
          playersToShow.length - 1
        }</code>`,
        { parse_mode: "HTML" }
      );
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
});

function lookAtNearestPlayer() {
  const playerFilter = (entity) => entity.type === "player";
  const playerEntity = bot.nearestEntity(playerFilter);
  if (!playerEntity) {
    console.log("Can't see any player entity");
    return;
  }
  const pos = playerEntity.position.offset(0, playerEntity.height, 0);
  bot.lookAt(pos);
  console.log("Executed");
  tgbot.sendMessage(myid, "Executed");
}

function EnterServer(msg) {
  setTimeout(() => {
    bot.clickWindow(24, 0, 0);
  }, 1000);
  bot.chat("/anarchy");
  console.log("Opened window");
}

const players = [];
const mobs = [];

bot.on("messagestr", (message) => {
  const exceptions = ["ʟ |", "▶"];
  if (exceptions.some((ex) => !message.startsWith(ex))) return;
  console.log(`${message}`);
  tgbot.sendMessage(myid, `${message}`);
});

bot.on("spawn", () => {
  tgbot.sendMessage(myid, `Bot has successfully spawned`);
  console.log("Bot has successfully spawned");
});

bot.on("entitySpawn", (entity) => {
  const x = Math.round(entity.position.x);
  const y = Math.round(entity.position.y);
  const z = Math.round(entity.position.z);
  if (HolyBots.includes(entity.username)) return;
  if (entity.type === "player") {
    players.push(entity.name);
    tgbot.sendMessage(
      myid,
      `<b>Player spawned nearby: <code>${entity.username} </code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player spawned nearby: ${entity.username} Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.push(entity.name);
    tgbot.sendMessage(
      myid,
      `<b>Mob spawned nearby: <code>${entity.name}</code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
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
      myid,
      `<b>Player disappearead nearby: <code>${entity.username}</code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Player disapparead nearby: ${entity.name}</code> Coordinates: ${x}, ${y}, ${z}`
    );
  } else if (entity.type === "mob") {
    mobs.splice(mobs.indexOf(entity.name), 1);
    tgbot.sendMessage(
      myid,
      `<b>Mob disappearead nearby: <code>${entity.username}</code> Coordinates: <span class="tg-spoiler">${x}, ${y}, ${z}</span></b>`,
      { parse_mode: "HTML" }
    );
    console.log(
      `Mob disappeared nearby: ${entity.name} Coordinates: ${x}, ${y}, ${z}`
    );
  }
});

bot.on("kicked", (reason) => tgbot.sendMessage(myid, "Kicked for", reason));
bot.on("error", console.error);
bot.on("end", () => tgbot.sendMessage(myid, "Disconnected"));
