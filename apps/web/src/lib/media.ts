import { apiFetch } from "./api";

export async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function uploadMedia(file: File, bucket = "yowl-media") {
  const dataUrl = await fileToDataUrl(file);
  return apiFetch<{ bucket: string; path: string; mimeType: string; url: string }>("/media/upload", {
    method: "POST",
    body: JSON.stringify({
      dataUrl,
      fileName: file.name,
      bucket
    })
  });
}
