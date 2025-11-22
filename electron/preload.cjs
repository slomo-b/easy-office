const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  /**
   * Send a message to the main process
   * @param {string} channel The channel to send the message to
   * @param  {...any} args The arguments to send with the message
   */
  send: (channel, ...args) => {
    // Whitelist channels
    const validChannels = ['minimize-window', 'maximize-window', 'close-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
});