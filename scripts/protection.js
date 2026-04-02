/**
 * 《交接云盘》ARG游戏 - 防护脚本
 * 用途：防范玩家通过源代码查看揭秘
 *
 * 包含：
 * 1. 开发者工具检测
 * 2. 代码注入攻击防护
 * 3. 离线备份防护
 * 4. 加密敏感数据
 * 5. 速率限制（防爆破密码）
 */

(function() {
  'use strict';

  // ====================================
  // 1️⃣ 开发者工具检测
  // ====================================

  const DevToolsDetector = {
    open: false,
    threshold: 160,

    init() {
      this.detectBySize();
      this.detectByDebugger();
      this.preventRightClick();
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

    // 方法2：通过 console 检测
    detectByDebugger() {
      // 检测 console 对象是否被访问
      const originalLog = console.log;
      Object.defineProperty(console, 'log', {
        get() {
          DevToolsDetector.onDetected('console');
          return originalLog;
        }
      });

      // 检查是否使用了 chrome devtools 协议
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

    // 禁用右键菜单
    preventRightClick() {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
      });

      // 也禁用通过键盘打开开发者工具
      document.addEventListener('keydown', (e) => {
        // F12
        if (e.keyCode === 123) {
          e.preventDefault();
          return false;
        }

        // Ctrl+Shift+I (Chrome/Firefox)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
          e.preventDefault();
          return false;
        }

        // Ctrl+Shift+C (Element Inspector)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
          e.preventDefault();
          return false;
        }

        // Ctrl+Shift+J (控制台)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
          e.preventDefault();
          return false;
        }

        // F11 (全屏)
        if (e.keyCode === 122) {
          e.preventDefault();
          return false;
        }
      });
    },

    // 检测到开发者工具时的响应
    onDetected(method) {
      console.warn(`🚨 游戏检测到开发者工具已打开 (${method})`);

      // 方案1：显示警告（温和）
      this.showWarning();

      // 方案2：禁用游戏（激进）
      // this.disableGame();

      // 方案3：重置进度（惩罚）
      // this.resetProgress();
    },

    showWarning() {
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
        font-family: monospace;
      `;

      warning.innerHTML = `
        <div style="text-align: center; color: #ff4444; font-size: 18px;">
          <p style="margin-bottom: 20px;">⚠️ 警告</p>
          <p style="margin-bottom: 20px;">游戏检测到您正在使用开发者工具</p>
          <p style="margin-bottom: 40px; color: #999; font-size: 14px;">
            请关闭开发者工具以继续游戏
          </p>
          <p style="color: #666; font-size: 12px;">按 Enter 关闭此警告</p>
        </div>
      `;

      document.body.appendChild(warning);

      // 按 Enter 关闭
      const closeWarning = (e) => {
        if (e.keyCode === 13) {
          warning.remove();
          document.removeEventListener('keydown', closeWarning);
        }
      };

      document.addEventListener('keydown', closeWarning);
    },

    disableGame() {
      document.body.style.pointerEvents = 'none';
      document.body.style.opacity = '0.5';
      alert('游戏已禁用。请关闭开发者工具后刷新。');
    },

    resetProgress() {
      localStorage.removeItem('visitedPages');
      localStorage.removeItem('progress');
      localStorage.removeItem('passwords');
      location.reload();
    }
  };

  // ====================================
  // 2️⃣ 敏感数据加密
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
      const data = atob(encrypted);
      let result = '';
      for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    },

    // 加密敏感字符串（防止在源代码中暴露）
    encryptSecrets(secrets, masterKey) {
      const encrypted = {};
      for (const [key, value] of Object.entries(secrets)) {
        encrypted[key] = this.xorEncrypt(value, masterKey);
      }
      return encrypted;
    },

    // 运行时解密
    decryptSecret(encryptedValue, masterKey) {
      return this.xorDecrypt(encryptedValue, masterKey);
    }
  };

  // ====================================
  // 3️⃣ localStorage 防护
  // ====================================

  const StorageProtection = {
    // 存储加密的数据而非明文
    setSecureItem(key, value, password = 'default_key') {
      const encrypted = DataEncryption.xorEncrypt(JSON.stringify(value), password);
      localStorage.setItem(`secure_${key}`, encrypted);
    },

    getSecureItem(key, password = 'default_key') {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;

      try {
        const decrypted = DataEncryption.xorDecrypt(encrypted, password);
        return JSON.parse(decrypted);
      } catch (e) {
        console.error('解密失败:', e);
        return null;
      }
    },

    // 清除所有跟踪数据（用户要求隐私）
    clearAllData() {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('secure_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  // ====================================
  // 4️⃣ 密码爆破防护（速率限制）
  // ====================================

  const BruteForceProtection = {
    maxAttempts: 5,  // 5 次错误乏后
    lockoutTime: 60 * 1000,  // 60 秒锁定
    attempts: {},

    checkAttempt(identifier) {
      const now = Date.now();

      if (!this.attempts[identifier]) {
        this.attempts[identifier] = { count: 0, lockedUntil: 0 };
      }

      const record = this.attempts[identifier];

      // 检查是否在锁定期内
      if (record.lockedUntil > now) {
        const remainingTime = Math.ceil((record.lockedUntil - now) / 1000);
        return {
          allowed: false,
          message: `尝试过多，请等待 ${remainingTime} 秒后重试`
        };
      }

      return { allowed: true, message: '' };
    },

    recordFailure(identifier) {
      const now = Date.now();

      if (!this.attempts[identifier]) {
        this.attempts[identifier] = { count: 0, lockedUntil: 0 };
      }

      const record = this.attempts[identifier];
      record.count++;

      if (record.count >= this.maxAttempts) {
        record.lockedUntil = now + this.lockoutTime;
        return {
          locked: true,
          message: `错误次数过多，账户已锁定 ${this.lockoutTime / 1000} 秒`
        };
      }

      return {
        locked: false,
        attemptsLeft: this.maxAttempts - record.count
      };
    },

    recordSuccess(identifier) {
      // 重置尝试记录
      delete this.attempts[identifier];
    }
  };

  // ====================================
  // 5️⃣ API 签名验证（防篡改）
  // ====================================

  const APISignature = {
    secret: 'your_secret_key_v1_change_this',

    generateSignature(data) {
      // 简单的 HMAC-like 签名（实际应用应使用真实 HMAC）
      const str = JSON.stringify(data);
      let hash = 0;

      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;  // 转换为 32 位整数
      }

      return Math.abs(hash).toString(36);
    },

    verifySignature(data, signature) {
      return this.generateSignature(data) === signature;
    }
  };

  // ====================================
  // 6️⃣ 初始化所有防护
  // ====================================

  window.GameProtection = {
    init() {
      // 初始化开发者工具检测
      DevToolsDetector.init();

      console.log('%c', 'color: red; font-size: 50px;');
      console.log('%c🛡️ 游戏防护系统已启动', 'color: #ff6666; font-weight: bold; font-size: 16px;');
      console.log('%c该游戏受到反逆向工程保护', 'color: #ffaaaa; font-size: 12px;');

      // 防止在控制台输出敏感信息
      this.secureLog();
    },

    // 防止敏感日志输出
    secureLog() {
      const originalLog = console.log;
      const isProduction = !window.location.hostname.includes('localhost');

      if (isProduction) {
        console.log = function(...args) {
          // 过滤含有敏感关键字的日志
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
  // 上线时初始化
  // ====================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GameProtection.init();
    });
  } else {
    window.GameProtection.init();
  }

  // 导出供其他脚本使用
  window.DataEncryption = DataEncryption;
  window.StorageProtection = StorageProtection;
  window.BruteForceProtection = BruteForceProtection;
  window.APISignature = APISignature;
})();
