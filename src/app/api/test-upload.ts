import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, (err, _fields, files) => {
    if (err) {
      console.error("❌ Lỗi parse form:", err);
      return res.status(500).json({ message: "Lỗi khi xử lý form" });
    }
  
    const rawFile = files.file;
    const file = Array.isArray(rawFile) ? rawFile[0] : rawFile;
  
    if (!file || !file.filepath || !file.originalFilename) {
      return res.status(400).json({ message: "Không có file hợp lệ" });
    }
  
    const uploadDir = path.join(process.cwd(), "public", "upload");
    fs.mkdirSync(uploadDir, { recursive: true });
  
    const fileName = `${Date.now()}_${file.originalFilename}`;
    const newPath = path.join(uploadDir, fileName);
    fs.renameSync(file.filepath, newPath);
  
    const fileUrl = `/upload/${fileName}`;
    return res.status(200).json({ url: fileUrl });
  });
  
}
