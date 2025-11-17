let rootHandle: FileSystemDirectoryHandle | null = null;

export const isSupported = () => 'storage' in navigator && 'getDirectory' in navigator.storage;

export const initializeFileSystem = async () => {
  if (!isSupported()) {
    throw new Error('Origin Private File System is not supported in this browser.');
  }
  
  // 1. Get the root of the sandboxed Origin Private File System.
  const opfsRoot = await navigator.storage.getDirectory();

  // 2. Create a '/data' subdirectory and set it as the root for all app operations.
  rootHandle = await opfsRoot.getDirectoryHandle('data', { create: true });


  // 3. Ensure functional subdirectories exist within the '/data' folder.
  await getDirectoryHandle('invoices', true);
  await getDirectoryHandle('expenses', true);
  await getDirectoryHandle('customers', true);
  await getDirectoryHandle('recurring-expenses', true);
  await getDirectoryHandle('projects', true);
  await getDirectoryHandle('services', true);
};

async function getDirectoryHandle(path: string, create = false): Promise<FileSystemDirectoryHandle> {
    if (!rootHandle) throw new Error('File system not initialized.');
    const parts = path.split('/').filter(p => p);
    let currentHandle: FileSystemDirectoryHandle = rootHandle;
    for (const part of parts) {
        currentHandle = await currentHandle.getDirectoryHandle(part, { create });
    }
    return currentHandle;
}

async function getFileHandle(path: string, create = false): Promise<FileSystemFileHandle> {
    const parts = path.split('/');
    const fileName = parts.pop();
    if (!fileName) throw new Error('Invalid file path');
    const dirHandle = await getDirectoryHandle(parts.join('/'), create);
    return await dirHandle.getFileHandle(fileName, { create });
}


export const writeFile = async (path: string, content: object): Promise<void> => {
    const fileHandle = await getFileHandle(path, true);
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(content, null, 2));
    await writable.close();
};

export const readFile = async <T>(path: string): Promise<T> => {
    const fileHandle = await getFileHandle(path, false);
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content) as T;
};


export const readDirectory = async (path: string): Promise<string[]> => {
    const dirHandle = await getDirectoryHandle(path);
    const fileNames: string[] = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
            fileNames.push(entry.name);
        }
    }
    return fileNames;
};


export const deleteFile = async (path: string): Promise<void> => {
    const parts = path.split('/');
    const fileName = parts.pop();
    if (!fileName) throw new Error('Invalid file path');
    const dirHandle = await getDirectoryHandle(parts.join('/'));
    await dirHandle.removeEntry(fileName);
};