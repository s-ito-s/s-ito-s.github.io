
const http = require("http");
const ws = require("ws");
const fs = require("fs");

const wsServer = new ws.Server({ port: 3001 });
wsServer.on('connection', (ws) => {
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });

  ws.on('message', (data) => {
    // console.log(JSON.parse(data));
    wsServer.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(String(data));
      }
    })
  })
})

const httpServer = http.createServer((req, res) => {
  // console.log(`${req.method} ${req.url}`)
  const { method, url } = req
  if (method !== 'GET') {
    res.statusCode = 405
    res.setHeader("Content-Type", "text/plain")
    res.end("Method Not Allowed")
    return
  }

  try {
    if (url === '/MoviePlayer') {
      res.statusCode = 200
      res.setHeader("Content-Type", "text/html")
      const data = fs.readFileSync("MoviePlayer/index.html", "utf8");
      res.end(data)
      return
    } else if (url === '/Logger') {
      res.statusCode = 200
      res.setHeader("Content-Type", "text/html")
      const data = fs.readFileSync("Logger/index.html", "utf8");
      res.end(data)
      return
    } else if (url.includes('MoviePlayer') || url.includes('Logger')) {
      res.statusCode = 200
      res.setHeader("Content-Type", "application/javascript")
      const data = fs.readFileSync(`MoviePlayer${url}`, "utf8");
      res.end(data)
      return
    } else if (url.includes('TimelineViewer')) {
      res.statusCode = 200
      res.setHeader("Content-Type", "application/javascript")
      const data = fs.readFileSync(`Logger${url}`, "utf8");
      res.end(data)
      return
    } 
  } catch (e) {
    console.error(e)
    res.statusCode = 500
    res.setHeader("Content-Type", "text/plain")
    res.end("Internal Server Error")
    return
  }

  res.statusCode = 404
  res.setHeader("Content-Type", "text/plain")
  res.end("Not Found")
})

httpServer.listen(3000, () => {
  console.log("")
  console.log("====================================================")
  console.log("= Server running !!")
  console.log("=  MoviePlayer : http://localhost:3000/MoviePlayer")
  console.log("=  Logger : http://localhost:3000/Logger")
  console.log("====================================================")
  console.log("")
})

