// 主题切换功能
function toggleTheme() {
	const body = document.body;
	const currentTheme = body.getAttribute('data-theme');
	const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

	body.setAttribute('data-theme', newTheme);
	localStorage.setItem('theme', newTheme);

	updateThemeColor(newTheme);

	const icon = document.querySelector('.theme-toggle i');
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

	// 确保 data-theme 已经切过去后再读取变量
	// 这里用根元素取变量，因为变量定义在 :root 和 [data-theme="dark"]
	const color = getComputedStyle(document.documentElement)
		.getPropertyValue('--bg-color')
		.trim();

	meta.setAttribute('content', color || (theme === 'dark' ? '#1a103d' : '#f8f4ff'));
}

// 初始化
function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'light';
	document.body.setAttribute('data-theme', savedTheme);

	// 初始化时同步浏览器顶部控制栏颜色
	updateThemeColor(savedTheme);

	const toggleBtn = document.createElement('button');
	toggleBtn.className = 'theme-toggle';


	const icon = document.createElement('i');
	icon.className = savedTheme === 'dark'
		? 'bi bi-sun-fill'
		: 'bi bi-moon-fill';

	toggleBtn.addEventListener('click', toggleTheme);

	toggleBtn.appendChild(icon);
	document.body.appendChild(toggleBtn);
}

// 在页面加载时初始化
window.addEventListener('DOMContentLoaded', initTheme);