// 搜索引擎 - 隐藏页面发现系统
const Search = {
    // 搜索索引 - 定义所有可搜索的资源
    index: [
        // 普通结果（总是可见）
        {
            id: 'public_folder',
            title: '公共文件夹 /public',
            href: 'public_folder.html',
            type: '文件夹',
            summary: '5 个文件，包含公司公开资料',
            keywords: ['公共', '文件夹', 'public'],
            isHidden: false
        },
        {
            id: 'projects_folder',
            title: '交接项目 /projects',
            href: 'projects_folder.html',
            type: '文件夹',
            summary: '5 个文件 + 1 个加密文件夹',
            keywords: ['项目', '文件夹', 'projects'],
            isHidden: false
        },
        {
            id: 'about_us',
            title: '关于鼎铭',
            href: 'about_us.html',
            type: '企业介绍',
            summary: '公司文化与发展历程',
            keywords: ['关于', '鼎铭', '企业', '介绍'],
            isHidden: false
        },
        {
            id: 'welcome_note',
            title: '新员工欢迎信',
            href: 'welcome_note.html',
            type: '文本',
            summary: '来自行政部的入职指南',
            keywords: ['欢迎', '新员工', '指南'],
            isHidden: false
        },
        {
            id: 'directory',
            title: '部门通讯录.xlsx',
            href: 'directory.html',
            type: '电子表格',
            summary: '员工信息与联系方式',
            keywords: ['通讯录', '部门', '员工', '工号', '赵宇'],
            isHidden: false
        },
        {
            id: 'holiday_notice',
            title: '假期申请制度.pdf',
            href: 'holiday_notice.html',
            type: '制度文件',
            summary: '请假流程与假期规定',
            keywords: ['假期', '申请', '制度'],
            isHidden: false
        },
        {
            id: 'attendance_sheet',
            title: '考勤统计汇总',
            href: 'attendance_sheet.html',
            type: '报表',
            summary: '本月员工考勤情况',
            keywords: ['考勤', '统计', '出勤'],
            isHidden: false
        },
        {
            id: 'employee_handbook',
            title: '员工手册（明文版）.pdf',
            href: 'employee_handbook.html',
            type: '制度文件',
            summary: '公开版企业规章制度',
            keywords: ['员工', '手册', '制度'],
            isHidden: false
        },
        {
            id: 'script_doc',
            title: '项目脚本文档',
            href: 'script_doc.html',
            type: '文本',
            summary: '当前交接项目的脚本资料',
            keywords: ['脚本', '项目', '文档'],
            isHidden: false
        },
        {
            id: 'reimbursement_sheet',
            title: '03月报销清单.xlsx',
            href: 'reimbursement_sheet.html',
            type: '电子表格',
            summary: '本月各项报销记录',
            keywords: ['报销', '清单', '费用'],
            isHidden: false
        },
        {
            id: 'interview_video',
            title: '入职面试视频',
            href: 'interview_video.html',
            type: '视频',
            summary: '你的初面视频备份',
            keywords: ['面试', '视频', '入职'],
            isHidden: false
        },
        {
            id: 'hidden_pic_claw',
            title: '开裂抓痕_办公区局部.jpg',
            href: 'hidden_pic_claw.html',
            type: '图片',
            summary: '办公区域照片',
            keywords: ['照片', '办公区', '抓痕'],
            isHidden: false
        },
        {
            id: 'hidden_pic_vent',
            title: '排风扇_声音传来处.jpg',
            href: 'hidden_pic_vent.html',
            type: '图片',
            summary: '办公区域照片',
            keywords: ['照片', '排风扇', '通风'],
            isHidden: false
        },

        // 隐藏页面 - 仅通过搜索和条件限制发现
        {
            id: 'wechat_log',
            title: '沟通记录_03.jpg',
            href: 'wechat_log.html',
            type: '聊天记录',
            summary: '赵宇与同事的微信对话备份',
            keywords: ['赵宇', '离职员工', '个人账号'],
            isHidden: true,
            conditions: [
                'viewedProjectsFolder&&viewedAssetsLock'
            ]
        },
        {
            id: 'diary_01',
            title: '人事跟进备忘_0512.txt',
            href: 'diary_01.html',
            type: '备忘录',
            summary: '赵宇的个人笔记',
            keywords: ['李姐'],
            isHidden: true,
            conditions: [
                'viewedWelcomeNote||viewedDirectory'
            ]
        },
        {
            id: 'fake_weibo',
            title: '赵宇_公开账号缓存',
            href: 'fake_weibo.html',
            type: '社交媒体备份',
            summary: '离职员工的微博内容缓存',
            keywords: ['DM-8975'],
            isHidden: true,
            conditions: [
                'viewedDirectory&&readDiary1'
            ]
        },
        {
            id: 'diary_02',
            title: '同步失败缓存_0314.txt',
            href: 'diary_02.html',
            type: '缓存备份',
            summary: '赵宇的个人日记片段',
            keywords: ['黑豆'],
            isHidden: true,
            conditions: [
                'viewedFakeWeibo'
            ]
        },
        {
            id: 'true_rules',
            title: '夜间清理流程_内部节选.pdf',
            href: 'true_rules.html',
            type: '内部制度',
            summary: '系统运营相关的真实规则',
            keywords: ['夜间清理', '清理流程', '夜班处理'],
            isHidden: true,
            conditions: [
                'viewedEmployeeHandbook&&readDiary3'
            ]
        },
        {
            id: 'audio_log',
            title: '13F隔音材料测试记录.wav',
            href: 'audio_log.html',
            type: '音频文件',
            summary: '恢复的音频片段与字幕',
            keywords: ['隔音海绵'],
            isHidden: true,
            conditions: [
                'viewedReimbursementSheet&&readDiary2&&viewedTrueRules'
            ]
        },
        {
            id: 'corrupted_998',
            title: '恢复失败缓存_998.tmp',
            href: 'corrupted_998.html',
            type: '损坏缓存',
            summary: '损坏文件的部分恢复内容',
            keywords: ['998', '覆写'],
            isHidden: true,
            conditions: [
                'playedAudioLog'
            ]
        }
    ],

    // 检查条件是否满足
    checkConditions: function(conditionStr) {
        if (!conditionStr) return true;

        // 支持 || 和 && 操作符
        if (conditionStr.includes('||')) {
            return conditionStr.split('||').some(cond =>
                localStorage.getItem(cond.trim()) === 'true'
            );
        }

        if (conditionStr.includes('&&')) {
            return conditionStr.split('&&').every(cond =>
                localStorage.getItem(cond.trim()) === 'true'
            );
        }

        // 单一条件
        return localStorage.getItem(conditionStr.trim()) === 'true';
    },

    // 检查是否可以显示搜索结果
    canRevealResult: function(item) {
        if (!item.isHidden) return true;

        // 隐藏项需要满足所有条件
        if (item.conditions && item.conditions.length > 0) {
            return item.conditions.every(cond =>
                this.checkConditions(cond)
            );
        }

        return true;
    },

    // 规范化查询字符串
    normalizeQuery: function(query) {
        return query.toLowerCase().trim();
    },

    // 执行搜索
    search: function(query) {
        const normalQuery = this.normalizeQuery(query);

        if (!normalQuery) {
            return [];
        }

        const results = [];

        this.index.forEach(item => {
            // 检查条件
            if (!this.canRevealResult(item)) {
                return; // 不满足条件，跳过
            }

            // 关键词匹配
            const matches = item.keywords.some(keyword =>
                this.normalizeQuery(keyword).includes(normalQuery) ||
                normalQuery.includes(this.normalizeQuery(keyword))
            );

            // 对于隐藏页面，只进行关键词匹配
            if (item.isHidden) {
                if (matches) {
                    results.push({
                        ...item,
                        relevance: 2
                    });
                }
                return;
            }

            // 对于普通页面，支持标题和类型匹配
            const titleMatch = this.normalizeQuery(item.title).includes(normalQuery);
            const typeMatch = this.normalizeQuery(item.type).includes(normalQuery);

            if (matches || titleMatch || typeMatch) {
                results.push({
                    ...item,
                    relevance: titleMatch ? 3 : (matches ? 2 : 1)
                });
            }
        });

        // 按相关度降序排列
        results.sort((a, b) => b.relevance - a.relevance);

        return results;
    },

    // 记录页面访问状态
    markPageVisited: function(pageKey) {
        localStorage.setItem(pageKey, 'true');
    },

    // 记录完整阅读状态（用于日记）
    markPageRead: function(pageKey) {
        localStorage.setItem(pageKey, 'true');
    },

    // 记录音频播放（用于audio_log）
    markAudioPlayed: function() {
        localStorage.setItem('playedAudioLog', 'true');
    },

    // 渲染搜索结果
    renderResults: function(results, containerId) {
        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--gray-light); font-size: 14px;">未找到匹配资料</div>';
            return;
        }

        const resultList = document.createElement('div');
        resultList.className = 'search-results';

        results.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'search-result-item';
            itemEl.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s;';
            itemEl.onmouseover = () => itemEl.style.background = 'var(--light-blue)';
            itemEl.onmouseout = () => itemEl.style.background = 'transparent';
            itemEl.onclick = () => window.location.href = item.href;

            itemEl.innerHTML = `
                <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="font-size: 24px; flex-shrink: 0;">
                        ${this.getFileIcon(item.type)}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; color: var(--gray-dark); margin-bottom: 4px; word-break: break-word;">
                            ${item.title}
                        </div>
                        <div style="font-size: 13px; color: var(--gray-light); margin-bottom: 4px;">
                            ${item.type}
                        </div>
                        <div style="font-size: 13px; color: var(--gray-light);">
                            ${item.summary}
                        </div>
                    </div>
                </div>
            `;

            resultList.appendChild(itemEl);
        });

        container.appendChild(resultList);
    },

    // 获取文件类型对应的图标
    getFileIcon: function(type) {
        const icons = {
            '文件夹': '📁',
            '企业介绍': '🏢',
            '文本': '📝',
            '电子表格': '📊',
            '制度文件': '📋',
            '报表': '📈',
            '视频': '🎬',
            '图片': '🖼️',
            '聊天记录': '💬',
            '备忘录': '✏️',
            '社交媒体备份': '👤',
            '缓存备份': '💾',
            '内部制度': '⚠️',
            '音频文件': '🔊',
            '损坏缓存': '⚔️'
        };
        return icons[type] || '📄';
    }
};
