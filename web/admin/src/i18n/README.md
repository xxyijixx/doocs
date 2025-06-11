# 国际化 (i18n) 使用指南

本项目已集成 react-i18next 国际化解决方案，支持中文和英文两种语言。

## 功能特性

- 🌍 支持中文 (zh-CN) 和英文 (en-US)
- 🔄 自动语言检测
- 💾 语言偏好本地存储
- 🎛️ 语言切换组件
- 📱 响应式设计

## 使用方法

### 1. 在组件中使用翻译

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### 2. 带参数的翻译

```tsx
// 在语言文件中定义
{
  "validation": {
    "minLength": "最少需要 {{count}} 个字符"
  }
}

// 在组件中使用
const message = t('validation.minLength', { count: 5 });
```

### 3. 语言切换

项目已提供 `LanguageSwitch` 组件，可以直接使用：

```tsx
import { LanguageSwitch } from './components/LanguageSwitch';

function Header() {
  return (
    <div>
      <LanguageSwitch />
    </div>
  );
}
```

### 4. 编程式语言切换

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('en-US')}>
      Switch to English
    </button>
  );
}
```

## 语言资源文件

语言资源文件位于 `src/i18n/locales/` 目录下：

- `zh-CN.json` - 中文翻译
- `en-US.json` - 英文翻译

### 添加新的翻译键

1. 在两个语言文件中添加相同的键值对
2. 中文文件示例：
```json
{
  "myModule": {
    "title": "我的模块",
    "description": "这是一个示例模块"
  }
}
```

3. 英文文件示例：
```json
{
  "myModule": {
    "title": "My Module",
    "description": "This is a sample module"
  }
}
```

## 最佳实践

1. **命名规范**：使用点分隔的命名空间，如 `module.section.key`
2. **避免硬编码**：所有用户可见的文本都应该使用翻译键
3. **保持同步**：确保所有语言文件包含相同的键
4. **简洁明了**：翻译键应该简洁且具有描述性
5. **分组管理**：相关的翻译键应该分组在同一个命名空间下

## 当前已支持的模块

- `common` - 通用文本（保存、取消、确认等）
- `navigation` - 导航相关
- `chat` - 聊天功能
- `config` - 配置页面
- `agent` - 客服管理
- `messages` - 消息提示
- `validation` - 表单验证

## 扩展语言支持

如需添加新语言（如日语），请按以下步骤操作：

1. 在 `src/i18n/locales/` 目录下创建新的语言文件，如 `ja-JP.json`
2. 在 `src/i18n/index.ts` 中导入并添加到 resources 对象
3. 在 `LanguageSwitch` 组件中添加新语言选项

```typescript
// src/i18n/index.ts
import jaJP from './locales/ja-JP.json';

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP }, // 新增
};
```