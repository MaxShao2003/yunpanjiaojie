/**
 * 《交接云盘》ARG游戏 - 增强防护脚本 v2.0
 * 用途：防范玩家通过开发者工具查看源代码或修改数据获取答案
 *
 * 功能：
 * 1. 多方式DevTools检测（窗口大小、debugger、console访问）
 * 2. 分层防护策略（普通页警告、敏感页冻结、关键页清除）
 * 3. 密码解除机制（Ctrl+Shift+Alt+D + 特殊密码）
 * 4. localStorage透明加密（对上层代码无感知）
 * 5. 爆破防护和速率限制
 */

(function() {
  'use strict';

  // ====================================
  // 1️⃣ 开发者工具检测模块
  // ====================================

  const DevToolsDetector = {
    open: false,
    threshold: 160,

    // 防护配置
    ProtectionConfig: {
      bypassPassword: 'zydebug2026',  // 部署时应更改为真实密码
      sensitivePages: [
        'admin_dashboard.html',
        'admin_login.html',
        'private_folder.html',
        'private_lock.html'
      ],
      criticalPages: [
        'login.html'
      ],
      bypassDuration: 30  // 分钟
    },

    // 初始化检测
    init() {
      this.detectBySize();
      this.detectByDebugger();
      this.preventRightClick();
      this.preventKeyboardShortcuts();
    },

    // 方法1：通过窗口大小检测
    detectBySize() {
      setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth;
        const heightDiff = window.outerHeight - window.innerHeight;

        if (widthDiff > this.threshold || heightDiff > this.threshold) {
          if (!this.open) {
            this.open = true;
            this.onDetected('size');
          }
        } else {
          this.open = false;
        }
      }, 1000);
    },

    // 方法2：通过 debugger 检测
    detectByDebugger() {
      const checkDevTools = () => {
        const start = Date.now();
        debugger;
        const elapsed = Date.now() - start;

        if (elapsed > 100) {
          this.onDetected('debugger');
        }
      };

      // 延迟执行，避免影响初始加载
      setTimeout(checkDevTools, 2000);
    },

    // 方法3：拦截 console 对象
    detectByConsole() {
      const originalLog = console.log;
      Object.defineProperty(console, 'log', {
        get: () => {
          DevToolsDetector.onDetected('console');
          return originalLog;
        }
      });
    },

    // 禁用右键菜单
    preventRightClick() {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });
    },

    // 禁用快捷键
    preventKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        const combos = [
          { keyCode: 123, name: 'F12' },
          { ctrlKey: true, shiftKey: true, keyCode: 73, name: 'Ctrl+Shift+I' },
          { ctrlKey: true, shiftKey: true, keyCode: 67, name: 'Ctrl+Shift+C' },
          { ctrlKey: true, shiftKey: true, keyCode: 74, name: 'Ctrl+Shift+J' },
          { ctrlKey: true, shiftKey: true, keyCode: 75, name: 'Ctrl+Shift+K' },
          { ctrlKey: true, shiftKey: true, keyCode: 77, name: 'Ctrl+Shift+M' },
          { keyCode: 122, name: 'F11' },
          { ctrlKey: true, keyCode: 85, name: 'Ctrl+U' }
        ];

        for (const combo of combos) {
          let matches = true;
          if (combo.ctrlKey !== undefined && combo.ctrlKey !== e.ctrlKey) matches = false;
          if (combo.shiftKey !== undefined && combo.shiftKey !== e.shiftKey) matches = false;
          if (combo.keyCode && combo.keyCode !== e.keyCode) matches = false;

          if (matches) {
            e.preventDefault();
            return false;
          }
        }
      });
    },

    // 获取当前页面类型
    getPageType() {
      const currentFile = window.location.pathname.split('/').pop().toLowerCase();

      // 关键页面
      for (const page of this.ProtectionConfig.criticalPages) {
        if (currentFile.includes(page.replace('.html', ''))) {
          return 'CRITICAL';
        }
      }

      // 敏感页面
      for (const page of this.ProtectionConfig.sensitivePages) {
        if (currentFile.includes(page.replace('.html', ''))) {
          return 'SENSITIVE';
        }
      }

      // 默认普通页
      return 'NORMAL';
    },

    // 获取防护等级
    getProtectionLevel() {
      const type = this.getPageType();
      switch(type) {
        case 'CRITICAL':
          return 'CRITICAL';
        case 'SENSITIVE':
          return 'SENSITIVE';
        default:
          return 'WARNING';
      }
    },

    // 检测到开发者工具时的响应
    onDetected(method) {
      console.warn(`🚨 游戏检测到开发者工具已打开 (${method})`);

      const level = this.getProtectionLevel();

      if (level === 'CRITICAL') {
        // 关键页面：直接清除进度
        this.resetProgressAndRedirect();
      } else if (level === 'SENSITIVE') {
        // 敏感页面：冻结游戏
        GameFreezer.freeze();
        this.showFrozenOverlay();
        PasswordBypass.initShortcut();
      } else {
        // 普通页面：显示警告
        this.showWarning();
      }
    },

    // 关键页面：清除进度并重定向
    resetProgressAndRedirect() {
      // 清除所有游戏进度数据
      const keysToRemove = [
        'visitedPages', 'progress', 'passwords', 'clues', 'gameEvents',
        'assetsUnlocked', 'privateUnlocked', 'hasReadRules', 'adminLoggedIn',
        'adminEntryUnlocked', 'isLoggedIn', 'currentUser'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 还要清除所有以_enc_前缀的加密字段
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('_enc_') || key.startsWith('has') || key.startsWith('viewed') || key.includes('Unlocked')) {
          localStorage.removeItem(key);
        }
      });

      // 重定向到首页
      alert('检测到异常访问，游戏进度已重置');
      window.location.href = 'home.html';
    },

    // 显示警告对话框
    showWarning() {
      if (document.getElementById('devtools-warning')) return;

      const warning = document.createElement('div');
      warning.id = 'devtools-warning';
      warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      `;

      warning.innerHTML = `
        <div style="text-align: center; color: #ff6666; max-width: 400px; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h2 style="margin: 0 0 16px 0; font-size: 24px;">游戏检测到开发者工具</h2>
          <p style="margin: 0 0 30px 0; color: #ccc; font-size: 14px;">
            请关闭开发者工具以继续游戏
          </p>
          <p style="color: #999; font-size: 12px;">
            按 <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 3px;">Enter</code> 关闭此警告
          </p>
        </div>
      `;

      document.body.appendChild(warning);

      const closeWarning = (e) => {
        if (e.keyCode === 13) {
          warning.remove();
          document.removeEventListener('keydown', closeWarning);
        }
      };

      document.addEventListener('keydown', closeWarning);
    },

    // 显示冻结蒙层
    showFrozenOverlay() {
      if (document.getElementById('devtools-frozen-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'devtools-frozen-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      `;

      overlay.innerHTML = `
        <div style="text-align: center; color: white; padding: 40px; background: rgba(0, 0, 0, 0.9); border-radius: 12px; border: 2px solid #d9534f;">
          <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
          <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #fff;">游戏已禁用</h2>
          <p style="margin: 0 0 20px 0; color: #ccc; font-size: 14px;">请关闭开发者工具以继续游戏</p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            按 <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 3px;">Ctrl+Shift+Alt+D</code> 输入密码解除
          </p>
        </div>
      `;

      document.body.appendChild(overlay);
    }
  };

  // ====================================
  // 2️⃣ 游戏UI冻结/解冻模块
  // ====================================

  const GameFreezer = {
    isFrozen: false,
    bypassExpiryTime: null,

    freeze() {
      if (this.isFrozen) return;

      document.body.style.pointerEvents = 'none';
      document.body.style.opacity = '0.5';
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'not-allowed';

      // 禁用所有交互元素
      document.querySelectorAll('input, button, a, [onclick]').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
      });

      this.isFrozen = true;
      sessionStorage.setItem('gameFrozen', 'true');
    },

    unfreeze(durationMinutes = 30) {
      if (!this.isFrozen) return;

      document.body.style.pointerEvents = 'auto';
      document.body.style.opacity = '1';
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';

      document.querySelectorAll('input, button, a, [onclick]').forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
      });

      // 移除冻结蒙层
      const overlay = document.getElementById('devtools-frozen-overlay');
      if (overlay) overlay.remove();

      this.isFrozen = false;
      sessionStorage.removeItem('gameFrozen');

      // 设置有效期
      this.bypassExpiryTime = Date.now() + (durationMinutes * 60 * 1000);
      sessionStorage.setItem('bypassExpiryTime', this.bypassExpiryTime);

      // 倒计时重新冻结
      setTimeout(() => {
        if (Date.now() > this.bypassExpiryTime && this.isFrozen === false) {
          this.freeze();
          DevToolsDetector.showFrozenOverlay();
          this.showExpiryNotice();
        }
      }, durationMinutes * 60 * 1000);
    },

    showExpiryNotice() {
      const notice = document.createElement('div');
      notice.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #d9534f;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      notice.textContent = '防护时效已过期，游戏已重新禁用';
      document.body.appendChild(notice);

      setTimeout(() => notice.remove(), 3000);
    }
  };

  // ====================================
  // 3️⃣ 密码绕过模块
  // ====================================

  const PasswordBypass = {
    isListening: false,
    bruteForceAttempts: 0,
    bruteForceLockedUntil: 0,
    MAX_ATTEMPTS: 3,
    LOCKOUT_TIME: 60 * 1000,

    initShortcut() {
      if (this.isListening) return;

      document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+Alt+D 触发密码输入
        if (e.ctrlKey && e.shiftKey && e.altKey && e.code === 'KeyD') {
          e.preventDefault();
          this.showPasswordDialog();
        }
      });

      this.isListening = true;
    },

    showPasswordDialog() {
      // 检查是否在锁定期内
      if (this.bruteForceLockedUntil > Date.now()) {
        const remainingSeconds = Math.ceil((this.bruteForceLockedUntil - Date.now()) / 1000);
        alert(`尝试过多，请在 ${remainingSeconds} 秒后重试`);
        return;
      }

      // 检查是否已经解除（从缓存中）
      const expiryTime = sessionStorage.getItem('bypassExpiryTime');
      if (expiryTime && Date.now() < parseInt(expiryTime)) {
        alert('此密钥仍在有效期内，防护已解除');
        return;
      }

      // 创建密码输入对话框
      const dialogContainer = document.createElement('div');
      dialogContainer.id = 'protection-password-dialog-container';
      dialogContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 99999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;

      dialogContainer.innerHTML = `
        <div style="
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 400px;
          width: 90%;
        ">
          <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #333; text-align: center;">
            输入密码以解除防护
          </h3>
          <input type="password" id="protection-password-input"
            placeholder="请输入密码"
            style="
              width: 100%;
              padding: 12px;
              margin-bottom: 12px;
              border: 1px solid #ddd;
              border-radius: 6px;
              font-size: 14px;
              box-sizing: border-box;
              font-family: monospace;
            "
          />
          <div id="protection-password-error" style="
            color: #d9534f;
            font-size: 12px;
            margin-bottom: 12px;
            display: none;
          "></div>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="protection-pwd-cancel" style="
              padding: 10px 20px;
              background: #f0f0f0;
              border: 1px solid #ddd;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            ">
              取消
            </button>
            <button id="protection-pwd-submit" style="
              padding: 10px 20px;
              background: #4a90e2;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.2s;
            ">
              确认
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialogContainer);

      const inputField = document.getElementById('protection-password-input');
      const submitBtn = document.getElementById('protection-pwd-submit');
      const cancelBtn = document.getElementById('protection-pwd-cancel');
      const errorDiv = document.getElementById('protection-password-error');

      const cleanup = () => {
        dialogContainer.remove();
      };

      cancelBtn.onclick = cleanup;

      submitBtn.onclick = () => {
        const password = inputField.value;
        if (this.verifyPassword(password)) {
          GameFreezer.unfreeze(DevToolsDetector.ProtectionConfig.bypassDuration);
          cleanup();
          alert('密码验证成功，防护已解除 30 分钟');
          this.bruteForceAttempts = 0;  // 重置尝试计数
        } else {
          this.bruteForceAttempts++;
          if (this.bruteForceAttempts >= this.MAX_ATTEMPTS) {
            this.bruteForceLockedUntil = Date.now() + this.LOCKOUT_TIME;
            errorDiv.textContent = '密码错误过多，已锁定 60 秒';
            errorDiv.style.display = 'block';
            setTimeout(cleanup, 1500);
          } else {
            errorDiv.textContent = `密码错误，剩余尝试次数：${this.MAX_ATTEMPTS - this.bruteForceAttempts}`;
            errorDiv.style.display = 'block';
            inputField.value = '';
            inputField.focus();
          }
        }
      };

      // 按 Enter 提交，按 Esc 取消
      inputField.onkeydown = (e) => {
        if (e.keyCode === 13) submitBtn.click();
        if (e.keyCode === 27) cancelBtn.click();
      };

      inputField.focus();
    },

    verifyPassword(input) {
      return input === DevToolsDetector.ProtectionConfig.bypassPassword;
    }
  };

  // ====================================
  // 4️⃣ 敏感数据加密模块
  // ====================================

  const DataEncryption = {
    // 简单的 XOR 加密（用于混淆，不用作真实安全）
    xorEncrypt(data, key) {
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(result);  // Base64 编码
    },

    xorDecrypt(encrypted, key) {
      try {
        const data = atob(encrypted);
        let result = '';
        for (let i = 0; i < data.length; i++) {
          result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return result;
      } catch (e) {
        return null;
      }
    }
  };

  // ====================================
  // 5️⃣ localStorage 透明加密适配器
  // ====================================

  const StorageAdapter = {
    encryptionEnabled: true,
    ENCRYPT_REQUIRED: [
      'passwords',
      'secretDiscoveries',
      'adminEntryUnlocked'
    ],
    ENCRYPT_RECOMMENDED: [
      'visitedPages',
      'progress',
      'clues',
      'gameEvents'
    ],

    getMasterKey() {
      // 从URL和UA生成一个伪密钥
      const baseKey = window.location.origin + navigator.userAgent;
      return btoa(baseKey).substring(0, 32);
    },

    shouldEncrypt(key) {
      return this.ENCRYPT_REQUIRED.includes(key) || this.ENCRYPT_RECOMMENDED.includes(key);
    },

    setItem(key, value) {
      if (!this.encryptionEnabled || !this.shouldEncrypt(key)) {
        localStorage.setItem(key, value);
        return;
      }

      try {
        const encrypted = DataEncryption.xorEncrypt(value, this.getMasterKey());
        localStorage.setItem(`_enc_${key}`, encrypted);
        localStorage.removeItem(key);  // 删除旧的明文版本
      } catch (e) {
        console.error('Encryption failed for key:', key);
        localStorage.setItem(key, value);  // 降级到明文
      }
    },

    getItem(key) {
      if (!this.encryptionEnabled || !this.shouldEncrypt(key)) {
        return localStorage.getItem(key);
      }

      try {
        const encrypted = localStorage.getItem(`_enc_${key}`);
        if (encrypted) {
          return DataEncryption.xorDecrypt(encrypted, this.getMasterKey());
        }
      } catch (e) {
        console.error('Decryption failed for key:', key);
      }

      // 降级：检查是否存在明文版本（用于迁移）
      return localStorage.getItem(key);
    },

    removeItem(key) {
      localStorage.removeItem(`_enc_${key}`);
      localStorage.removeItem(key);
    }
  };

  // 导出供其他脚本使用
  window.StorageAdapter = StorageAdapter;
  window.DataEncryption = DataEncryption;

  // ====================================
  // 6️⃣ 初始化所有防护
  // ====================================

  window.GameProtection = {
    init() {
      // 初始化开发者工具检测
      DevToolsDetector.init();

      // 如果当前页面已被冻结，恢复冻结状态
      if (sessionStorage.getItem('gameFrozen') === 'true') {
        GameFreezer.freeze();
        DevToolsDetector.showFrozenOverlay();
        PasswordBypass.initShortcut();
      }

      console.log('%c🛡️ 游戏防护系统已启动', 'color: #ff6666; font-weight: bold; font-size: 14px;');

      // 防止在控制台输出敏感信息
      this.secureLog();
    },

    // 防止敏感日志输出
    secureLog() {
      const originalLog = console.log;
      const isProduction = !window.location.hostname.includes('localhost');

      if (isProduction) {
        console.log = function(...args) {
          const sensitiveKeywords = ['password', 'token', 'secret', 'key', '密码'];
          const shouldBlock = args.some(arg => {
            if (typeof arg === 'string') {
              return sensitiveKeywords.some(keyword => arg.includes(keyword));
            }
            return false;
          });

          if (!shouldBlock) {
            originalLog.apply(console, args);
          }
        };
      }
    }
  };

  // ====================================
  // 初始化防护系统
  // ====================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GameProtection.init();
    });
  } else {
    window.GameProtection.init();
  }

})();
