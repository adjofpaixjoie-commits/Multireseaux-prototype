const { TwitterApi } = require("twitter-api-v2");
const { estimateCost } = require("../pricing");

let client = null;

function getClient() {
  if (!client) {
    const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = process.env;
    if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
      throw new Error("Cles X manquantes dans .env");
    }
    client = new TwitterApi({
      appKey: X_API_KEY,
      appSecret: X_API_SECRET,
      accessToken: X_ACCESS_TOKEN,
      accessSecret: X_ACCESS_SECRET,
    });
  }
  return client;
}

/**
 * Publie un fichier (image/video) sur X avec une legende optionnelle.
 * Interface commune a tous les connecteurs: publish(filePath, options)
 * @returns {Promise<{platform, success, cost, detail}>}
 */
async function publish(filePath, options = {}) {
  const hasLink = /https
