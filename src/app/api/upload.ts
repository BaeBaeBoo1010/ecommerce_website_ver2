import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

// ✅ Tắt bodyParser mặc định của Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ API handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Lỗi parse form:", err);
      return res.status(500).json({ message: "Lỗi khi xử lý form" });
    }

    const file = files.file as FormidableFile | FormidableFile[] | undefined;
    const productID = fields.productID?.toString().trim();

    if (!productID) {
      return res.status(400).json({ message: "Thiếu mã sản phẩm" });
    }

    const uploadedFile = Array.isArray(file) ? file[0] : file;
    if (!uploadedFile || !uploadedFile.filepath || !uploadedFile.originalFilename) {
      return res.status(400).json({ message: "Không có file hợp lệ" });
    }

    // ✅ Tạo thư mục đích
    const uploadDir = path.join(process.cwd(), "public", "upload", productID);
    fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}_${uploadedFile.originalFilename}`;
    const newFilePath = path.join(uploadDir, fileName);

    // ✅ Di chuyển file
    fs.renameSync(uploadedFile.filepath, newFilePath);

    const fileUrl = `/upload/${productID}/${fileName}`;
    return res.status(200).json({ url: fileUrl });
  });
}
