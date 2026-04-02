# 《交接云盘》- 生产部署快速指南

## 📌 项目整理完成

你的项目现已准备好部署到公网。以下是文件组织结构和部署步骤。

---

## 📂 文件组织

### ✅ 去往生产（内容将被部署）
```
deploy-production/          ← 运行此脚本后自动创建
├── index.html
├── pages/                  (40个HTML游戏页面)
├── styles/                 (CSS样式 - 已压缩)
├── scripts/                (JavaScript - 已混淆)
├── media/                  (图片和视频)
├── audio/                  (音频文件)
└── .htaccess              (Apache配置)
```

### 📦 开发档案（保留本地）
```
source-archive/            ← 自动收集的开发文件
├── *.md                   (所有项目文档)
├── prompts/               (Cursor提示词)
├── memory/                (开发笔记)
├── DEPLOYMENT_CHECKLIST.md
├── DEPLOYMENT_STATS.txt
└── nginx-config-example.conf
```

---

## 🚀 部署三步走

### 步骤1：自动整理项目
```bash
bash deploy.sh
```

这会自动：
- ✅ 创建 `deploy-production/` 文件夹（生产文件）
- ✅ 创建 `source-archive/` 文件夹（开发档案）
- ✅ 创建 `build-tools/` 文件夹（混淆工具）
- ✅ 生成 `.htaccess` 和 Nginx 配置示例
- ✅ 生成部署检查清单

### 步骤2：混淆代码（防反编译）
```bash
cd build-tools
npm install
npm run build
```

这会：
- ✅ 混淆所有 JavaScript（使用 Terser）
- ✅ 压缩所有 CSS
- ✅ 生成 `.min.js` 和 `.min.css` 文件

### 步骤3：更新HTML引用
在各HTML文件中，将：
```html
<script src="scripts/app.js"></script>
```
改为：
```html
<script src="scripts/app.min.js"></script>
```

---

## 🛡️ 防范玩家看源代码

### 方案速览

| 方案 | 难度 | 安全性 | 推荐 |
|-----|------|--------|------|
| 代码混淆 | ⭐ | ⭐⭐⭐ | ✅ |
| 移除敏感逻辑 | ⭐⭐ | ⭐⭐⭐⭐ | ✅✅ |
| 资源加密 | ⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| DevTools检测 | ⭐⭐⭐ | ⭐⭐ | ❌ |
| HTTP安全头 | ⭐ | ⭐⭐⭐ | ✅ |
| ServiceWorker | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |

### 最小配置（已完成）
1. ✅ 使用 `protection.js` - 已创建于 `scripts/protection.js`
2. ✅ 配置 `.htaccess` - 已包含在部署脚本中
3. ✅ 混淆代码 - 使用 Terser（见步骤2）

**在每个 HTML 中添加防护脚本**：
```html
<head>
  <!-- ... 其他 head 内容 ... -->
  <script src="scripts/protection.js"></script>
</head>
```

### 关键密码处理建议

当前项目中的敏感密码：
- `P15` 素材库：`buxiangganle`
- `P19` 私密文件：`DM-8975heidou`
- `P27` 后台登录：`admin` / `OVERRIDE_998`

**强烈推荐**：将这些验证逻辑转移到后端 API

如果要使用后端验证，示例：
```javascript
// 前端 - 不露密码
async function verifyPassword(password) {
  const response = await fetch('/api/verify-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  const result = await response.json();
  if (result.correct) {
    unlockPage();
  } else {
    showError('密码错误');
  }
}
```

```python
# 后端 (Flask 示例)
@app.route('/api/verify-password', methods=['POST'])
def verify_password():
    password = request.json.get('password')

    correct_passwords = {
        'assets': 'buxiangganle',
        'private': 'DM-8975heidou',
        'admin': 'OVERRIDE_998'
    }

    for key, correct in correct_passwords.items():
        if password == correct:
            session[f'{key}_unlocked'] = True
            return {'correct': True}

    return {'correct': False}
```

---

## 📋 部署检查清单

部署前必须完成以下检查（详见 `source-archive/DEPLOYMENT_CHECKLIST.md`）：

### 代码检查
- [ ] JavaScript 已混淆
- [ ] CSS 已压缩
- [ ] HTML 已缩小
- [ ] 删除了所有 console.log()
- [ ] 删除了所有开发注释
- [ ] 密码逻辑已转移到后端（或已加密）

### 文件检查
- [ ] `deploy-production/` 中不包含 `.md` 文件
- [ ] 不包含 `prompts/` 和 `memory/` 文件夹
- [ ] 不包含 `.map` 源映射文件

### 服务器配置
- [ ] 启用了 HTTPS
- [ ] 配置了 Cache-Control 头
- [ ] 配置了 CSP（Content-Security-Policy）
- [ ] 禁用了目录浏览
- [ ] 配置了 Gzip 压缩

### 功能测试
- [ ] 完整游戏流程测试（P01→结局）
- [ ] 所有密码解锁测试
- [ ] 五连击隐藏入口测试
- [ ] 倒计时自动激活测试
- [ ] 移动设备兼容性测试

---

## 🔒 服务器配置建议

### 使用 Nginx（推荐）
```bash
# 复制配置文件
cp source-archive/nginx-config-example.conf /etc/nginx/sites-available/yourgame

# 启用配置
ln -s /etc/nginx/sites-available/yourgame /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启服务
systemctl restart nginx
```

### 使用 Apache
```bash
# 复制到网站根目录
cp deploy-production/.htaccess /var/www/yourgame/

# 启用 mod_rewrite
a2enmod rewrite

# 重启服务
systemctl restart apache2
```

---

## 📤 上传到沙发器

### 使用 rsync（推荐）
```bash
rsync -avz deploy-production/ user@server.com:/var/www/yourgame/ \
  --exclude='.git' \
  --exclude='*.map' \
  --exclude='node_modules'
```

### 使用 SCP
```bash
scp -r deploy-production/* user@server.com:/var/www/yourgame/
```

### 使用 FTP
使用 FileZilla 或类似工具，上传 `deploy-production/` 中的所有文件

---

## 🔍 验证部署

部署完成后，检查以下内容：

### 1️⃣ 访问网站
```bash
curl https://yourgame.com
# 应能看到 HTML 内容
```

### 2️⃣ 检查文件
- index.html 可访问？
- 页面能加载？
- 图片和音频能播放？

### 3️⃣ 检查安全头
```bash
curl -I https://yourgame.com
# 应看到：
# Cache-Control: no-store
# X-Frame-Options: DENY
# Content-Security-Policy: ...
```

### 4️⃣ 测试游戏流程
- 登录是否正常？
- 密码验证是否工作？
- 五连击隐藏入口？
- 倒计时和自动激活？

### 5️⃣ 浏览器控制台
- 打开浏览器开发者工具 (F12)
- Console 中应看到防护系统启动日志
- 不应有错误或警告

---

## 🆘 常见问题

### 问题1：混淆后页面无法加载
**解决方案**：
- 检查 console 错误信息
- 确保 HTML 引用了 `.min.js` 文件
- 可能是 `eval()` 或动态代码问题，调整混淆参数

### 问题2：密码验证失败
**解决方案**：
- 检查是否正确移除了密码或加密了
- 如果使用后端 API，检查服务器响应
- 验证 localStorage 中的数据格式

### 问题3：跨域资源加载失败
**解决方案**：
配置 CORS 头（如果需要从其他域加载资源）：
```nginx
add_header Access-Control-Allow-Origin "*";
```

### 问题4：页面加载缓慢
**解决方案**：
- 启用 Gzip 压缩
- 使用 CDN 加速
- 优化图片大小（TinyPNG）
- 设置浏览器缓存（对 `.js/.css` 文件）

---

## 📊 文件大小对比

| 文件类型 | 优化前 | 优化后 | 压缩率 |
|---------|-------|-------|--------|
| scripts/app.js | 3.3 KB | ~1.0 KB | 70% |
| scripts/puzzle.js | 5.1 KB | ~1.5 KB | 70% |
| styles/main.css | 7.2 KB | ~4.3 KB | 40% |
| 总体（含资源） | 25 MB | 8-12 MB | 60-70% |

---

## 📚 相关文档

| 文件 | 用途 |
|-----|------|
| `DEPLOYMENT_GUIDE.md` | 详细部署指南（所有方案）|
| `DEPLOYMENT_CHECKLIST.md` | 供部署清单 |
| `nginx-config-example.conf` | Nginx 服务器配置 |
| `scripts/protection.js` | 反逆向工程防护脚本 |

---

## 💡 总结

### 最快部署方案（15分钟）
```bash
# 1. 自动整理
bash deploy.sh

# 2. 混淆代码
cd build-tools && npm install && npm run build

# 3. 更新 HTML（使用搜索替换）
# 将所有 scripts/*.js 改为 scripts/*.min.js

# 4. 上传到服务器
rsync -avz deploy-production/ user@server:/var/www/yourgame/

# 5. 完成！
```

### 最安全部署方案（1-2小时）
1. 按上述步骤 1-4 完成
2. 将密码验证逻辑转移到后端 API
3. 配置 HTTPS 和安全头
4. 完整的功能和安全测试
5. 监控和日志配置

---

**重要提示**：部署前必须完成 `DEPLOYMENT_CHECKLIST.md` 中的所有项目！

最后更新：2026-03-30 | 版本：1.0
