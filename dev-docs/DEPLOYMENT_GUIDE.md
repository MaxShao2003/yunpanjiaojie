# 《交接云盘》ARG游戏 - 部署与安全指南

## 📦 部署文件结构

### 生产环境（需部署到公网）
```
/deploy/
├── index.html                    (主入口)
├── pages/                        (所有游戏页面)
│   ├── login.html
│   ├── admin_dashboard.html
│   └── ... (共40个HTML页面)
├── styles/                       (样式文件)
│   ├── main.css
│   ├── admin.css
│   ├── theme.css
│   └── components.css
├── scripts/                      (脚本文件 - 需混淆)
│   ├── app.js
│   ├── puzzle.js
│   ├── search.js
│   └── history.js
├── media/                        (图片资源)
│   ├── *.png
│   ├── *.jpg
│   └── *.mp4
├── audio/                        (音频资源)
│   └── *.mp3
└── .htaccess                     (可选：Apache配置)
```

### 开发档案（分离保存）
```
/source_archive/
├── 📄 README.md
├── 📄 GAMEPLAY_GUIDE.md          (游戏攻略)
├── 📄 QA_CHECKLIST.md            (测试清单)
├── 📄 PROJECT_COMPLETION_REPORT.md
├── 📄 【完整攻略+测试手册】.md
├── 📄 【项目审核报告】*.md
├── /prompts/                     (Cursor提示词)
│   └── camera_pantry_prompt.txt
├── /memory/                      (开发笔记)
└── PROJECT_STRUCTURE.txt

📌 用途：个人存档，不发布
```

---

## 🛡️ 防范玩家查看源代码

### 方案1：代码混淆 + 压缩（推荐）

#### 工具选择
```bash
# 安装 terser (JavaScript 混淆)
npm install -g terser uglify-js

# 安装 cleancss (CSS 压缩)
npm install -g clean-css-cli

# 安装 html-minifier (HTML 压缩)
npm install -g html-minifier
```

#### 混淆脚本
创建 `build.sh` 自动化混淆：
```bash
#!/bin/bash

# 混淆 JavaScript
terser scripts/app.js -o scripts/app.min.js -c -m
terser scripts/puzzle.js -o scripts/puzzle.min.js -c -m
terser scripts/search.js -o scripts/search.min.js -c -m

# 压缩 CSS
cleancss -o styles/main.min.css styles/main.css
cleancss -o styles/admin.min.css styles/admin.css

# 在 HTML 中引用 .min.js 和 .min.css
```

**效果**：代码变成不可读的混淆版本
```javascript
// 原始代码
function recordPassword(category, password) {
  let passwords = JSON.parse(localStorage.getItem('passwords')) || {};
  passwords[category] = password;
  localStorage.setItem('passwords', JSON.stringify(passwords));
}

// 混淆后
function e(t,a){let s=JSON.parse(localStorage.getItem("passwords"))||{};s[t]=a,localStorage.setItem("passwords",JSON.stringify(s))}
```

---

### 方案2：将敏感逻辑移至后端

#### 核心逻辑转移清单
```javascript
// ❌ 不要在前端验证
if (password === 'buxiangganle') {  // 可直接看源代码
  unlockedAssets = true;
}

// ✅ 应该请求后端验证
fetch('/api/verify-password', {
  method: 'POST',
  body: JSON.stringify({ password })
})
.then(r => r.json())
.then(d => {
  if (d.correct) unlockedAssets = true;
});
```

#### 需转移到后端的内容
1. **密码验证** (assets, private, admin)
2. **进度解锁逻辑** (P30 10秒延迟, P32 60秒触发)
3. **Logo五连击检测**
4. **最终结局判定**

#### Python/Node.js 后端示例
```python
# Flask 示例
@app.route('/api/verify-password', methods=['POST'])
def verify_password():
    data = request.json
    password = data.get('password')

    # 密码字典（服务器端）
    correct_passwords = {
        'assets': 'buxiangganle',
        'private': 'DM-8975heidou',
        'admin': 'OVERRIDE_998'
    }

    # 验证是否正确
    for key, correct_pwd in correct_passwords.items():
        if password == correct_pwd:
            session[f'{key}_unlocked'] = True
            return {'correct': True, 'type': key}

    return {'correct': False}
```

---

### 方案3：资源加密 + 动态解密

#### 加密敏感数据
```javascript
// 存储的是加密数据，而非明文
const ENCRYPTED_ASSETS = {
  key: 'assets_key_v1',
  data: 'aGVsbG8gd29ybGQ='  // Base64 编码
};

// 运行时解密
function decryptAsset(encrypted) {
  // 使用简单的 XOR 或 AES 解密
  return atob(encrypted.data);  // 仅示例，需更强加密
}
```

**更安全的方案**：使用 crypto-js
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>

<script>
const SECRET_KEY = 'your-secret-key-v1';
const ENCRYPTED = CryptoJS.AES.encrypt('敏感数据', SECRET_KEY).toString();

// 运行时解密
const decrypted = CryptoJS.AES.decrypt(ENCRYPTED, SECRET_KEY).toString(CryptoJS.enc.Utf8);
</script>
```

---

### 方案4：检测开发者工具（作为额外层）

```javascript
// 检测浏览器开发者工具
function detectDevTools() {
  let devTools = { open: false };
  const threshold = 160;

  setInterval(() => {
    if (window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold) {
      devTools.open = true;

      // 检测到开发者工具
      console.warn('⚠️ 游戏检测到调试工具打开');
      disableGame();  // 禁用游戏或显示警告
    }
  }, 500);
}

function disableGame() {
  // 方案1：冻结界面
  document.body.style.pointerEvents = 'none';

  // 方案2：清除localStorage（重置进度）
  // localStorage.clear();

  // 方案3：显示警告
  alert('游戏检测到不规范操作，游戏已重置。');
}

detectDevTools();
```

---

### 方案5：HTTP安全头牙（Nginx/Apache）

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name yourgame.com;

    # 禁用缓存，防止查看本地文件
    add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";
    add_header Pragma "no-cache";
    add_header Expires "0";

    # 内容安全策略（防XSS）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'";

    # 防点击劫持
    add_header X-Frame-Options "DENY";

    # 类型狙击
    add_header X-Content-Type-Options "nosniff";

    # 隐藏服务器应该
    server_tokens off;

    location / {
        root /var/www/yourgame;
        try_files $uri $uri/ /index.html;
    }
}
```

#### .htaccess 配置（Apache）
```apache
# 禁用目录浏览
Options -Indexes

# 禁用缓存
<FilesMatch "\.(html|htm|xml|txt|xsl)$">
  Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
</FilesMatch>
```

---

### 方案6：ServiceWorker 二次防护

```javascript
// service-worker.js
self.addEventListener('install', () => {
  console.log('Game ServiceWorker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'game-v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 不缓存 HTML，强制每次重新加载
  if (event.request.url.endsWith('.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 缓存其他资源
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

在 index.html 中注册：
```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
</script>
```

---

## 📋 推荐部署方案组合

### 最小防护（建议）
1. ✅ 使用 **terser** 混淆 JavaScript
2. ✅ 使用 **cleancss** 压缩 CSS
3. ✅ 使用 **Nginx/Apache** 安全头

### 中等防护（强烈推荐）
1. ✅ 代码混淆 + 压缩
2. ✅ **将密码验证逻辑转移到后端**
3. ✅ 安全 HTTP 头
4. ✅ 禁用缓存

### 高级防护
1. ✅ 所有上述方案
2. ✅ 资源加密（crypto-js）
3. ✅ 开发者工具检测
4. ✅ ServiceWorker 二次防护

---

## 🚀 快速部署步骤

### 1. 准备部署文件夹
```bash
mkdir -p deploy
cp -r pages deploy/
cp -r styles deploy/
cp -r scripts deploy/
cp -r media deploy/
cp -r audio deploy/
cp index.html deploy/
```

### 2. 混淆代码
```bash
mkdir build-tools && cd build-tools

# 安装工具
npm init -y
npm install terser clean-css-cli html-minifier

# 创建混淆脚本
cat > obfuscate.js << 'EOF'
const fs = require('fs');
const { execSync } = require('child_process');

const files = [
  '../scripts/app.js',
  '../scripts/puzzle.js',
  '../scripts/search.js'
];

files.forEach(file => {
  const minFile = file.replace('.js', '.min.js');
  console.log(`混淆 ${file}...`);
  execSync(`npx terser ${file} -o ${minFile} -c -m`);
});

console.log('✓ JavaScript 混淆完成');
EOF

node obfuscate.js
```

### 3. 更新 HTML 引用
```bash
# 将 HTML 中的引用改为混淆版本
# <script src="scripts/app.js"></script>
# 改为
# <script src="scripts/app.min.js"></script>
```

### 4. 部署到云服务器
```bash
# 使用 SCP 上传
scp -r deploy/* user@yourserver:/var/www/yourgame/

# 或使用 rsync
rsync -avz deploy/ user@yourserver:/var/www/yourgame/
```

### 5. 配置服务器
参考上面的 Nginx 或 .htaccess 配置

---

## ✅ 部署前检查清单

- [ ] 所有敏感密码已从客户端代码中移除
- [ ] JavaScript 已混淆并缩小
- [ ] CSS 已压缩
- [ ] HTML 已缩小
- [ ] 不包含开发文档（.md 文件）
- [ ] 不包含提示词目录
- [ ] 不包含开发笔记
- [ ] 服务器配置了安全头
- [ ] 测试了开发者工具功能
- [ ] 测试了所有游戏流程（登录、解锁、结局）

---

## 📞 故障排除

| 问题 | 解决方案 |
|-----|--------|
| 混淆后脚本无法运行 | 检查 console 错误，可能是 export/import 问题 |
| 样式失效 | 确保 CSS 文件路径正确 |
| 页面加载缓慢 | 启用 Gzip 压缩，优化图片大小 |
| 跨域问题 | 配置 CORS 头 |

---

**最后更新**：2026-03-30
**版本**：1.0 - 生产就绪
