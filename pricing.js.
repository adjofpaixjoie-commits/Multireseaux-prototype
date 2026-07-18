// Table de tarifs par plateforme et type d'action.
// Mettez a jour ces valeurs si X (ou une autre plateforme) change ses prix.
// Toutes les valeurs sont en dollars US ($).

const PRICING = {
  telegram: {
    post: 0, // gratuit via Bot API
  },
  x: {
    post_no_link: 0.015,
    post_with_link: 0.20,
  },
};

/**
 * Estime le cout d'une publication sur une plateforme donnee.
 * @param {string} platform - "telegram" | "x"
 * @param {object} options - { hasLink: boolean }
 * @returns {number} cout estime en dollars
 */
function estimateCost(platform, options = {}) {
  if (platform === "telegram") {
    return PRICING.telegram.post;
  }
  if (platform === "x") {
    return options.hasLink ? PRICING.x.post_with_link : PRICING.x.post_no_link;
  }
  return 0;
}

module.exports = { PRICING, estimateCost };
