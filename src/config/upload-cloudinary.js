import dotenv from "dotenv"
dotenv.config()

import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import multer from "multer"

console.log("Cloudinary API_KEY:", process.env.CLOUDINARY_API_KEY)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "msnfeelings_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
})

export const upload = multer({ storage })
