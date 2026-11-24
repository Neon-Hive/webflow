(() => {
  if (window.VideoLibrary) return;
  class e {
    constructor(e = {}) {
      ((this.options = {
        rootMargin: "600px",
        threshold: 0,
        scrollTriggerThreshold: 0.5,
        desktopQuery: "(min-width: 62em)",
        hlsScript: "https://cdn.jsdelivr.net/npm/hls.js@1.7.4/dist/hls.min.js",
        loadTimeout: 15e3,
        preferNativeHls: !1,
        hlsStartLevel: 0,
        preloadHlsJs: !0,
        ...e,
      }),
        (this.videos = new Map()),
        (this.hlsInstances = new Map()),
        (this.globalListeners = []),
        (this.lazyObserver = null),
        (this.viewObserver = null),
        this.init());
    }
    init() {
      ((this.reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      )),
        (this.desktopQuery = window.matchMedia(
          /^\s*\(/.test(this.options.desktopQuery)
            ? this.options.desktopQuery
            : `(min-width: ${this.options.desktopQuery})`,
        )),
        (this.hoverQuery = window.matchMedia(
          "(hover: hover) and (pointer: fine)",
        )),
        (this.prefersReducedMotion = this.reducedMotionQuery.matches),
        (this.lazyObserver = new IntersectionObserver(
          (e) => this.onLazyIntersect(e),
          {
            root: null,
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold,
          },
        )),
        (this.viewObserver = new IntersectionObserver(
          (e) => this.onViewIntersect(e),
          {
            root: null,
            threshold: Array.from({ length: 21 }, (e, t) => t / 20),
          },
        )),
        this.listenGlobal(this.reducedMotionQuery, "change", (e) => {
          ((this.prefersReducedMotion = e.matches),
            this.videos.forEach((t) => {
              e.matches ? t.video.pause() : this.evaluate(t);
            }));
        }),
        this.listenGlobal(this.desktopQuery, "change", () => {
          this.videos.forEach((e) => this.applyBreakpoint(e));
        }),
        this.refresh(),
        this.preloadHls());
    }
    preloadHls() {
      if (!this.options.preloadHlsJs || this.options.preferNativeHls) return;
      if (!window.ManagedMediaSource && !window.MediaSource) return;
      Array.from(this.videos.values()).some(({ video: e }) => {
        const t = e.querySelector("source[data-src]");
        return Boolean(
          (
            e.getAttribute("data-hls-src") ||
            (t && t.getAttribute("data-hls-src")) ||
            ""
          ).trim(),
        );
      }) && this.loadHlsJs().catch(() => {});
    }
    refresh() {
      (this.videos.forEach((e, t) => {
        t.isConnected || this.teardownVideo(t);
      }),
        document.querySelectorAll("video[data-video]").forEach((e) => {
          this.videos.has(e) || this.initVideo(e);
        }));
    }
    initVideo(e) {
      const t = this.getComponentContainer(e),
        i = "true" === e.getAttribute("data-video-hover"),
        r = "true" === e.getAttribute("data-video-scroll-in-play"),
        o = {
          video: e,
          container: t,
          id: null,
          mode: i ? (r ? "hover-scroll" : "hover") : r ? "scroll" : "autoplay",
          desktopOnly: "true" === e.getAttribute("data-video-desktop-only"),
          poster: this.findPoster(e, t),
          playbackWrapper: t
            ? t.querySelector('[data-video-playback="wrapper"]')
            : null,
          visible: !1,
          engaged: !1,
          userPaused: !1,
          hasPlayed: !1,
          hiddenByBreakpoint: !1,
          forceMp4: !1,
          hovering: !1,
          loadFailed: !1,
          loadPromise: null,
          listeners: [],
        };
      ((o.id = this.assignId(o)),
        this.videos.set(e, o),
        (e.muted = !0),
        (e.playsInline = !0),
        this.listen(o, e, "playing", () => this.setPosterVisible(o, !1)),
        this.setupPlayback(o),
        this.setupSound(o),
        this.setupHover(o),
        this.applyAccessibility(o),
        this.applyBreakpoint(o),
        this.lazyObserver.observe(e),
        this.viewObserver.observe(e));
    }
    teardownVideo(e) {
      const t = this.videos.get(e);
      t &&
        (t.listeners.forEach(({ element: e, type: t, handler: i }) => {
          e.removeEventListener(t, i);
        }),
        (t.listeners = []),
        this.lazyObserver && this.lazyObserver.unobserve(e),
        this.viewObserver && this.viewObserver.unobserve(e),
        this.destroyHls(e),
        this.videos.delete(e));
    }
    getComponentContainer(e) {
      return e.closest('[data-video="component"]') || e.parentElement || null;
    }
    assignId(t) {
      const { video: i, container: r } = t;
      let o =
        i.getAttribute("data-video-id") ||
        (r && r.getAttribute("data-video-id")) ||
        "";
      if (!o || this.findStateById(o, i))
        do {
          ((e.idCounter += 1), (o = `video-${e.idCounter}`));
        } while (
          this.findStateById(o, i) ||
          document.querySelector(`[data-video-id="${o}"]:not(video)`)
        );
      return (i.setAttribute("data-video-id", o), o);
    }
    findStateById(e, t) {
      for (const i of this.videos.values())
        if (i.id === e && i.video !== t) return i;
      return null;
    }
    findPoster(e, t) {
      if (t) {
        const e = t.querySelector('[data-video="poster"]');
        if (e) return e;
      }
      let i = e.previousElementSibling;
      for (; i;) {
        if ("PICTURE" === i.tagName || "IMG" === i.tagName) return i;
        i = i.previousElementSibling;
      }
      return t ? t.querySelector("picture, img") : null;
    }
    setPosterVisible(e, t) {
      e.poster && (e.poster.style.display = t ? "" : "none");
    }
    listen(e, t, i, r, o) {
      (t.addEventListener(i, r, o),
        e.listeners.push({ element: t, type: i, handler: r }));
    }
    listenGlobal(e, t, i) {
      (e.addEventListener(t, i),
        this.globalListeners.push({ element: e, type: t, handler: i }));
    }
    onLazyIntersect(e) {
      e.forEach((e) => {
        if (!e.isIntersecting) return;
        const t = this.videos.get(e.target);
        !t ||
          t.loadFailed ||
          this.prefersReducedMotion ||
          t.hiddenByBreakpoint ||
          (this.lazyObserver.unobserve(e.target), this.load(t).catch(() => {}));
      });
    }
    onViewIntersect(e) {
      e.forEach((e) => {
        const t = this.videos.get(e.target);
        if (!t) return;
        const i = e.rootBounds ? e.rootBounds.height : window.innerHeight,
          r = e.boundingClientRect.height || 1,
          o = Math.min(1, i / r),
          s = Math.min(this.options.scrollTriggerThreshold, 0.95 * o);
        ((t.visible = e.isIntersecting && e.intersectionRatio > 0),
          (t.engaged = t.visible && e.intersectionRatio >= s),
          t.visible || t.video.muted || (t.video.muted = !0),
          this.evaluate(t));
      });
    }
    isActive(e) {
      return (
        !(
          this.prefersReducedMotion ||
          e.userPaused ||
          e.hiddenByBreakpoint ||
          e.loadFailed
        ) &&
        ("autoplay" === e.mode ? e.visible : "scroll" === e.mode && e.engaged)
      );
    }
    evaluate(e) {
      const { video: t, mode: i } = e;
      if ("hover" === i || "hover-scroll" === i)
        return (
          e.visible || t.paused || t.pause(),
          void (
            "hover-scroll" !== i ||
            !e.engaged ||
            this.prefersReducedMotion ||
            e.hiddenByBreakpoint ||
            e.loadFailed ||
            this.load(e).catch(() => {})
          )
        );
      this.isActive(e) ? t.paused && this.play(e) : t.paused || t.pause();
    }
    async play(e, { force: t = !1, hover: h = !1 } = {}) {
      const { video: i } = e;
      t && (e.loadFailed = !1);
      try {
        if (
          (await this.load(e), (!t && !this.isActive(e)) || (h && !e.hovering))
        )
          return;
        (e.hasPlayed || "autoplay" === e.mode || (i.currentTime = 0),
          (e.hasPlayed = !0),
          await i.play());
      } catch (r) {
        if (r && "AbortError" === r.name) return;
        if (
          r &&
          "NotSupportedError" === r.name &&
          !e.forceMp4 &&
          this.getMp4Src(i)
        )
          return (
            (e.forceMp4 = !0),
            (e.loadPromise = null),
            this.destroyHls(i),
            i.removeAttribute("src"),
            this.play(e, { force: t, hover: h })
          );
      }
    }
    getMp4Src(e) {
      const t = e.querySelector("source[data-src]");
      return t ? (t.getAttribute("data-src") || "").trim() : "";
    }
    applyBreakpoint(e) {
      if (!e.desktopOnly) return;
      const t = !this.desktopQuery.matches;
      ((e.hiddenByBreakpoint = t),
        (e.video.style.display = t ? "none" : ""),
        t && (e.video.pause(), this.setPosterVisible(e, !0)),
        e.playbackWrapper &&
          ((e.playbackWrapper.style.display = t ? "none" : ""),
          e.playbackWrapper.setAttribute("aria-hidden", t ? "true" : "false")),
        this.evaluate(e));
    }
    applyAccessibility(e) {
      const { container: t, video: i } = e;
      if (!t) return;
      const r = t.querySelector('[data-video-sound="wrapper"]'),
        o = t.querySelector('[data-video-sound="button"]');
      if (!o) return;
      const s = r || o;
      "none" !== window.getComputedStyle(s).display &&
        i.removeAttribute("aria-hidden");
    }
    toggleIcons(e, t) {
      (e &&
        ((e.style.display = "flex"),
        (e.style.visibility = "visible"),
        e.setAttribute("aria-hidden", "true")),
        t &&
          ((t.style.display = "none"),
          (t.style.visibility = "hidden"),
          t.setAttribute("aria-hidden", "true")));
    }
    setupPlayback(e) {
      const { container: t, video: i } = e;
      if (!t) return;
      const r = t.querySelector('[data-video-playback="button"]');
      if (!r) return;
      const o = r.querySelector('[data-video-playback="play"]'),
        s = r.querySelector('[data-video-playback="pause"]'),
        a = () => {
          const e = !i.paused;
          (e ? this.toggleIcons(s, o) : this.toggleIcons(o, s),
            r.setAttribute("aria-label", e ? "Pause video" : "Play video"));
        };
      (a(),
        this.listen(e, r, "click", (t) => {
          (t.preventDefault(),
            t.stopPropagation(),
            i.paused
              ? ((e.userPaused = !1), this.play(e, { force: !0 }))
              : ((e.userPaused = !0), i.pause()));
        }),
        this.listen(e, i, "play", a),
        this.listen(e, i, "pause", a));
    }
    setupSound(e) {
      const { container: t, video: i } = e;
      if (!t) return;
      const r = t.querySelector('[data-video-sound="button"]');
      if (!r) return;
      const o = r.querySelector('[data-video-sound="mute"]'),
        s = r.querySelector('[data-video-sound="unmute"]'),
        a = () => {
          (i.muted ? this.toggleIcons(s, o) : this.toggleIcons(o, s),
            r.setAttribute(
              "aria-label",
              i.muted ? "Unmute video" : "Mute video",
            ));
        };
      (a(),
        this.listen(e, r, "click", (t) => {
          (t.preventDefault(),
            t.stopPropagation(),
            i.muted
              ? (this.videos.forEach((t) => {
                  t !== e && (t.video.muted = !0);
                }),
                (i.muted = !1))
              : (i.muted = !0));
        }),
        this.listen(e, i, "volumechange", a));
    }
    setupHover(e) {
      if ("hover" !== e.mode && "hover-scroll" !== e.mode) return;
      if (!this.hoverQuery.matches) return;
      const t = e.container || e.video;
      (this.listen(e, t, "mouseenter", () => {
        ((e.hovering = !0),
          this.prefersReducedMotion ||
            e.userPaused ||
            e.hiddenByBreakpoint ||
            this.play(e, { force: !0, hover: !0 }));
      }),
        this.listen(e, t, "mouseleave", () => {
          ((e.hovering = !1), e.video.pause());
        }));
    }
    load(e) {
      return (
        e.loadPromise ||
          (e.loadPromise = this.attachSource(e).catch((t) => {
            throw ((e.loadPromise = null), (e.loadFailed = !0), t);
          })),
        e.loadPromise
      );
    }
    async attachSource(e) {
      const { video: t } = e,
        i = t.querySelector("source[data-src]"),
        r = (
          t.getAttribute("data-hls-src") ||
          (i && i.getAttribute("data-hls-src")) ||
          ""
        ).trim(),
        o = this.getMp4Src(t);
      if (r && !e.forceMp4)
        try {
          t.preload = "auto";
          const i = await this.attachHls(t, r);
          return (t.setAttribute("data-video-source-type", i), void 0);
        } catch (i) {
          if (
            (this.destroyHls(t),
            t.removeAttribute("src"),
            (e.forceMp4 = !0),
            !o)
          )
            throw (t.setAttribute("data-video-source-type", "error"), i);
        }
      if (!o) {
        if (t.currentSrc) return;
        throw new Error(`VideoLibrary: no source for "${e.id}"`);
      }
      i.getAttribute("src") !== o &&
        ((t.preload = "auto"), (i.src = o), t.load());
      try {
        (await this.waitForReady(t, i),
          t.setAttribute("data-video-source-type", r ? "mp4-fallback" : "mp4"));
      } catch (e) {
        throw (t.setAttribute("data-video-source-type", "error"), e);
      }
    }
    async attachHls(e, t) {
      const i = !!e.canPlayType("application/vnd.apple.mpegurl");
      if (
        !(!window.ManagedMediaSource && !window.MediaSource) &&
        !this.options.preferNativeHls
      ) {
        let r = null;
        try {
          r = await this.loadHlsJs();
        } catch (e) {
          if (!i) throw e;
        }
        if (r && r.isSupported())
          return (await this.attachHlsJs(e, t, r), "hls.js");
      }
      if (!i) throw new Error("HLS is not supported in this browser");
      return (await this.attachNativeHls(e, t), "hls-native");
    }
    async attachHlsJs(e, t, i) {
      (window.ManagedMediaSource &&
        !window.MediaSource &&
        (e.disableRemotePlayback = !0),
        await new Promise((r, o) => {
          let s = !1;
          const a = new i({
            capLevelToPlayerSize: !0,
            startLevel: this.options.hlsStartLevel,
            maxBufferLength: 15,
            maxMaxBufferLength: 30,
          });
          (this.hlsInstances.set(e, a),
            a.on(i.Events.ERROR, (t, r) => {
              r.fatal &&
                (s
                  ? r.type === i.ErrorTypes.NETWORK_ERROR
                    ? a.startLoad()
                    : r.type === i.ErrorTypes.MEDIA_ERROR
                      ? a.recoverMediaError()
                      : this.destroyHls(e)
                  : o(new Error("HLS error: " + r.details)));
            }),
            a.attachMedia(e),
            a.loadSource(t),
            this.waitForReady(e).then(() => {
              ((s = !0), r());
            }, o));
        }));
    }
    async attachNativeHls(e, t) {
      ((e.src = t), e.load(), await this.waitForReady(e));
    }
    loadHlsJs() {
      return window.Hls
        ? Promise.resolve(window.Hls)
        : (e.hlsPromise ||
            (e.hlsPromise = new Promise((t, i) => {
              const r = document.createElement("script");
              ((r.src = this.options.hlsScript),
                (r.crossOrigin = "anonymous"),
                (r.onload = () => t(window.Hls)),
                (r.onerror = () => {
                  ((e.hlsPromise = null),
                    i(new Error("Failed to load " + this.options.hlsScript)));
                }),
                document.head.appendChild(r));
            })),
          e.hlsPromise);
    }
    destroyHls(e) {
      const t = this.hlsInstances.get(e);
      t && (t.destroy(), this.hlsInstances.delete(e));
    }
    waitForReady(e, t) {
      return new Promise((i, r) => {
        if (e.readyState >= 3) return void i();
        const n = this.options.loadTimeout,
          l =
            n > 0 &&
            setTimeout(() => {
              (o(),
                r(
                  new Error("Timed out loading video: " + (e.currentSrc || "")),
                ));
            }, n),
          o = () => {
            (clearTimeout(l),
              e.removeEventListener("canplay", s),
              e.removeEventListener("error", a),
              t && t.removeEventListener("error", a));
          },
          s = () => {
            (o(), i());
          },
          a = () => {
            (o(), r(new Error("Error loading video: " + (e.currentSrc || ""))));
          };
        (e.addEventListener("canplay", s),
          e.addEventListener("error", a),
          t && t.addEventListener("error", a));
      });
    }
    getState(e) {
      if (e instanceof HTMLVideoElement) return this.videos.get(e) || null;
      const t = String(e),
        i = this.findStateById(t, null);
      if (i) return i;
      const r = document.querySelector(`video[data-video="${CSS.escape(t)}"]`);
      return (r && this.videos.get(r)) || null;
    }
    withState(e, t) {
      const i = this.getState(e);
      if (i) return t(i);
    }
    playVideo(e) {
      return this.withState(
        e,
        (e) => ((e.userPaused = !1), this.play(e, { force: !0 })),
      );
    }
    pauseVideo(e) {
      this.withState(e, (e) => {
        ((e.userPaused = !0), e.video.pause());
      });
    }
    pauseAllVideos() {
      this.videos.forEach((e) => {
        ((e.userPaused = !0), e.video.pause());
      });
    }
    resumeAllVideos() {
      this.videos.forEach((e) => {
        ((e.userPaused = !1), this.evaluate(e));
      });
    }
    muteVideo(e) {
      this.withState(e, (e) => {
        e.video.muted = !0;
      });
    }
    unmuteVideo(e) {
      this.withState(e, (e) => {
        (this.videos.forEach((t) => {
          t !== e && (t.video.muted = !0);
        }),
          (e.video.muted = !1));
      });
    }
    destroy() {
      (Array.from(this.videos.keys()).forEach((e) => this.teardownVideo(e)),
        this.lazyObserver && this.lazyObserver.disconnect(),
        this.viewObserver && this.viewObserver.disconnect(),
        (this.lazyObserver = null),
        (this.viewObserver = null),
        this.globalListeners.forEach(({ element: e, type: t, handler: i }) => {
          e.removeEventListener(t, i);
        }),
        (this.globalListeners = []));
    }
    reinitialize() {
      (this.destroy(), this.init());
    }
  }
  ((e.hlsPromise = null), (e.idCounter = 0), (window.VideoLibrary = e));
  const t = () => {
    window.videoLibrary instanceof e
      ? window.videoLibrary.refresh()
      : document.querySelector("video[data-video]") &&
        (window.videoLibrary = new e(window.VideoLibraryConfig || {}));
  };
  ("loading" === document.readyState
    ? document.addEventListener("DOMContentLoaded", t)
    : t(),
    "undefined" != typeof module && module.exports && (module.exports = e));
})();
