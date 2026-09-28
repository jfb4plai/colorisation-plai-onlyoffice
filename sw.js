/**
 * Colorization PLAI — Service Worker
 *
 * Stratégie « stale-while-revalidate » : sert toujours la copie déjà en
 * cache immédiatement (fonctionne donc hors ligne dès la 2e ouverture),
 * et rafraîchit ce cache en tâche de fond dès que le réseau est
 * disponible. La version mise à jour n'est utilisée qu'à la PROCHAINE
 * ouverture du plugin — jamais en interrompant l'usage en cours.
 *
 * N'est actif que lorsque le plugin est chargé via une URL distante
 * (config.json → baseUrl). Une installation 100% locale (baseUrl vide)
 * ne peut pas enregistrer de Service Worker (protocole non http/https)
 * et reste donc, comme avant, entièrement embarquée — ce fichier est
 * alors simplement ignoré.
 */

const CACHE_NAME = 'colorization-plai-cache-v1';

self.addEventListener('install', () => {
    // Prend effet dès l'installation, sans attendre la fermeture des
    // anciennes instances du panneau plugin.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Seules nos propres ressources (même origine) passent par le cache.
    // Les CDN externes (police Google, plugins.js d'OnlyOffice) restent
    // en réseau direct : non critiques pour le fonctionnement hors ligne
    // du panneau (polices de repli système, plugins.js déjà chargé par
    // OnlyOffice avant notre page).
    if (event.request.method !== 'GET') return;

    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) =>
            cache.match(event.request).then((cached) => {
                var networkFetch = fetch(event.request)
                    .then((response) => {
                        if (response && response.ok) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    })
                    .catch(() => cached); // hors ligne : repli sur le cache

                // Réponse immédiate depuis le cache si elle existe ;
                // sinon on attend le réseau (premier chargement).
                return cached || networkFetch;
            })
        )
    );
});
