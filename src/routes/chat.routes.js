const express = require("express")
const chatController = require("../controllers/chat.controller")
// const chatroomController = require("../controllers/chatroom.controller");
// import * as chatroomController from "../controllers/chatroom.controller";

const router = express.Router()

router.post("/", chatController.createChatroom)
router.get("/", chatController.listChatrooms)
router.get("/:chatroomId", chatController.getChatroomById)
router.delete("/:chatroomId", chatController.DeleteChatroom)
// router.get("/with-previews", chatroomController.getChatroomsWithPreviews);
// router.patch("/:id/read", chatroomController.markAsRead);

module.exports = router
