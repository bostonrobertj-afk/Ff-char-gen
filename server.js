import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.raw({ type: "*/*" }));

app.all("*", async (req, res) => {
  const url = "https://workspace.bostonrobertj.replit.app" + req.url;
  try {
    const resp = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
    });
    res.status(resp.status);
    resp.headers.forEach((v, k) => res.set(k, v));
    resp.body.pipe(res);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
