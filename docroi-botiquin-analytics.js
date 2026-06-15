(function () {
  function keywordFor(anchor) {
    const value = `${anchor.href || ""} ${anchor.textContent || ""}`.toLowerCase();
    if (value.includes("pildora") || value.includes("píldora")) return "Pildora";
    if (value.includes("vitamina")) return "Vitamina";
    if (value.includes("medicina")) return "Medicina";
    if (value.includes("kai")) return "Ecuacion KAI";
    if (value.includes("executive")) return "Executive";
    if (value.includes("diagnost")) return "Diagnostico";
    if (value.includes("incompany")) return "Incompany";
    if (value.includes("formacion") || value.includes("formación")) return "Formacion";
    return "Botiquin";
  }

  function areaFor(anchor) {
    const section = anchor.closest("section, header, footer, nav, aside");
    if (!section) return "general";
    return section.id || section.getAttribute("aria-label") || section.className || "general";
  }

  function tagLinks() {
    document.querySelectorAll("a[href]").forEach((anchor, index) => {
      if (!anchor.dataset.analyticsKeyword) anchor.dataset.analyticsKeyword = keywordFor(anchor);
      if (!anchor.dataset.analyticsArea) anchor.dataset.analyticsArea = String(areaFor(anchor)).slice(0, 80);
      if (!anchor.dataset.analyticsLinkId) anchor.dataset.analyticsLinkId = `BOTIQUIN_${String(index + 1).padStart(3, "0")}`;
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tagLinks);
  } else {
    tagLinks();
  }
})();
