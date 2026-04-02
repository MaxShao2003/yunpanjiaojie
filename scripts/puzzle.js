// 谜题和游戏状态管理
const Puzzle = {
    // 记录页面访问
    recordVisit: function(pageId) {
        const visits = JSON.parse(localStorage.getItem('visitedPages') || '[]');
        if (!visits.includes(pageId)) {
            visits.push(pageId);
            localStorage.setItem('visitedPages', JSON.stringify(visits));
        }
        
        // 更新进度百分比
        this.updateProgress();
    },
    
    // 检查是否访问过页面
    hasVisited: function(pageId) {
        const visits = JSON.parse(localStorage.getItem('visitedPages') || '[]');
        return visits.includes(pageId);
    },
    
    // 更新进度 - 根据关键节点而非总页面数
    updateProgress: function() {
        let progress = 0;

        // 12% - 初次进入主界面
        if (this.hasVisited('p02')) {
            progress = 12;
        }

        // 28% - 看完公共资料 2-3 页
        const publicPagesVisited = ['p05', 'p06', 'p07', 'p08', 'p09', 'p10'].filter(p => this.hasVisited(p)).length;
        if (publicPagesVisited >= 2) {
            progress = 28;
        }

        // 43% - 解开 /assets
        if (localStorage.getItem('assetsUnlocked') === 'true') {
            progress = 43;
        }

        // 51% - 看完抓痕与排风扇
        if (localStorage.getItem('hasSeenClawPic') === 'true' && localStorage.getItem('hasSeenVentPic') === 'true') {
            progress = 51;
        }

        // 63% - 解开 /private_zy
        if (localStorage.getItem('privateUnlocked') === 'true') {
            progress = 63;
        }

        // 78% - 读完真实规则
        if (localStorage.getItem('hasReadRules') === 'true') {
            progress = 78;
        }

        // 87% - 进入后台
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            progress = 87;
        }

        // 100% - 到达最终抉择页面
        if (this.hasVisited('p35')) {
            progress = 100;
        }

        localStorage.setItem('progress', progress);

        // 更新页面上的进度显示
        const progressElements = document.querySelectorAll('[data-progress]');
        progressElements.forEach(el => {
            el.textContent = '当前交接进度：' + progress + '%';
        });
    },
    
    // 获取当前进度
    getProgress: function() {
        return parseInt(localStorage.getItem('progress') || '0');
    },
    
    // 记录密码
    recordPassword: function(passwordType, answer) {
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        passwords[passwordType] = answer;
        localStorage.setItem('passwords', JSON.stringify(passwords));
    },
    
    // 检查密码
    checkPassword: function(passwordType, input) {
        const passwords = JSON.parse(localStorage.getItem('passwords') || '{}');
        return passwords[passwordType] === input;
    },
    
    // 记录已读线索
    recordClue: function(clueId) {
        const clues = JSON.parse(localStorage.getItem('clues') || '[]');
        if (!clues.includes(clueId)) {
            clues.push(clueId);
            localStorage.setItem('clues', JSON.stringify(clues));
        }
    },
    
    // 检查线索
    hasClue: function(clueId) {
        const clues = JSON.parse(localStorage.getItem('clues') || '[]');
        return clues.includes(clueId);
    },
    
    // 获取所有线索
    getAllClues: function() {
        return JSON.parse(localStorage.getItem('clues') || '[]');
    },
    
    // 记录事件
    recordEvent: function(eventName, data) {
        const events = JSON.parse(localStorage.getItem('gameEvents') || '[]');
        events.push({
            name: eventName,
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem('gameEvents', JSON.stringify(events));
    },
    
    // 重置游戏状态
    reset: function() {
        localStorage.removeItem('visitedPages');
        localStorage.removeItem('progress');
        localStorage.removeItem('passwords');
        localStorage.removeItem('clues');
        localStorage.removeItem('gameEvents');
        localStorage.removeItem('assetsUnlocked');
        localStorage.removeItem('hasSeenWechatLog');
        localStorage.removeItem('isLoggedIn');
    },
    
    // 获取游戏统计
    getStats: function() {
        return {
            progress: this.getProgress(),
            visitedPages: JSON.parse(localStorage.getItem('visitedPages') || '[]').length,
            cluesFound: JSON.parse(localStorage.getItem('clues') || '[]').length,
            assetsUnlocked: localStorage.getItem('assetsUnlocked') === 'true'
        };
    }
};

// 404页异常闪现效果
function initAbnormalText() {
    const abnormalTexts = ['快逃', '别回头', '今晚别去HR办公室', '它在看'];
    const errorCodeElement = document.querySelector('[data-error-code]');
    const originalText = errorCodeElement ? errorCodeElement.textContent : '';
    
    if (errorCodeElement) {
        setInterval(() => {
            if (Math.random() < 0.3) {
                const randomText = abnormalTexts[Math.floor(Math.random() * abnormalTexts.length)];
                errorCodeElement.textContent = randomText;
                errorCodeElement.style.color = '#ff4d4f';
                
                setTimeout(() => {
                    errorCodeElement.textContent = originalText;
                    errorCodeElement.style.color = '';
                }, 300);
            }
        }, 2000);
    }
}

// 页面加载时初始化异常效果
if (window.location.pathname.includes('p03')) {
    document.addEventListener('DOMContentLoaded', initAbnormalText);
}

// 页面卸载时保存草稿
window.addEventListener('beforeunload', function() {
    // 保存用户输入的任何状态
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    inputs.forEach(input => {
        if (input.value) {
            sessionStorage.setItem('input_' + input.id, input.value);
        }
    });
});

// 检查超时并强制跳转
function setupPageTimeout(timeoutMs, redirectPage) {
    setTimeout(() => {
        window.location.href = redirectPage;
    }, timeoutMs);
}
