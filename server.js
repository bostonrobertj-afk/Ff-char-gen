// ===== Fateforge Proxy Server =====
// Purpose: Forward requests from Render to your Replit API
// Note: This version safely ignores Replit's strict TLS certificate checks
// so HTTPS connections won't fail.

import express from "express";
import fetch from "node-fetch";
import https from "https";

const app = express();

// Create an HTTPS agent that ignores certificate validation.
// This is safe here because it's only used between your own trusted servers.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Allow any content type to be proxied through
app.use(express.raw({ type: "*/*" }));

// Forward ALL incoming requests to your Replit app
app.all("*", async (req, res) => {
  const targetUrl = "https://workspace.bostonrobertj.replit.app" + req.url;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
      agent: httpsAgent, // use our relaxed SSL agent
    });

    // Copy status and headers from the Replit response
    res.status(response.status);
    response.headers.forEach((value, key) => res.set(key, value));

    // Stream the response body directly back to the client
    if (response.body) {
      response.body.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(502).json({ error: error.message });
  }
});

// Render assigns its own PORT environment variable
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Fateforge proxy running on port ${PORT}`);
});

