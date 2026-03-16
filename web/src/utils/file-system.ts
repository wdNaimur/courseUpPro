export async function scanDirectory(
  handle: FileSystemDirectoryHandle,
  path = ""
): Promise<File[]> {
  const files: File[] = [];
  
  // @ts-expect-error File System Access API values() is supported in modern browsers
  for await (const entry of handle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    
    if (entry.kind === "file") {
      const file = await entry.getFile();
      // We need to attach webkitRelativePath manually since File System Access API 
      // File objects don't have it by default, and our app uses it.
      Object.defineProperty(file, "webkitRelativePath", {
        value: entryPath,
        writable: false,
      });
      files.push(file);
    } else if (entry.kind === "directory") {
      const subFiles = await scanDirectory(entry, entryPath);
      files.push(...subFiles);
    }
  }
  
  return files;
}

export async function verifyPermission(handle: FileSystemHandle): Promise<boolean> {
  const options = { mode: "read" } as const;
  
  // Check if permission was already granted
  // @ts-expect-error File System Access API
  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }
  
  // Request permission
  // @ts-expect-error File System Access API
  if ((await handle.requestPermission(options)) === "granted") {
    return true;
  }
  
  return false;
}

export async function verifyReadWritePermission(
  handle: FileSystemHandle,
): Promise<boolean> {
  const options = { mode: "readwrite" } as const;

  // @ts-expect-error File System Access API
  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }

  // @ts-expect-error File System Access API
  if ((await handle.requestPermission(options)) === "granted") {
    return true;
  }

  return false;
}

export async function readHandleFileText(
  handle: FileSystemDirectoryHandle,
  fileName: string,
): Promise<string | null> {
  try {
    const fileHandle = await handle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

export async function writeHandleTextFile(
  handle: FileSystemDirectoryHandle,
  fileName: string,
  content: string,
): Promise<void> {
  const fileHandle = await handle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

export async function writeHandleDataUrlFile(
  handle: FileSystemDirectoryHandle,
  fileName: string,
  dataUrl: string,
): Promise<void> {
  const fileHandle = await handle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(dataUrlToBlob(dataUrl));
  await writable.close();
}

export async function removeHandleEntryIfExists(
  handle: FileSystemDirectoryHandle,
  entryName: string,
): Promise<void> {
  try {
    await handle.removeEntry(entryName);
  } catch {
    return;
  }
}
