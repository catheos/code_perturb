import express, { Express } from "express";
const app = express();
const port = 3000;

// route imports
const chat = require("./routes/chat");

// routes
app.use("/api/chat", chat);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})