import { IFileSystemService } from "../types";

declare const JSZip: any;

let rootHandle: FileSystemDirectoryHandle | null = null;
const ROOT_DIR_NAME = 'easy-office-data';

const browserIsSupported = () => 'storage' in navigator && 'getDirectory' in navigator.storage;

const initialize = async () => {
  if (!browserIsSupported()) {
    throw new Error('Origin Private File System is not supported in this browser.');
  }
  
  const opfsRoot = await navigator.storage.getDirectory();
  rootHandle = await opfsRoot.getDirectoryHandle(ROOT_DIR_NAME, { create: true });

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

const writeFile = async (path: string, content: object): Promise<void> => {
    const fileHandle = await getFileHandle(path, true);
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(content, null, 2));
    await writable.close();
};

const readFile = async <T>(path: string): Promise<T> => {
    const fileHandle = await getFileHandle(path, false);
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content) as T;
};

const readDirectory = async (path: string): Promise<string[]> => {
    const dirHandle = await getDirectoryHandle(path);
    const fileNames: string[] = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
            fileNames.push(entry.name);
        }
    }
    return fileNames;
};

const deleteFile = async (path: string): Promise<void> => {
    const parts = path.split('/');
    const fileName = parts.pop();
    if (!fileName) throw new Error('Invalid file path');
    const dirHandle = await getDirectoryHandle(parts.join('/'));
    await dirHandle.removeEntry(fileName);
};

// --- Import/Export ---

async function recursiveZip(handle: FileSystemDirectoryHandle, zipFolder: any) {
    for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
            // FIX: Property 'getFile' does not exist on type 'FileSystemHandle'.
            // TypeScript's type narrowing doesn't work correctly inside a for-await-of loop with FileSystemHandle.
            // We explicitly cast `entry` to `FileSystemFileHandle`.
            const file = await (entry as FileSystemFileHandle).getFile();
            zipFolder.file(entry.name, await file.arrayBuffer());
        } else if (entry.kind === 'directory') {
            const subFolder = zipFolder.folder(entry.name);
            // FIX: Argument of type 'FileSystemHandle' is not assignable to parameter of type 'FileSystemDirectoryHandle'.
            // TypeScript's type narrowing doesn't work correctly inside a for-await-of loop with FileSystemHandle.
            // We explicitly cast `entry` to `FileSystemDirectoryHandle`.
            await recursiveZip(entry as FileSystemDirectoryHandle, subFolder);
        }
    }
}

const exportAllData = async (): Promise<void> => {
    if (!rootHandle) throw new Error('File system not initialized for export.');
    const zip = new JSZip();
    await recursiveZip(rootHandle, zip);

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `easy-office-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

async function clearDirectory(dirHandle: FileSystemDirectoryHandle) {
    for await (const entry of dirHandle.values()) {
        await dirHandle.removeEntry(entry.name, { recursive: entry.kind === 'directory' });
    }
}

const importAllData = async (file: File): Promise<void> => {
    if (!rootHandle) throw new Error('File system not initialized for import.');
    
    await clearDirectory(rootHandle);

    const zip = await JSZip.loadAsync(file);
    const writePromises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const promise = async () => {
                const content = await zipEntry.async('string');
                try {
                    const parsedContent = JSON.parse(content);
                    await writeFile(relativePath, parsedContent);
                } catch(e) {
                    console.warn(`Skipping non-JSON file or failed to write: ${relativePath}`, e);
                }
            };
            writePromises.push(promise());
        }
    });

    await Promise.all(writePromises);
};


export const browserFileSystemService: IFileSystemService = {
    initialize,
    writeFile,
    readFile,
    readDirectory,
    deleteFile,
    isSupported: browserIsSupported,
    exportAllData,
    importAllData,
};