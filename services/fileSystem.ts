import { IFileSystemService } from '../types';
import { browserFileSystemService } from './browserFileSystem';
import { electronFileSystemService } from './electronFileSystem';

declare const window: any;

let fsService: IFileSystemService;

const isElectron = (): boolean => !!window.require;

export const initializeFileSystem = async (): Promise<void> => {
    if (isElectron()) {
        fsService = electronFileSystemService;
    } else {
        fsService = browserFileSystemService;
    }
    await fsService.initialize();
};

export const isSupported = (): boolean => {
    return isElectron() || browserFileSystemService.isSupported();
}

export const writeFile = async (path: string, content: object): Promise<void> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.writeFile(path, content);
};

export const readFile = async <T>(path: string): Promise<T> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.readFile<T>(path);
};

export const readDirectory = async (path: string): Promise<string[]> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.readDirectory(path);
};

export const deleteFile = async (path: string): Promise<void> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.deleteFile(path);
};

export const exportAllData = async (): Promise<void> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.exportAllData();
};

export const importAllData = async (file: File): Promise<void> => {
    if (!fsService) throw new Error("File system not initialized");
    return fsService.importAllData(file);
};