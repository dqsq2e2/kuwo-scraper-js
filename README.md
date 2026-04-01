# 酷我听书刮削插件

这是一个基于 JavaScript 编写的 Ting Reader 刮削插件，用于从酷我听书获取有声书元数据。

## 功能特性

- 搜索有声书
- 智能提取演播者信息 (按照 `aartist` -> `artist` -> `fartist` 优先级降级提取)
- 自动按演播者筛选和重排

## 文件结构

- `plugin.json`: 插件核心配置文件，声明了所需的权限及入口。
- `plugin.js`: 刮削核心逻辑代码，负责请求发送与结果解析。
- `package.json`: NPM 项目基础信息配置。

## 权限说明

此插件需要访问酷我听书网络接口以获取搜索数据，需要在 `plugin.json` 中配置以下网络访问权限：

```json
{
  "type": "network_access",
  "value": "*.kuwo.cn"
}
```