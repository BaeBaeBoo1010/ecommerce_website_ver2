// ✅ Security: File validation utilities

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Maximum file size (10MB in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Maximum number of files per upload
const MAX_FILES_PER_UPLOAD = 10;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * ✅ Security: Validate file type
 */
export function validateFileType(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Additional check: verify file extension matches MIME type
  const extension = file.name.split(".").pop()?.toLowerCase();
  const typeExtensionMap: Record<string, string[]> = {
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
  };

  const allowedExtensions = typeExtensionMap[file.type] || [];
  if (extension && !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: "File extension does not match file type",
    };
  }

  return { valid: true };
}

/**
 * ✅ Security: Validate file size
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * ✅ Security: Validate multiple files
 */
export function validateFiles(files: File[]): FileValidationResult {
  if (files.length === 0) {
    return {
      valid: false,
      error: "No files provided",
    };
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES_PER_UPLOAD} files allowed per upload`,
    };
  }

  for (const file of files) {
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }
  }

  return { valid: true };
}

/**
 * ✅ Security: Sanitize product code to prevent path traversal
 */
export function sanitizeProductCode(productCode: string): string {
  // Remove any path traversal attempts
  return productCode
    .replace(/\.\./g, "")
    .replace(/[\/\\]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 50); // Limit length
}

