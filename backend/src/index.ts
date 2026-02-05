require('dotenv').config()
import express, { Express } from "express";
const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route imports
const chat = require("./routes/chat");

// routes
app.use("/api/chat", chat);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})