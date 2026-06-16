import { readFileSync, writeFileSync } from "node:fs";

const file = "index.html";
const analyticsBaseUrl = process.env.DOCROI_ANALYTICS_BASE_URL || "https://bsc-doc-roi.vercel.app";
const html = readFileSync(file, "utf8");

const start = "<!-- DOCROI_ANALYTICS_START -->";
const end = "<!-- DOCROI_ANALYTICS_END -->";

const snippet = `${start}
<script>
  window.DocROIAnalytics = {
    sourceSite: "Botiquin",
    endpoint: "${analyticsBaseUrl}/api/collect"
  };
</script>
<script src="./docroi-botiquin-analytics.js" defer></script>
<script src="${analyticsBaseUrl}/tracker.js" defer></script>
${end}`;

const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
let next = pattern.test(html) ? html.replace(pattern, snippet) : html.replace("</body>", `${snippet}\n</body>`);

if (next === html) {
  console.log("Doc ROI analytics snippet already up to date.");
} else {
  writeFileSync(file, next, "utf8");
  console.log("Doc ROI analytics snippet injected.");
}
