var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
function extractJsonArray(text, startIndex) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"' || char === "'") {
      if (!inString) {
        inString = true;
      } else {
        inString = false;
      }
      continue;
    }
    if (!inString) {
      if (char === "[") {
        depth++;
      } else if (char === "]") {
        depth--;
        if (depth === 0) {
          return text.substring(startIndex, i + 1);
        }
      }
    }
  }
  return null;
}
function hasVideoDuration(array) {
  for (let i = 2; i < array.length; i++) {
    const el = array[i];
    if (Array.isArray(el)) {
      if (el.length >= 1 && typeof el[0] === "number" && el[0] > 500 && el[0] < 72e5 && el.length <= 10 && el.every((item) => typeof item === "number")) {
        return true;
      }
      if (hasVideoDuration(el)) return true;
    }
  }
  return false;
}
function findMediaItems(obj, list = []) {
  if (!obj) return list;
  if (Array.isArray(obj)) {
    if (obj.length >= 2 && Array.isArray(obj[1]) && typeof obj[1][0] === "string" && obj[1][0].startsWith("https://") && obj[1][0].includes("googleusercontent.com")) {
      const baseUrl = obj[1][0];
      let isVideo = false;
      if (obj[9] && Array.isArray(obj[9]) && typeof obj[9][0] === "number" && obj[9][0] > 0) {
        isVideo = true;
      } else if (obj[12] && Array.isArray(obj[12]) && typeof obj[12][0] === "number" && obj[12][0] > 0) {
        isVideo = true;
      } else if (obj[15] && Array.isArray(obj[15]) && typeof obj[15][0] === "number" && obj[15][0] > 0) {
        isVideo = true;
      }
      if (!isVideo) {
        isVideo = hasVideoDuration(obj);
      }
      list.push({
        baseUrl,
        isVideo,
        width: typeof obj[1][1] === "number" ? obj[1][1] : 1200,
        height: typeof obj[1][2] === "number" ? obj[1][2] : 800
      });
    } else {
      for (const child of obj) {
        findMediaItems(child, list);
      }
    }
  } else if (typeof obj === "object") {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        findMediaItems(obj[key], list);
      }
    }
  }
  return list;
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.use(import_express.default.json());
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.post("/api/fetch-shared-album", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Y\xEAu c\u1EA7u cung c\u1EA5p \u0111\u01B0\u1EDDng d\u1EABn li\xEAn k\u1EBFt c\u1EE7a Album Google Photos." });
    }
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (!response.ok) {
        return res.status(400).json({ error: "Kh\xF4ng th\u1EC3 k\u1EBFt n\u1ED1i \u0111\u1EBFn li\xEAn k\u1EBFt. H\xE3y \u0111\u1EA3m b\u1EA3o b\u1EA1n \u0111\xE3 c\u1EA5p quy\u1EC1n chia s\u1EBB c\xF4ng khai cho Album." });
      }
      const html = await response.text();
      const fetchedPhotos = [];
      const searchStr = "AF_initDataCallback";
      let pos = html.indexOf(searchStr);
      while (pos !== -1) {
        const blockEnd = html.indexOf("});", pos);
        const targetSearchArea = blockEnd !== -1 ? html.substring(pos, blockEnd + 3) : html.substring(pos, pos + 4e3);
        const dataIndex = targetSearchArea.indexOf("data:");
        if (dataIndex !== -1) {
          const arrayStartIndex = targetSearchArea.indexOf("[", dataIndex);
          if (arrayStartIndex !== -1) {
            const absoluteStartIndex = pos + arrayStartIndex;
            const extractedArrayText = extractJsonArray(html, absoluteStartIndex);
            if (extractedArrayText) {
              try {
                const rawData = JSON.parse(extractedArrayText);
                findMediaItems(rawData, fetchedPhotos);
              } catch (err) {
              }
            }
          }
        }
        pos = html.indexOf(searchStr, pos + 1);
      }
      const seenBaseUrls = /* @__PURE__ */ new Set();
      const deduplicatedPhotos = fetchedPhotos.filter((item) => {
        if (seenBaseUrls.has(item.baseUrl)) return false;
        seenBaseUrls.add(item.baseUrl);
        return true;
      });
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
      const albumTitle = titleMatch ? titleMatch[1].replace(" - Google Photos", "").trim() : "Album K\u1EF7 Ni\u1EC7m Gia \u0110\xECnh";
      let parsedPhotos = [];
      if (deduplicatedPhotos.length > 0) {
        parsedPhotos = deduplicatedPhotos.map((item, idx) => {
          return {
            id: `gp-${idx}-${Date.now()}`,
            url: item.isVideo ? `${item.baseUrl}=dv` : `${item.baseUrl}=w1200-h800`,
            thumbnailUrl: `${item.baseUrl}=w600-h400-c`,
            type: item.isVideo ? "video" : "image",
            title: item.isVideo ? `Video K\u1EF7 Ni\u1EC7m #${idx + 1}` : `Kho\u1EA3nh kh\u1EAFc #${idx + 1}`,
            location: albumTitle,
            year: (/* @__PURE__ */ new Date()).getFullYear(),
            description: item.isVideo ? `Video gia \u0111\xECnh ph\xE1t tr\u1EF1c ti\u1EBFp t\u1EEB \u0111\xE1m m\xE2y (Google Cloud).` : `H\xECnh \u1EA3nh \u0111\u01B0\u1EE3c k\u1EBFt n\u1ED1i tr\u1EF1c ti\u1EBFp t\u1EEB \u0111\xE1m m\xE2y gia \u0111\xECnh.`
          };
        });
      } else {
        const allMatches = [];
        const subpathMatches = Array.from(html.matchAll(/https:\/\/lh\d+\.googleusercontent\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]{50,})/g)).map((m) => m[0]);
        allMatches.push(...subpathMatches);
        const directMatches = Array.from(html.matchAll(/https:\/\/lh\d+\.googleusercontent\.com\/([a-zA-Z0-9_-]{50,})/g)).map((m) => m[0]);
        allMatches.push(...directMatches);
        const baseUrls = allMatches.map((url2) => url2.split("=")[0]);
        const uniqueBaseUrls = Array.from(new Set(baseUrls)).filter((u) => {
          return !u.includes("placeholder") && !u.includes("avatar") && !u.includes("profile");
        });
        if (uniqueBaseUrls.length === 0) {
          return res.status(400).json({ error: "Kh\xF4ng t\xECm th\u1EA5y h\xECnh \u1EA3nh n\xE0o trong Album n\xE0y. H\xE3y \u0111\u1EA3m b\u1EA3o li\xEAn k\u1EBFt l\xE0 m\u1ED9t Album chia s\u1EBB Google Photos c\xF4ng khai v\xE0 c\xF3 ch\u1EE9a \u1EA3nh." });
        }
        parsedPhotos = uniqueBaseUrls.map((baseUrl, idx) => {
          return {
            id: `gp-${idx}-${Date.now()}`,
            url: `${baseUrl}=w1200-h800`,
            thumbnailUrl: `${baseUrl}=w600-h400-c`,
            type: "image",
            // defaults to image under simple scraper
            title: `Kho\u1EA3nh kh\u1EAFc #${idx + 1}`,
            location: albumTitle,
            year: (/* @__PURE__ */ new Date()).getFullYear(),
            description: `H\xECnh \u1EA3nh k\u1EF7 ni\u1EC7m k\u1EBFt n\u1ED1i t\u1EEB \u0111\xE1m m\xE2y.`
          };
        });
      }
      const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
      const firstBaseUrl = fetchedPhotos[0]?.baseUrl || parsedPhotos[0]?.url.split("=")[0];
      const coverUrl = ogImageMatch ? ogImageMatch[1].split("=")[0] + "=w600-h400-c" : `${firstBaseUrl}=w600-h400-c`;
      return res.json({
        id: `gp-album-${Date.now()}`,
        name: albumTitle,
        year: (/* @__PURE__ */ new Date()).getFullYear(),
        coverUrl,
        photosCount: parsedPhotos.length,
        description: `Album \u0111\u1ED3ng b\u1ED9 tr\u1EF1c ti\u1EBFp t\u1EEB li\xEAn k\u1EBFt Google Photos: "${albumTitle}".`,
        photos: parsedPhotos
      });
    } catch (err) {
      console.error("Fetch shared album issue:", err);
      return res.status(500).json({ error: "C\xF3 l\u1ED7i x\u1EA3y ra khi \u0111\u1ED3ng b\u1ED9 h\xECnh \u1EA3nh: " + err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
