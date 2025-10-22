const express = require("express")
const uploaderController = require("../controllers/uploader.controller")

const router = express.Router()

router.post("/", uploaderController.uploadFile)

module.exports = router
