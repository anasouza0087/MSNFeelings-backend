const express = require("express")
const cors = require("cors")
const userRoutes = require("./routes/user.routes")
const chatRoutes = require("./routes/chat.routes")
const messageRoutes = require("./routes/message.routes")
const uploaderRoutes = require("./routes/uploader.routes")

// Antes das rotas

import { connectToDatabase } from "./config/database"

const app = express()
app.use(
  cors({
    origin: "http://localhost:5173",
  })
)
const PORT = process.env.PORT || 5000

app.use(express.json())

app.get("/", (req, res) => {
  res.send("API está online!")
})

app.use("/users", userRoutes)
app.use("/chatroom", chatRoutes)
app.use("/messages", messageRoutes)
app.use("/api/upload", uploaderRoutes)

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
  })
})
