import { v2 as cloudinary } from "cloudinary";
import { env } from "~/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadSingleFile(
  file: {
    file: string;
    fileType: string;
    fileName: string;
  },
  folder: string,
) {
  const res = await cloudinary.uploader.upload(
    `data:${file.fileType};base64,${file.file}`,
    {
      folder,
      public_id: `${Date.now()} - ${file.fileName}`,
      resource_type: "auto",
      use_filename: true,
      type: "upload",
    },
  );

  if (!res.secure_url) {
    throw new Error("File upload failed");
  }

  return res.secure_url;
}
