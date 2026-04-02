// 全局应用管理
const App = {
    // 页面导航
    navigateTo: function(page) {
        window.location.href = page;
    },
    
    // 获取URL参数
    getUrlParam: function(name) {
        const regex = new RegExp('[?&]' + name + '=([^&#]*)', 'i');
        const match = window.location.search.match(regex);
        return match ? decodeURIComponent(match[1]) : '';
    },
    
    // 登录验证
    login: function(account, password) {
        // 简单的测试登录（可替换为真实验证）
        if (account && password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', account);
            return true;
        }
        return false;
    },
    
    // 检查登录状态
    isLoggedIn: function() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },
    
    // 登出
    logout: function() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },
    
    // 获取当前用户
    getCurrentUser: function() {
        return localStorage.getItem('currentUser') || '新员工';
    }
};

// Logo 五连击检测
(function() {
    let clickCount = 0;
    let clickTimer = null;
    let lastClickTime = 0;

    const logos = document.querySelectorAll('[data-version="v1.0"]');

    logos.forEach(logo => {
        logo.style.cursor = 'pointer';

        logo.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            clickCount++;
            lastClickTime = Date.now();

            // 清除计时器
            if (clickTimer) clearTimeout(clickTimer);

            // 3秒内5次点击
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 3000);
            }

            // 视觉反馈：显示点击计数或提示
            if (clickCount > 0 && clickCount < 5) {
                // 轻微的视觉反馈
                logo.style.opacity = '0.7';
                setTimeout(() => {
                    logo.style.opacity = '1';
                }, 100);
            }

            // 触发五连击
            if (clickCount === 5) {
                clickCount = 0;
                clearTimeout(clickTimer);

                // 检查是否已读过日记3并解锁了线索
                const adminUnlocked = localStorage.getItem('adminEntryUnlocked') === 'true';
                const hasReadDiary3 = localStorage.getItem('hasReadDiary3') === 'true';

                if (adminUnlocked || hasReadDiary3) {
                    // 已解锁，跳转到后台登录页
                    localStorage.setItem('logClickedLogo', 'true');
                    window.location.href = 'admin_login.html';
                } else {
                    // 未解锁，显示一个隐秘的提示或跳转到404
                    // 可以稍微提示玩家：也许去多读一些资料？
                    window.location.href = 'not_found.html';
                }
            }
        });
    });
})();

// 初始化应用状态
document.addEventListener('DOMContentLoaded', function() {
    // 在页面加载时检查登录状态
    const currentPath = window.location.pathname;
    
    // 需要登录的页面列表
    const protectedPages = ['p02', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10'];
    
    // 检查是否访问受保护页面但未登录
    let needsLogin = false;
    for (let page of protectedPages) {
        if (currentPath.includes(page) && !App.isLoggedIn()) {
            needsLogin = true;
            break;
        }
    }
    
    if (needsLogin && !currentPath.includes('login')) {
        // 重定向到登录页
        window.location.href = 'login.html';
    }
});
