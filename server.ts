/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fetch shared album API
  app.post("/api/fetch-shared-album", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Yêu cầu cung cấp đường dẫn liên kết của Album Google Photos." });
    }

    try {
      // Logic for scraping Google Photos shared album
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });

      if (!response.ok) {
        return res.status(400).json({ error: "Không thể kết nối đến liên kết. Hãy đảm bảo bạn đã cấp quyền chia sẻ công khai cho Album." });
      }

      const html = await response.text();
      
      // Match googleusercontent.com image urls with regular expressions
      const pwMatches = Array.from(html.matchAll(/https:\/\/lh[3-6]\.googleusercontent\.com\/pw\/([a-zA-Z0-9_-]+)/g)).map(m => m[0]);
      const standardMatches = Array.from(html.matchAll(/https:\/\/lh[3-6]\.googleusercontent\.com\/([a-zA-Z0-9_-]+)/g)).map(m => m[0]);
      
      // Combine and filter unique listings
      const allMatches = [...pwMatches, ...standardMatches];
      const uniqueBaseUrls = Array.from(new Set(allMatches)).filter(link => link.length > 60);

      if (uniqueBaseUrls.length === 0) {
        return res.status(400).json({ error: "Không tìm thấy hình ảnh nào trong Album này. Hãy đảm bảo liên kết là một Album chia sẻ Google Photos công khai và có chứa ảnh." });
      }

      // Extract details
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || 
                       html.match(/<title>([^<]+)<\/title>/i);
      const albumTitle = titleMatch ? titleMatch[1].replace(' - Google Photos', '').trim() : 'Album Kỷ Niệm Gia Đình';

      const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
      const coverUrl = ogImageMatch ? ogImageMatch[1] : `${uniqueBaseUrls[0]}=w600-h400-c`;

      // We map the parsed URLs. Remove duplicate sequences that are typically avatar/profile photos
      // Google Photos CDN direct item URLs are extremely long (often >= 80 chars, often > 100).
      // Let's filter out known static UI icons if any.
      const filteredUrls = uniqueBaseUrls.filter(u => {
        // Exclude profile photo patterns if needed
        return !u.includes('placeholder') && !u.includes('avatar');
      });

      const parsedPhotos = filteredUrls.map((baseUrl, idx) => {
        return {
          id: `gp-${idx}-${Date.now()}`,
          url: `${baseUrl}=w1200-h800`,
          title: `Khoảnh khắc #${idx + 1}`,
          location: albumTitle,
          year: new Date().getFullYear(),
          description: `Hình ảnh được kết nối trực tiếp từ đám mây gia đình.`
        };
      });

      return res.json({
        id: `gp-album-${Date.now()}`,
        name: albumTitle,
        year: new Date().getFullYear(),
        coverUrl: coverUrl,
        photosCount: parsedPhotos.length,
        description: `Album đồng bộ trực tiếp từ liên kết Google Photos: "${albumTitle}".`,
        photos: parsedPhotos
      });

    } catch (err: any) {
      console.error("Fetch shared album issue:", err);
      return res.status(500).json({ error: "Có lỗi xảy ra khi đồng bộ hình ảnh: " + err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
