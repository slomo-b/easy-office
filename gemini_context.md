# Gemini Context: Easy Office Application

This document summarizes the key architectural findings of the Easy Office application to guide future development and modifications.

## Summary of Findings

The application is a React/Vite project running inside an Electron container. Its most significant architectural feature is a well-designed file system abstraction layer that allows it to function both as a desktop application with direct file access and as a web application using the browser's File System Access API.

**Architecture Overview:**
1.  **Electron Shell:** `electron/main.cjs` creates a frameless browser window. All native functionality, like window controls, is handled via IPC messages sent from the React app. The `electron/preload.cjs` script is intentionally minimal for security, exposing only the window control channels and nothing related to the file system.

2.  **File System Abstraction:** This is the core of the backend.
    *   `services/fileSystem.ts` acts as a dispatcher. On startup, it checks `!!window.require` to determine if it's in an Electron environment.
    *   It then directs all file operations (`readFile`, `writeFile`, etc.) to one of two services that implement the `IFileSystemService` interface (from `types.ts`).
    *   `services/electronFileSystem.ts` is the implementation for the desktop app. It uses Node's `fs` module to store data in a local `easy-office-data` directory.
    *   `services/browserFileSystem.ts` (not reviewed but logic is clear) would be the implementation for the web, using the browser's sandboxed File System API.

3.  **Data Model:** The application uses a simple, file-based database where each data entity (e.g., a customer, an invoice) is stored as a separate JSON file within a relevant subdirectory (e.g., `/customers/cust_123.json`). Data services like `customerService.ts` contain the logic for these CRUD operations, interacting solely with the file system abstraction layer.

4.  **Frontend:** The UI is built in React. `context/FileSystemContext.tsx` kicks off the file system initialization and provides a global `isReady` state. `App.tsx` uses this state to show loading/error messages before rendering the main application, which consists of a sidebar and a router for different pages (`Customers`, `Invoices`, etc.).

## Relevant Locations

*   `electron/main.cjs`: Electron main process entry point.
*   `electron/preload.cjs`: Secure bridge between main and renderer processes.
*   `services/fileSystem.ts`: Core file system abstraction and dispatcher.
*   `services/electronFileSystem.ts`: File system implementation for Electron.
*   `types.ts`: Contains the `IFileSystemService` interface.
*   `context/FileSystemContext.tsx`: React context for file system initialization.
*   `services/customerService.ts`: Example of a data service using the file system abstraction.
