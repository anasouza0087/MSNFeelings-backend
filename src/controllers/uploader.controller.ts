import { Request, Response } from "express"
import { upload } from "../config/upload-cloudinary"

export const uploadFile = (req: Request, res: Response) => {
  console.log(upload)
  const uploader = upload.single("image") // agora upload.single existe

  uploader(req, res, (err) => {
    if (err) {
      console.error("Erro no upload:", err)
      return res.status(500).json({ error: "Falha no upload da imagem." })
    }

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado." })
    }

    res.status(200).json({
      imageUrl: req.file.path,
      message: "Upload realizado com sucesso!",
    })
  })
}
