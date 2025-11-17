import { IFileSystemService } from "../types";
import JSZip from 'jszip';

// These will be available in the Electron renderer process
declare const window: any;
const fs = window.require ? window.require('fs') : null;
const path = window.require ? window.require('path') : null;

const ROOT_DIR_NAME = 'easy-office-data';
// In Electron, this will create the folder in the same directory as the executable
// which is a simple and portable solution.
const APP_DATA_DIR = path ? path.join('.', ROOT_DIR_NAME) : '';


const electronIsSupported = () => !!window.require;

const initialize = async (): Promise<void> => {
    if (!fs || !path) {
        throw new Error("Node.js modules not found. This service only runs in Electron.");
    }

    const directories = [
        APP_DATA_DIR,
        path.join(APP_DATA_DIR, 'invoices'),
        path.join(APP_DATA_DIR, 'expenses'),
        path.join(APP_DATA_DIR, 'customers'),
        path.join(APP_DATA_DIR, 'recurring-expenses'),
        path.join(APP_DATA_DIR, 'projects'),
        path.join(APP_DATA_DIR, 'services'),
    ];

    for (const dir of directories) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
};

const getFullPath = (filePath: string): string => {
    return path.join(APP_DATA_DIR, filePath);
};

const writeFile = async (filePath: string, content: object): Promise<void> => {
    const fullPath = getFullPath(filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
};

const readFile = async <T>(filePath: string): Promise<T> => {
    const fullPath = getFullPath(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content) as T;
};

const readDirectory = async (dirPath: string): Promise<string[]> => {
    const fullPath = getFullPath(dirPath);
     if (!fs.existsSync(fullPath)) {
        return [];
    }
    const entries = fs.readdirSync(fullPath);
    return entries.filter((entry: string) => entry.endsWith('.json'));
};

const deleteFile = async (filePath: string): Promise<void> => {
    const fullPath = getFullPath(filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

// --- Import/Export ---

function addDirectoryToZip(localPath: string, zip: JSZip) {
    const entries = fs.readdirSync(localPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(localPath, entry.name);
        if (entry.isDirectory()) {
            const dirZip = zip.folder(entry.name);
            if(dirZip) {
                addDirectoryToZip(fullPath, dirZip);
            }
        } else if (entry.isFile()) {
            const content = fs.readFileSync(fullPath);
            zip.file(entry.name, content);
        }
    }
}

const exportAllData = async (): Promise<void> => {
    if (!fs || !path) throw new Error("Electron environment not available for export.");
    
    const zip = new JSZip();
    addDirectoryToZip(APP_DATA_DIR, zip);

    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `easy-office-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

const importAllData = async (file: File): Promise<void> => {
    if (!fs || !path) throw new Error("Electron environment not available for import.");

    if (fs.existsSync(APP_DATA_DIR)) {
        fs.rmSync(APP_DATA_DIR, { recursive: true, force: true });
    }
    await initialize();

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const writePromises: Promise<void>[] = [];

    zip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const promise = async () => {
                const contentBuffer = await zipEntry.async('nodebuffer');
                const fullPath = getFullPath(relativePath);
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(fullPath, contentBuffer);
            };
            writePromises.push(promise());
        }
    });
    
    await Promise.all(writePromises);
};

export const electronFileSystemService: IFileSystemService = {
    initialize,
    writeFile,
    readFile,
    readDirectory,
    deleteFile,
    isSupported: electronIsSupported,
    exportAllData,
    importAllData,
};