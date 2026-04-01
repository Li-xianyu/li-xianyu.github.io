function toggleTheme() {
	const body = document.body;
	const currentTheme = body.getAttribute('data-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

	body.setAttribute('data-theme', newTheme);
	localStorage.setItem('theme', newTheme);

	updateThemeColor(newTheme);

	const icon = document.querySelector('.quick-action-theme i');
	if (icon) {
		icon.className = newTheme === 'dark'
			? 'bi bi-sun-fill'
			: 'bi bi-moon-fill';
	}
}


function updateThemeColor(theme) {
	let meta = document.querySelector('meta[name="theme-color"]');
	if (!meta) {
		meta = document.createElement('meta');
		meta.setAttribute('name', 'theme-color');
		document.head.appendChild(meta);
	}

	// Read the CSS variable after the theme attribute is updated.
	const color = getComputedStyle(document.documentElement)
		.getPropertyValue('--bg-color')
		.trim();

	meta.setAttribute('content', color || (theme === 'dark' ? '#1a103d' : '#f8f4ff'));
}

function playDialogShake(element) {
	if (!element || typeof element.animate !== 'function') return;

	if (element._dialogShakeAnimation) {
		element._dialogShakeAnimation.cancel();
	}

	const animation = element.animate(
		[
			{ transform: 'translateX(0)' },
			{ transform: 'translateX(-5px)' },
			{ transform: 'translateX(5px)' },
			{ transform: 'translateX(-5px)' },
			{ transform: 'translateX(5px)' },
			{ transform: 'translateX(0)' }
		],
		{
			duration: 500,
			easing: 'ease'
		}
	);

	element._dialogShakeAnimation = animation;
	animation.addEventListener('finish', () => {
		if (element._dialogShakeAnimation === animation) {
			element._dialogShakeAnimation = null;
		}
	});
	animation.addEventListener('cancel', () => {
		if (element._dialogShakeAnimation === animation) {
			element._dialogShakeAnimation = null;
		}
	});
}

window.playDialogShake = playDialogShake;

function getViewportDialogHeightBudget(overlay) {
	if (!overlay) return window.innerHeight || document.documentElement.clientHeight || 0;

	const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
	const overlayStyles = window.getComputedStyle(overlay);
	const paddingTop = parseFloat(overlayStyles.paddingTop || "0") || 0;
	const paddingBottom = parseFloat(overlayStyles.paddingBottom || "0") || 0;

	return Math.max(260, viewportHeight - paddingTop - paddingBottom);
}

function clearFixedDialogHeight(dialog) {
	if (!dialog) return;
	dialog.classList.remove("is-tabbed-dialog-sized");
	dialog.style.removeProperty("--tabbed-dialog-fixed-height");
	dialog.style.removeProperty("--tabbed-dialog-max-height");
}

function applyFixedDialogHeight(dialog, overlay, naturalHeight) {
	if (!dialog) return 0;

	const safeNaturalHeight = Math.max(0, Number(naturalHeight) || 0);
	if (!safeNaturalHeight) {
		clearFixedDialogHeight(dialog);
		return 0;
	}

	const viewportBudget = getViewportDialogHeightBudget(overlay);
	const fixedHeight = Math.min(safeNaturalHeight, viewportBudget);
	const roundedHeight = Math.round(fixedHeight);
	const roundedBudget = Math.round(viewportBudget);

	dialog.style.setProperty("--tabbed-dialog-fixed-height", `${roundedHeight}px`);
	dialog.style.setProperty("--tabbed-dialog-max-height", `${roundedBudget}px`);
	dialog.classList.add("is-tabbed-dialog-sized");
	return roundedHeight;
}

window.getViewportDialogHeightBudget = getViewportDialogHeightBudget;
window.clearFixedDialogHeight = clearFixedDialogHeight;
window.applyFixedDialogHeight = applyFixedDialogHeight;

function trackEvent(eventName, payload) {
	if (!eventName || !window.umami || typeof window.umami.track !== 'function') return;
	try {
		if (payload && typeof payload === 'object') {
			window.umami.track(eventName, payload);
			return;
		}
		window.umami.track(eventName);
	} catch (err) {
		console.warn('[Analytics] track failed:', eventName, err);
	}
}

window.trackEvent = trackEvent;

function shouldDisableQuickDock() {
	try {
		const params = new URLSearchParams(window.location.search);
		return params.get('embed') === '1';
	} catch (error) {
		return false;
	}
}

function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'light';
	document.body.setAttribute('data-theme', savedTheme);

	updateThemeColor(savedTheme);

	if (shouldDisableQuickDock()) {
		return;
	}

	const dock = document.createElement('div');
	dock.className = 'quick-dock';

	const launcher = document.createElement('button');
	launcher.type = 'button';
	launcher.className = 'quick-dock-launcher';
	launcher.setAttribute('aria-expanded', 'false');
	launcher.innerHTML = '<i class="bi bi-grid-fill" aria-hidden="true"></i>';

	const panel = document.createElement('div');
	panel.className = 'quick-dock-panel';
	panel.setAttribute('aria-hidden', 'true');

	const themeBtn = document.createElement('button');
	themeBtn.type = 'button';
	themeBtn.className = 'quick-action-btn quick-action-theme';
	themeBtn.innerHTML = `<i class="${savedTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill'}" aria-hidden="true"></i>`;
	themeBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		toggleTheme();
	});

	const settingBtn = document.createElement('button');
	settingBtn.type = 'button';
	settingBtn.className = 'quick-action-btn quick-action-setting';
	settingBtn.innerHTML = '<i class="bi bi-sliders" aria-hidden="true"></i>';
	settingBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (typeof window.openEmbeddedSettings === 'function') {
			window.openEmbeddedSettings();
			return;
		}
		window.location.href = 'setting.html';
	});

	const languageBtn = document.createElement('button');
	languageBtn.type = 'button';
	languageBtn.className = 'quick-action-btn quick-action-language';
	languageBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		if (typeof window.toggleLanguage === 'function') {
			window.toggleLanguage();
		}
	});

	function syncQuickDockI18n() {
		launcher.setAttribute('aria-label', t('common.quickDock.open'));
		themeBtn.setAttribute('aria-label', t('common.quickDock.theme'));
		settingBtn.setAttribute('aria-label', t('common.quickDock.settings'));
		languageBtn.setAttribute('aria-label', t('common.quickDock.language'));
		languageBtn.title = t(`common.language.switchTo.${window.getLanguage() === 'en' ? 'zh' : 'en'}`);
		languageBtn.textContent = t(`common.language.short.${window.getLanguage()}`);
	}

	panel.append(themeBtn, settingBtn, languageBtn);
	dock.append(launcher, panel);
	document.body.appendChild(dock);
	syncQuickDockI18n();

	const desktopDockMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
	let autoExpanded = false;
	let layoutFrame = 0;

	const closeDock = () => {
		if (autoExpanded) {
			dock.classList.add('open');
			launcher.setAttribute('aria-expanded', 'true');
			panel.setAttribute('aria-hidden', 'false');
			return;
		}
		dock.classList.remove('open');
		launcher.setAttribute('aria-expanded', 'false');
		panel.setAttribute('aria-hidden', 'true');
	};

	const getVisibleDockButtons = () => {
		return Array.from(panel.querySelectorAll('.quick-action-btn')).filter((btn) => !btn.hidden);
	};

	const getAutoDockRect = () => {
		const buttons = getVisibleDockButtons();
		if (!buttons.length) return null;

		const gap = parseFloat(getComputedStyle(panel).gap || '8') || 8;
		const autoPad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--quick-dock-auto-pad') || '6') || 6;
		const buttonWidths = buttons.reduce((sum, btn) => sum + btn.getBoundingClientRect().width, 0);
		const buttonHeights = buttons.map((btn) => btn.getBoundingClientRect().height);
		const width = buttonWidths + (Math.max(buttons.length - 1, 0) * gap) + (autoPad * 2);
		const height = (buttonHeights.length ? Math.max(...buttonHeights) : 40) + (autoPad * 2);
		const top = 16;
		const right = window.innerWidth - 16;
		return {
			top,
			right,
			bottom: top + height,
			left: right - width
		};
	};

	const rectsOverlap = (a, b, padding = 0) => {
		return !(
			(a.right + padding) <= b.left ||
			(a.left - padding) >= b.right ||
			(a.bottom + padding) <= b.top ||
			(a.top - padding) >= b.bottom
		);
	};

	const getProtectedRects = () => {
		const selectors = [
			'.top-bar .nav-btn-right',
			'.topbar-right',
			'#installSpotlight'
		];

		return selectors
			.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
			.filter((element) => {
				if (!element || element.hidden) return false;
				const rect = element.getBoundingClientRect();
				return rect.width > 0 && rect.height > 0 && rect.top < 140;
			})
			.map((element) => element.getBoundingClientRect());
	};

	const shouldAutoExpandDock = () => {
		if (!desktopDockMedia.matches) return false;
		if (window.innerWidth < 820) return false;

		const dockRect = getAutoDockRect();
		if (!dockRect) return false;
		if (dockRect.left < 24) return false;

		return !getProtectedRects().some((rect) => rectsOverlap(dockRect, rect, 10));
	};

	const applyDockLayout = (force = false) => {
		const nextAutoExpanded = shouldAutoExpandDock();
		if (!force && nextAutoExpanded === autoExpanded) return;

		autoExpanded = nextAutoExpanded;
		dock.classList.toggle('is-auto-expanded', autoExpanded);

		if (autoExpanded) {
			dock.classList.add('open');
			launcher.setAttribute('aria-expanded', 'true');
			panel.setAttribute('aria-hidden', 'false');
			return;
		}

		closeDock();
	};

	const scheduleDockLayoutSync = (force = false) => {
		if (layoutFrame) {
			cancelAnimationFrame(layoutFrame);
		}

		layoutFrame = requestAnimationFrame(() => {
			layoutFrame = 0;
			applyDockLayout(force);
		});
	};

	window.syncQuickDockLayout = scheduleDockLayoutSync;

	launcher.addEventListener('click', (e) => {
		e.stopPropagation();
		if (autoExpanded) return;
		const willOpen = !dock.classList.contains('open');
		if (willOpen) {
			dock.classList.add('open');
			launcher.setAttribute('aria-expanded', 'true');
			panel.setAttribute('aria-hidden', 'false');
		} else {
			closeDock();
		}
	});

	document.addEventListener('click', (e) => {
		if (autoExpanded) return;
		if (!dock.contains(e.target)) {
			closeDock();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (autoExpanded) return;
		if (e.key === 'Escape') {
			closeDock();
		}
	});

	if (typeof desktopDockMedia.addEventListener === 'function') {
		desktopDockMedia.addEventListener('change', () => scheduleDockLayoutSync(true));
	} else if (typeof desktopDockMedia.addListener === 'function') {
		desktopDockMedia.addListener(() => scheduleDockLayoutSync(true));
	}
	window.addEventListener('resize', () => scheduleDockLayoutSync(false));
	window.addEventListener('pwa:statechange', () => scheduleDockLayoutSync(true));
	requestAnimationFrame(() => scheduleDockLayoutSync(true));
}

window.addEventListener('DOMContentLoaded', initTheme);
