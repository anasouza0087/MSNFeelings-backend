const express = require("express")
const chatController = require("../controllers/chat.controller")

const router = express.Router()

router.post("/", chatController.createChatroom)
router.get("/", chatController.listChatrooms)
router.get("/:chatroomId", chatController.getChatroomById)
router.delete("/:chatroomId", chatController.DeleteChatroom)

module.exports = router
