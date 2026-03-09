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
