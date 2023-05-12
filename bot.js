const {
  expunge,
  lookAtNearestPlayer,
  throwAll,
  msgAll,
  botCoordinates,
  sing,
} = require("./imports/functions.js");
const { myId, GroupID } = require("./imports/config.js");
const {
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
} = require("./imports/handlers.js");
const bot = require("./imports/createBot.js");
const tgbot = require("./imports/tgbot.js");

let shiftState = false;
let forwardState = false;

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
    keyboard: [["/start"], ["Coordinates"], ["Disconnect"]],
    resize_keyboard: true,
  }),
};

const CheatButtons = {
  reply_markup: JSON.stringify({
    keyboard: [["/start"], ["Throw", "Near"]],
    resize_keyboard: true,
  }),
};

tgbot.on("message", (msg) => {
  try {
    if (!msg.chat.id == myId) return;
    switch (msg.text) {
      case "Forward": {
        forwardState = !forwardState;
        bot.setControlState("forward", forwardState);
        console.log(msg.text + " executed, current state: " + forwardState);
        tgbot.sendMessage(
          msg.chat.id,
          msg.text + " executed, current state: " + forwardState
        );
        break;
      }
      case "Shift": {
        shiftState = !shiftState;
        bot.setControlState("sneak", shiftState);
        console.log(msg.text + " executed, current state: " + shiftState);
        tgbot.sendMessage(
          msg.chat.id,
          msg.text + " executed, current state: " + shiftState
        );
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
      case "Sing": {
        sing();
      }
      case "Cheat": {
        tgbot.sendMessage(msg.chat.id, `${msg.text}`, CheatButtons);
        break;
      }
      case "LookAtMe": {
        console.log("Executing " + msg.text);
        tgbot.sendMessage(myId, "Executing " + msg.text);
        lookAtNearestPlayer();
        break;
      }
      case "Coordinates": {
        botCoordinates(msg);
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
          playersToShow.push(
            `<b><code>${
              player.username
            }</code> position: <span class="tg-spoiler"><code>${x}, ${y}, ${z}</code></span>(${bot.entity.position.distanceTo(
              player.position
            )})</b>`
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
      case "Throw": {
        throwAll(msg);
        break;
      }
      case "msg": {
        msgAll();
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

bot.on("death", deathHandler);
bot.on("entitySpawn", appearHandler);
bot.on("entityGone", disappearHandler);
bot.once("spawn", spawnHandler);
bot.once("login", loginHandler);
bot.on("chat", chatHandler);
bot.on("messagestr", messageHandler);
bot.on("death", chatHandler);
bot.on("autoeat_started", autoEatHandler);
bot.on("autoeat_finished", autoEatHandlerF);
bot.on("autoeat_error", autoEatErrHandler);
bot.on("kicked", (reason) => console.log(reason));
bot.on("error", console.error);
bot.on("end", () => tgbot.sendMessage(GroupID, "Disconnected. Check logs"));
