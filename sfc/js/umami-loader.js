(function () {
	"use strict";

	if (window.__umamiLoaderInitialized__) {
		return;
	}
	window.__umamiLoaderInitialized__ = true;

	var DEFAULT_WEBSITE_ID = "6ec19ab0-90c0-423c-86f5-f88666777765";
	var PAGES_DEV_WEBSITE_ID = "386fc931-df4c-419d-88fe-283917f7e99d";
	var PAGES_DEV_ORIGIN = "https://xianyusfc.pages.dev";
	var websiteId = window.location.origin === PAGES_DEV_ORIGIN
		? PAGES_DEV_WEBSITE_ID
		: DEFAULT_WEBSITE_ID;

	if (!websiteId || document.querySelector('script[src="https://cloud.umami.is/script.js"]')) {
		return;
	}

	var script = document.createElement("script");
	script.defer = true;
	script.src = "https://cloud.umami.is/script.js";
	script.setAttribute("data-website-id", websiteId);
	script.setAttribute("data-umami-loader", "1");

	(document.head || document.documentElement).appendChild(script);
})();
