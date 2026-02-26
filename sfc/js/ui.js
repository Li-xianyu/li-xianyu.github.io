// 主题切换功能
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // 更新图标（必须添加这部分）
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = newTheme === 'dark' 
      ? 'bi bi-sun-fill' 
      : 'bi bi-moon-fill';
  }
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  
  // 使用Bootstrap图标
  const icon = document.createElement('i');
  icon.className = savedTheme === 'dark' 
    ? 'bi bi-sun-fill' 
    : 'bi bi-moon-fill';
  
  // 添加点击事件（你漏掉了这个关键部分）
  toggleBtn.addEventListener('click', toggleTheme);
  
  toggleBtn.appendChild(icon);
  document.body.appendChild(toggleBtn);
}

// 在页面加载时初始化
window.addEventListener('DOMContentLoaded', initTheme);