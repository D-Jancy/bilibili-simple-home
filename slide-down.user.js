// ==UserScript==
// @name         bilibili-simple-home slide-down (Windows)
// @namespace    hakadao-bilibili-simple-home
// @version      1.2.0
// @description  Drive Bilibili native isSlideDown on Windows. Vue overwrites classList.add; this fakes scrollTop and locks className.
// @author       hakadao-bilibili-simple-home
// @match        *://www.bilibili.com/
// @match        *://www.bilibili.com/*
// @match        *://bilibili.com/
// @match        *://bilibili.com/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// @noframes
// ==/UserScript==

(function bootstrap() {
  "use strict";

  function pageMain() {
    if (window.__BSH_SD__) return;
    window.__BSH_SD__ = "1.2.0";

    var THRESHOLD = 32;
    var FAKE_TOP = 33;
    var wantCompact = false;
    var wheelCompact = false;
    var hookedBar = null;
    var lastPing = 0;

    function pathOk() {
      var p = location.pathname || "/";
      return p === "/" || p === "/index.html";
    }

    function markHtml() {
      try {
        if (document.documentElement) {
          document.documentElement.setAttribute("data-bsh-sd", "1.2.0");
        }
      } catch (err) {}
    }

    function searchOpen() {
      try {
        var ae = document.activeElement;
        if (ae && ae.closest && ae.closest("#nav-searchform, .center-search__bar, .center-search-container")) {
          return true;
        }
        return !!(
          document.querySelector("#nav-searchform:focus-within") ||
          document.querySelector(".center-search__bar:focus-within") ||
          document.querySelector(".nav-search-input:focus")
        );
      } catch (err) {
        return false;
      }
    }

    function realScrollTop() {
      try {
        if (typeof window.pageYOffset === "number" && window.pageYOffset > 0) return window.pageYOffset;
        if (typeof window.scrollY === "number" && window.scrollY > 0) return window.scrollY;
        return 0;
      } catch (err) {
        return 0;
      }
    }

    function pageCanScroll() {
      try {
        var se = document.scrollingElement || document.documentElement;
        if (!se) return false;
        return se.scrollHeight > se.clientHeight + 2;
      } catch (err) {
        return false;
      }
    }

    function isDocScroller(el) {
      return !!el && (
        el === document.documentElement ||
        el === document.body ||
        el === document.scrollingElement
      );
    }

    function patchScrollTopOn(obj) {
      if (!obj) return false;
      try {
        var desc =
          Object.getOwnPropertyDescriptor(obj, "scrollTop") ||
          Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), "scrollTop") ||
          Object.getOwnPropertyDescriptor(Element.prototype, "scrollTop") ||
          Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTop");
        if (!desc || !desc.get || !desc.set) return false;
        if (desc.get._bsh) return true;
        var getter = desc.get;
        var setter = desc.set;
        function wrappedGet() {
          var v = getter.call(this);
          if (wantCompact && isDocScroller(this) && v <= THRESHOLD) return FAKE_TOP;
          return v;
        }
        wrappedGet._bsh = 1;
        Object.defineProperty(obj, "scrollTop", {
          configurable: true,
          enumerable: desc.enumerable,
          get: wrappedGet,
          set: function (v) {
            return setter.call(this, v);
          }
        });
        return true;
      } catch (err) {
        return false;
      }
    }

    function patchProtos() {
      patchScrollTopOn(Element.prototype);
      patchScrollTopOn(HTMLElement.prototype);
      try { patchScrollTopOn(HTMLHtmlElement.prototype); } catch (err) {}
      try { patchScrollTopOn(HTMLBodyElement.prototype); } catch (err) {}
      if (document.documentElement) patchScrollTopOn(document.documentElement);
      if (document.body) patchScrollTopOn(document.body);
      if (document.scrollingElement) patchScrollTopOn(document.scrollingElement);
    }

    function pingNativeScroll() {
      var now = Date.now();
      if (now - lastPing < 16) return;
      lastPing = now;
      try { window.dispatchEvent(new Event("scroll")); } catch (err) {}
      try { document.dispatchEvent(new Event("scroll")); } catch (err) {}
    }

    function applyBarClass(bar) {
      if (!bar) return;
      if (wantCompact) {
        if (bar.className.indexOf("slide-down") === -1) bar.classList.add("slide-down");
      } else if (realScrollTop() <= THRESHOLD) {
        if (bar.className.indexOf("slide-down") !== -1) bar.classList.remove("slide-down");
      }
    }

    function hookBar(bar) {
      if (!bar || bar.__bshClassHook) return;
      bar.__bshClassHook = 1;
      hookedBar = bar;

      var cn =
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, "className") ||
        Object.getOwnPropertyDescriptor(Element.prototype, "className");
      if (cn && cn.get && cn.set) {
        try {
          Object.defineProperty(bar, "className", {
            configurable: true,
            enumerable: true,
            get: function () { return cn.get.call(this); },
            set: function (v) {
              v = String(v == null ? "" : v);
              if (wantCompact && v.indexOf("slide-down") === -1) {
                v = v ? v + " slide-down" : "slide-down";
              }
              return cn.set.call(this, v);
            }
          });
        } catch (err) {}
      }

      try {
        var sa = bar.setAttribute;
        bar.setAttribute = function (name, value) {
          if (String(name).toLowerCase() === "class") {
            this.className = value;
            return;
          }
          return sa.call(this, name, value);
        };
      } catch (err) {}

      applyBarClass(bar);
    }

    function computeWant() {
      return !!(pathOk() && (searchOpen() || wheelCompact || realScrollTop() > THRESHOLD));
    }

    function refreshWant() {
      if (!pathOk()) {
        wantCompact = false;
        wheelCompact = false;
        applyBarClass(document.querySelector(".bili-header__bar"));
        return;
      }
      if (pageCanScroll()) wheelCompact = false;
      var next = computeWant();
      if (next !== wantCompact) {
        wantCompact = next;
        pingNativeScroll();
      }
      applyBarClass(document.querySelector(".bili-header__bar"));
    }

    function onWheel(ev) {
      if (!pathOk() || searchOpen() || pageCanScroll()) return;
      var dy = ev.deltaY || 0;
      if (dy > 4) {
        wheelCompact = true;
        refreshWant();
      } else if (dy < -4) {
        wheelCompact = false;
        refreshWant();
      }
    }

    function watchBar() {
      var bar = document.querySelector(".bili-header__bar");
      if (!bar) return false;
      hookBar(bar);
      patchProtos();
      markHtml();
      refreshWant();
      return true;
    }

    patchProtos();
    markHtml();

    document.addEventListener("focusin", refreshWant, true);
    document.addEventListener("focusout", function () {
      setTimeout(refreshWant, 0);
    }, true);
    window.addEventListener("scroll", function () {
      if (realScrollTop() > THRESHOLD) refreshWant();
      else if (!searchOpen() && !wheelCompact) refreshWant();
    }, true);
    window.addEventListener("wheel", onWheel, { passive: true, capture: true });
    window.addEventListener("pointerdown", function () {
      setTimeout(refreshWant, 0);
    }, true);

    try {
      var barObs = null;
      new MutationObserver(function () {
        if (hookedBar) return;
        var bar = document.querySelector(".bili-header__bar");
        if (!bar) return;
        hookBar(bar);
        patchProtos();
        markHtml();
        refreshWant();
        if (barObs) return;
        barObs = new MutationObserver(function () {
          if (wantCompact && hookedBar && hookedBar.className.indexOf("slide-down") === -1) {
            applyBarClass(hookedBar);
          }
        });
        barObs.observe(bar, { attributes: true, attributeFilter: ["class"] });
      }).observe(document.documentElement, { subtree: true, childList: true });
    } catch (err) {}

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        patchProtos();
        watchBar();
      });
    } else {
      watchBar();
    }

    window.__bshSlideDownDebug = function () {
      var bar = document.querySelector(".bili-header__bar");
      return {
        version: "1.2.0",
        pathOk: pathOk(),
        wantCompact: wantCompact,
        wheelCompact: wheelCompact,
        searchOpen: searchOpen(),
        pageCanScroll: pageCanScroll(),
        pageYOffset: window.pageYOffset,
        className: bar && bar.className,
        hasSlideDown: !!(bar && bar.classList.contains("slide-down"))
      };
    };
  }

  try { pageMain(); } catch (err) {}

  try {
    var s = document.createElement("script");
    s.textContent = "(" + pageMain.toString() + ")();";
    (document.documentElement || document.head).appendChild(s);
    if (s.parentNode) s.parentNode.removeChild(s);
  } catch (err) {}
})();
