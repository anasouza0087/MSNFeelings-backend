import { Router } from "express";
import * as chatroomController from "../controllers/_DEPRECATED_chatroom.controller";

const router = Router();

router.get("/with-previews", chatroomController.getChatroomsWithPreviews);
router.patch("/:id/read", chatroomController.markAsRead);

export default router;
