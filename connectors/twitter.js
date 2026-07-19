// Connecteur Twitter/X - version provisoire (en attente des clés API X)
// Ce fichier existe pour que le serveur puisse démarrer même sans compte développeur X configuré.
// Une fois les clés X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET disponibles,
// on remplacera ce fichier par la vraie logique de publication.

async function publish(content) {
  console.log("Publication Twitter/X non configurée pour l'instant. Contenu reçu :", content);
  return {
    success: false,
    message: "Le connecteur Twitter/X n'est pas encore configuré.",
  };
}

module.exports = { publish };
