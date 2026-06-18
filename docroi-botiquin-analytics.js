(function () {
  var COLLECTOR_URL = "https://script.google.com/macros/s/AKfycbzioIpdbYIpKpdRxYkeRM_w51NGvjArWjISvhxKZeBzdRackyKIImJ_Wp4p9Niojkw6rw/exec";
  var APP_NAME = "botiquin";

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  }

  function safeStorage(storage, key, fallback) {
    try {
      var current = storage.getItem(key);
      if (current) return current;
      storage.setItem(key, fallback);
      return fallback;
    } catch (error) {
      return fallback;
    }
  }

  var browserId = safeStorage(localStorage, "docroi_browser_id", uid("browser"));
  var sessionId = safeStorage(sessionStorage, "docroi_session_id", uid("session"));
  var visitId = uid("visit");
  var maxScroll = 0;
  var activeSeconds = 0;

  function keywordForText(text, href) {
    var value = String((text || "") + " " + (href || "")).toLowerCase();
    if (value.indexOf("pildora") >= 0 || value.indexOf("píldora") >= 0) return "Pildora";
    if (value.indexOf("vitamina") >= 0) return "Vitamina";
    if (value.indexOf("medicina") >= 0) return "Medicina";
    if (value.indexOf("kai") >= 0) return "Ecuacion KAI";
    if (value.indexOf("executive") >= 0) return "Executive";
    if (value.indexOf("diagnost") >= 0) return "Diagnostico";
    if (value.indexOf("incompany") >= 0 || value.indexOf("in-company") >= 0) return "Incompany";
    if (value.indexOf("formacion") >= 0 || value.indexOf("formación") >= 0) return "Formacion";
    if (value.indexOf("consulta") >= 0) return "Consulta";
    return "Botiquin";
  }

  function keywordId(keyword) {
    return "KW_" + String(keyword || "SIN_KEYWORD")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toUpperCase();
  }

  function areaFor(element) {
    var section = element && element.closest ? element.closest("section, header, footer, nav, aside") : null;
    if (!section) return "general";
    return section.id || section.getAttribute("aria-label") || String(section.className || "general").slice(0, 90);
  }

  function destinationType(href) {
    try {
      var url = new URL(href, location.href);
      return url.hostname === location.hostname ? "internal" : "external";
    } catch (error) {
      return "unknown";
    }
  }

  function baseEvent(eventType) {
    var now = new Date().toISOString();
    var url = new URL(location.href);
    return {
      event_id: uid("evt"),
      timestamp: now,
      event_date: now.slice(0, 10),
      app_name: APP_NAME,
      event_type: eventType,
      browser_id: browserId,
      session_id: sessionId,
      visit_id: visitId,
      page_url: location.href,
      page_path: location.pathname,
      page_title: document.title,
      referrer: document.referrer || "",
      keyword: "Botiquin",
      keyword_id: "KW_BOTIQUIN",
      utm_source: url.searchParams.get("utm_source") || "",
      utm_medium: url.searchParams.get("utm_medium") || "",
      utm_campaign: url.searchParams.get("utm_campaign") || "",
      utm_content: url.searchParams.get("utm_content") || "",
      utm_term: url.searchParams.get("utm_term") || "",
      language: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen_width: window.screen ? window.screen.width : "",
      screen_height: window.screen ? window.screen.height : "",
      active_seconds: activeSeconds,
      total_active_seconds: activeSeconds,
      depth_percent: maxScroll
    };
  }

  function sendEvent(event) {
    var payload = JSON.stringify({ type: "analytics_event", event: event });
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
        navigator.sendBeacon(COLLECTOR_URL, blob);
        return;
      }
    } catch (error) {}

    try {
      fetch(COLLECTOR_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payload,
        keepalive: true
      });
    } catch (error) {}
  }

  function tagLinks() {
    document.querySelectorAll("a[href]").forEach(function (anchor, index) {
      var keyword = anchor.dataset.docroiKeyword || anchor.dataset.analyticsKeyword || keywordForText(anchor.textContent, anchor.href);
      anchor.dataset.docroiKeyword = keyword;
      anchor.dataset.docroiKeywordId = keywordId(keyword);
      anchor.dataset.docroiArea = anchor.dataset.analyticsArea || areaFor(anchor);
      anchor.dataset.docroiLinkId = anchor.dataset.analyticsLinkId || "BOTIQUIN_" + String(index + 1).padStart(3, "0");
    });
  }

  function trackPageView() {
    sendEvent(baseEvent("page_view"));
  }

  function trackLink(anchor) {
    var keyword = anchor.dataset.docroiKeyword || keywordForText(anchor.textContent, anchor.href);
    var event = baseEvent("link_click");
    event.keyword = keyword;
    event.keyword_id = anchor.dataset.docroiKeywordId || keywordId(keyword);
    event.button_id = anchor.dataset.docroiLinkId || "";
    event.button_text = String(anchor.textContent || "").trim().slice(0, 180);
    event.button_keyword = keyword;
    event.section_id = anchor.dataset.docroiArea || areaFor(anchor);
    event.section_name = anchor.dataset.docroiArea || areaFor(anchor);
    event.destination_url = anchor.href || "";
    event.destination_domain = event.destination_url ? new URL(event.destination_url, location.href).hostname : "";
    event.destination_type = destinationType(event.destination_url);
    sendEvent(event);
  }

  function updateScrollDepth() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop || 0;
    var height = Math.max(1, doc.scrollHeight - window.innerHeight);
    maxScroll = Math.max(maxScroll, Math.round((scrollTop / height) * 100));
  }

  setInterval(function () { activeSeconds += 5; }, 5000);
  window.addEventListener("scroll", updateScrollDepth, { passive: true });
  window.addEventListener("beforeunload", function () {
    var event = baseEvent("session_summary");
    event.depth_percent = maxScroll;
    event.active_seconds = activeSeconds;
    event.total_active_seconds = activeSeconds;
    sendEvent(event);
  });

  document.addEventListener("click", function (event) {
    var anchor = event.target.closest && event.target.closest("a[href]");
    if (anchor) trackLink(anchor);
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      tagLinks();
      trackPageView();
    });
  } else {
    tagLinks();
    trackPageView();
  }
})();