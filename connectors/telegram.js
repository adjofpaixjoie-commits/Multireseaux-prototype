const TelegramBot = require("node-telegram-bot-api");
const { estimateCost } = require("../pricing");

let bot = null;

function getBot() {
  if (!bot) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN manquant dans .env");
    }
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

/**
 * Publie un fichier sur Telegram.
 * Interface commune a tous les connecteurs: publish(filePath, options)
 * @returns {Promise<{platform, success, cost, detail}>}
 */
async function publish(filePath, options = {}) {
  const cost = estimateCost("telegram", options);
  try {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) throw new Error("TELEGRAM_CHAT_ID manquant dans .env");

    const b = getBot();
    const mime = options.mimetype || "";
    let result;

    if (mime.startsWith("image/")) {
      result = await b.sendPhoto(chatId, filePath, { caption: options.caption || "" });
    } else if (mime.startsWith("video/")) {
      result = await b.sendVideo(chatId, filePath, { caption: options.caption || "" });
    } else {
      result = await b.sendDocument(chatId, filePath, { caption: options.caption || "" });
    }

    return { platform: "telegram", success: true, cost, detail: result.message_id };
  } catch (err) {
    return { platform: "telegram", success: false, cost: 0, detail: err.message };
  }
}

module.exports = { publish };
