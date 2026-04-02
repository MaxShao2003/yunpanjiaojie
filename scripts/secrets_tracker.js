// 隐藏线索追踪系统 - 用于渐进式解锁后台信息
const SecretsTracker = {
    // 记录发现的线索
    recordDiscovery: function(secretId) {
        const discoveries = JSON.parse(localStorage.getItem('secretDiscoveries') || '{}');
        discoveries[secretId] = {
            timestamp: new Date().toISOString(),
            unlocked: true
        };
        localStorage.setItem('secretDiscoveries', JSON.stringify(discoveries));
        this.updateUnlockProgress();
    },

    // 检查是否发现过线索
    hasDiscovered: function(secretId) {
        const discoveries = JSON.parse(localStorage.getItem('secretDiscoveries') || '{}');
        return discoveries[secretId]?.unlocked === true;
    },

    // 获取所有已发现的线索
    getDiscoveries: function() {
        return Object.keys(JSON.parse(localStorage.getItem('secretDiscoveries') || '{}'));
    },

    // 更新解锁进度
    updateUnlockProgress: function() {
        const discoveries = this.getDiscoveries();
        const requiredHints = ['diary3_warning', 'diary3_interact', 'logo_hint', 'admin_username'];

        // 检查是否有足够的线索来进入后台
        const isReadyForAdmin = discovery => {
            const logoHint = this.hasDiscovered('logo_hint');
            const adminUsername = this.hasDiscovered('admin_username');
            const diary3Read = localStorage.getItem('diary3FullyRead') === 'true';

            return diary3Read && logoHint && adminUsername;
        };

        if (isReadyForAdmin()) {
            localStorage.setItem('adminEntryUnlocked', 'true');
        }
    },

    // 获取提示（用于逐步显示）
    getHints: function(targetSecret) {
        const hints = {
            'logo_hint': {
                level1: '这个Logo似乎有特殊用途...',
                level2: '反复点击可能会有不同...',
                level3: '一个特殊的数字可能关键'
            },
            'admin_username': {
                level1: '系统管理员通常用simple的名字',
                level2: '简单、常见的...通常只有一个单词',
                level3: ''
            },
            'override_code': {
                level1: '这个代码可能在某处...',
                level2: '在文档的深处，或者...',
                level3: ''
            }
        };
        return hints[targetSecret] || {};
    },

    // 重置所有线索
    reset: function() {
        localStorage.removeItem('secretDiscoveries');
        localStorage.removeItem('diary3FullyRead');
        localStorage.removeItem('adminEntryUnlocked');
    }
};
