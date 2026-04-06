const CACHE_VERSION = "20260406-3";
const STATIC_CACHE = `sfc-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `sfc-runtime-${CACHE_VERSION}`;

const PRECACHE_PATHS = [
	"./",
	"./index.html",
	"./game.html",
	"./setting.html",
	"./create_boards.html",
	"./habit_bottle.html",
	"./devlog.html",
	"./offline.html",
	"./manifest.webmanifest",
	"./css/ui.css",
	"./css/index.css",
	"./css/setting.css",
	"./css/create_boards.css",
	"./js/i18n.js",
	"./js/umami-loader.js",
	"./js/ui.js",
	"./js/pwa.js",
	"./js/index.js",
	"./js/home.js",
	"./js/home_onboarding_intro.js",
	"./js/Data.js",
	"./js/create_boards.js",
	"./lang/zh.js",
	"./lang/en.js",
	"./img/favicon.png",
	"./img/pwa-192.png",
	"./img/pwa-512.png"
];

const PRECACHE_URLS = PRECACHE_PATHS.map((path) => new URL(path, self.location).toString());
const OFFLINE_URL = new URL("./offline.html", self.location).toString();

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) =>
			Promise.all(
				keys.map((key) => {
					if (key === STATIC_CACHE || key === RUNTIME_CACHE) {
						return Promise.resolve();
					}
					return caches.delete(key);
				})
			)
		)
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") {
		return;
	}

	const url = new URL(request.url);

	if (request.mode === "navigate") {
		event.respondWith(handleNavigationRequest(request));
		return;
	}

	if (url.origin === self.location.origin) {
		event.respondWith(handleSameOriginRequest(request));
		return;
	}
});

async function handleNavigationRequest(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse && networkResponse.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cachedResponse = await caches.match(request, { ignoreSearch: true });
		if (cachedResponse) {
			return cachedResponse;
		}
		return caches.match(OFFLINE_URL);
	}
}

async function handleSameOriginRequest(request) {
	if (shouldUseNetworkFirst(request)) {
		return networkFirstSameOrigin(request);
	}

	const cachedResponse = await matchSameOriginCache(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const response = await fetch(request);
		if (response && response.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		return Response.error();
	}
}

function shouldUseNetworkFirst(request) {
	const url = new URL(request.url);
	const destination = String(request.destination || "");
	const pathname = url.pathname || "";

	if (destination === "script" || destination === "style" || destination === "document" || destination === "manifest") {
		return true;
	}

	return (
		pathname.endsWith(".html") ||
		pathname.endsWith(".js") ||
		pathname.endsWith(".css") ||
		pathname.endsWith(".webmanifest")
	);
}

async function matchSameOriginCache(request) {
	const exact = await caches.match(request);
	if (exact) {
		return exact;
	}

	return caches.match(request, { ignoreSearch: true });
}

async function networkFirstSameOrigin(request) {
	try {
		const response = await fetch(request);
		if (response && response.ok) {
			const cache = await caches.open(RUNTIME_CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		const cachedResponse = await matchSameOriginCache(request);
		if (cachedResponse) {
			return cachedResponse;
		}
		return Response.error();
	}
}
