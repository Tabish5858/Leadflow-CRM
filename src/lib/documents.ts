import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
  FileArchive,
  FileCode,
  FileType,
  type LucideIcon,
} from "lucide-react";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getFileIcon(fileType: string): LucideIcon {
  if (fileType === "image") return Image;
  if (fileType === "pdf") return FileText;
  if (fileType === "spreadsheet") return FileSpreadsheet;
  if (fileType === "document") return FileText;
  if (fileType === "text") return FileType;
  if (fileType === "code") return FileCode;
  if (fileType === "archive") return FileArchive;
  return File;
}

export function canPreview(fileType: string): boolean {
  return fileType === "image" || fileType === "pdf";
}
