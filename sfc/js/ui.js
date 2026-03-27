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

function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'light';
	document.body.setAttribute('data-theme', savedTheme);

	updateThemeColor(savedTheme);

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

	const closeDock = () => {
		dock.classList.remove('open');
		launcher.setAttribute('aria-expanded', 'false');
		panel.setAttribute('aria-hidden', 'true');
	};

	launcher.addEventListener('click', (e) => {
		e.stopPropagation();
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
		if (!dock.contains(e.target)) {
			closeDock();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeDock();
		}
	});
}

window.addEventListener('DOMContentLoaded', initTheme);
