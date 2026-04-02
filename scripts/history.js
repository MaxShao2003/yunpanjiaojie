// 访问历史管理系统
const VisitHistory = {
    // 存储键
    STORAGE_KEY: 'visitedPages',
    MAX_ITEMS: 12,

    // 注册页面访问
    registerVisit: function(pageInfo) {
        // pageInfo { id, title, href, type }
        const history = this.getHistory();

        // 不记录某些特定页面
        const excludePages = ['index.html', 'index', 'not_found', '404', 'login', 'admin_login'];
        if (excludePages.some(p => pageInfo.id.toLowerCase().includes(p))) {
            return;
        }

        // 去重：如果页面已存在，移除旧记录
        const filteredHistory = history.filter(item => item.id !== pageInfo.id);

        // 确保 href 有有效值
        let href = pageInfo.href;
        if (!href || href === 'undefined') {
            href = this._generateHref();
        }

        // 添加新记录
        const now = new Date();
        const newItem = {
            id: pageInfo.id,
            title: pageInfo.title,
            href: href,
            type: pageInfo.type || 'unknown',
            visitedAt: now.toISOString(),
            displayTime: this.formatTime(now)
        };

        // 新记录放在最前面，保持最多12条
        filteredHistory.unshift(newItem);
        if (filteredHistory.length > this.MAX_ITEMS) {
            filteredHistory.pop();
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredHistory));
    },

    // 生成有效的相对 href
    _generateHref: function() {
        let pathname = window.location.pathname;

        // 移除开头的斜杠
        pathname = pathname.replace(/^\/+/, '');

        // 处理 Windows 路径（移除盘符）
        pathname = pathname.replace(/^[A-Z]:\//i, '');

        // 如果包含 pages/ 目录，提取 pages/ 之后的部分
        if (pathname.includes('pages/')) {
            const idx = pathname.indexOf('pages/');
            pathname = pathname.substring(idx);
        } else if (!pathname.endsWith('.html')) {
            // 如果没有 .html 扩展名，尝试从文件名推断
            const filename = pathname.split('/').pop();
            if (filename && filename.length > 0) {
                pathname = 'pages/' + filename;
            }
        }

        // 确保不是空值
        if (!pathname) {
            pathname = 'pages/unknown.html';
        }

        return pathname;
    },

    // 获取完整历史
    getHistory: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // 格式化时间显示
    formatTime: function(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        // 显示完整日期
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day} ${hour}:${minute}`;
    },

    // 清空历史
    clearHistory: function() {
        localStorage.removeItem(this.STORAGE_KEY);
    },

    // 获取显示用的HTML
    renderHistory: function() {
        const history = this.getHistory();

        if (history.length === 0) {
            return `<div class="visit-history-empty">
                <p>你还没有打开任何交接资料。访问记录会显示在这里。</p>
            </div>`;
        }

        const itemsHtml = history.map(item => {
            const icon = this.getTypeIcon(item.type);
            // 确保 href 不是 undefined
            const href = (item.href && item.href !== 'undefined') ? item.href : '#';
            return `
                <div class="visit-history-item">
                    <span class="visit-icon">${icon}</span>
                    <div class="visit-info">
                        <div class="visit-title"><a href="${href}" target="_blank">${item.title}</a></div>
                        <div class="visit-meta">${item.displayTime}</div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="visit-history-list">
                ${itemsHtml}
            </div>
            <div class="visit-history-footer">
                <button class="visit-clear-btn" onclick="VisitHistory.clearHistory(); location.reload();">清空记录</button>
            </div>
        `;
    },

    // 根据页面类型返回对应图标
    getTypeIcon: function(type) {
        const iconMap = {
            'folder': '📁',
            'txt': '📄',
            'xlsx': '📊',
            'pdf': '📋',
            'jpg': '🖼️',
            'mp4': '🎬',
            'system': '⚙️',
            'admin': '🔐',
            'diary': '📔',
            'audio': '🎤',
            'link': '🔗',
            'unknown': '📌'
        };
        return iconMap[type] || '📌';
    },

    // 自动在页面加载时注册（如果页面提供了必要信息）
    autoRegister: function() {
        // 检查是否是 index.html，如果是则不记录
        const pathname = window.location.pathname.toLowerCase();
        if (pathname.includes('index.html') || pathname.endsWith('/') || pathname === '') {
            return;  // 不记录首页
        }

        const pageId = document.body.dataset.pageId;
        const pageTitle = document.body.dataset.pageTitle;
        const pageType = document.body.dataset.pageType || 'unknown';

        // 如果页面标记了属性，直接使用
        if (pageId && pageTitle) {
            this.registerVisit({
                id: pageId,
                title: pageTitle,
                href: this._generateHref(),
                type: pageType
            });
            return;
        }

        // 否则，智能提取标题和类型
        // 尝试从 document.title 中提取
        let title = document.title
            .replace(/[\[\(].*?[\]\)]/g, '') // 移除括号内容
            .replace(/[\|─·-].*$/g, '') // 移除分隔符后的内容
            .trim();

        if (!title || title.length === 0) {
            return; // 无法确定标题，不注册
        }

        // 智能推断页面类型
        const url = window.location.pathname.toLowerCase();
        let type = 'unknown';

        if (url.includes('home') || url.includes('index')) type = 'system';
        else if (url.includes('admin') || url.includes('dashboard') || url.includes('camera') || url.includes('roster')) type = 'admin';
        else if (url.includes('folder')) type = 'folder';
        else if (url.includes('.txt') || url.includes('diary') || url.includes('note')) type = 'txt';
        else if (url.includes('.xlsx') || url.includes('sheet') || url.includes('directory') || url.includes('attendance')) type = 'xlsx';
        else if (url.includes('.pdf') || url.includes('handbook') || url.includes('notice') || url.includes('rules')) type = 'pdf';
        else if (url.includes('.jpg') || url.includes('pic') || url.includes('weibo')) type = 'jpg';
        else if (url.includes('.mp4') || url.includes('video') || url.includes('audio')) type = 'mp4';
        else if (url.includes('diary')) type = 'diary';
        else if (url.includes('script') || url.includes('message') || url.includes('choice')) type = 'txt';

        // 提取文件名作为 ID
        let pageId_auto = url
            .split('/')
            .pop()
            .replace('.html', '')
            .replace(/[^a-z0-9_-]/gi, '_');

        this.registerVisit({
            id: pageId_auto,
            title: title,
            href: this._generateHref(),
            type: type
        });
    }
};

// 页面加载时自动注册（如果页面有标记）
document.addEventListener('DOMContentLoaded', function() {
    VisitHistory.autoRegister();
});
