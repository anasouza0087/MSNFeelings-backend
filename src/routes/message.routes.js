const express = require("express");
const messageController = require("../controllers/message.controller");

const router = express.Router();

router.post("/", messageController.createMessage);
router.get("/:chatroomId", messageController.listMessagesByChatroom);

module.exports = router;
