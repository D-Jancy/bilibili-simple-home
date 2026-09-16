# bilibili-simple-home

> 事实上现在我对该项目的更新维护没有甚么激情，可能多数是问题修正

b站仿搜索引擎样式首页风格

## 安装

> 请先在浏览器安装 `Stylus` 插件，再进行以下安装

1. 安装 [Stylus for Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/styl-us/)

2. [点击此处安装或更新样式](https://cdn.jsdelivr.net/gh/hakadao/bilibili-simple-home@master/index.user.css)

3. [xStyle插件的在此处安装](https://ext.firefoxcn.net/xstyle/install/open.html?name=bilibili搜索引擎首页样式&code=https://cdn.jsdelivr.net/gh/hakadao/bilibili-simple-home@master/index.user.css)

4. [UserStyles.world 安装](https://userstyles.world/style/3022/bilibili)

### Windows：顶栏 slide-down 不出现

B 站首页用 Vue 绑定 `.bili-header__bar.slide-down`：只有 `document.scrollingElement.scrollTop > 32` 时才会加上。Windows 上聚焦搜索通常不会把页面滚过 32px，默认「全屏壁纸不能下滑」时页面也滚不动，所以官方永远不加这个 class。CSS 加不了 Vue 绑定的 class；旧脚本用 `classList.add` 也会被 Vue 下一帧覆盖。

请安装 Tampermonkey / 暴力猴，再安装仓库里的 `slide-down.user.js`（必须是 **1.2.0**，请在插件面板里确认版本；旧的 1.0 / 1.1 请删掉重装）。

1. Chrome 扩展页打开「开发者模式」，并允许 Tampermonkey 运行用户脚本。
2. 打开脚本后**硬刷新**首页（Ctrl+F5）。
3. 点搜索框，或在不能下滑的全屏壁纸上向下滚轮。
4. 开发者工具里 `<html>` 应有 `data-bsh-sd="1.2.0"`；点搜索后 `.bili-header__bar` 应出现 `slide-down`。控制台可运行 `__bshSlideDownDebug()`。
5. 样式保持 **1.9.2** 即可，不要改搜索框宽度/居中。

## 快速配置

* [自定义背景](#自定义背景)

* [使用说明](#使用说明)

* [Firefox）](https://github.com/hakadao/bilibili-simple-home/issues/11)

## 效果

![首页](https://user-images.githubusercontent.com/33394391/203888936-3c80b16d-f6ee-4bf0-adfe-18df11cca975.jpg)

## 使用说明

点击齿轮图标及可进行样式设置

![设置](https://cdn.jsdelivr.net/gh/hakadao/bilibili-simple-home@master/preview/setting-preview.png)

### 自定义背景

1. 用 [sm.ms](https://sm.ms/) 图床上传图片

2. 复制上传后得到的图片链接

3. 按以下设置进行配置，同时需要将上面的图片链接复制到 `url()` 括号里

![自定义背景设置](https://i.loli.net/2020/09/22/OeU6xdqKCujzIL4.png)

``` css
/* 自定义背景格式 */
url(https://i.loli.net/2020/05/25/HxnieocyPIjWvQB.jpg)
```

---

## 开发

* 直接使用stylus插件点击`铅笔图标`进行编辑
![设置](https://cdn.jsdelivr.net/gh/hakadao/bilibili-simple-home@master/preview/setting-preview.png)

或是

* 使用 `xStyle` 插件导入根目录下的 `index.user.css` 文件编辑
