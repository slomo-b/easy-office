# Easy Office

<p align="center">

  <img src="./src/logo.png" alt="Easy Office Logo" width="150"/>
</p>

<p align="center">
  Eine einfache und moderne Desktop-Anwendung zur Erstellung und Verwaltung von Schweizer QR-Rechnungen.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/electron-^31.0.0-blueviolet.svg" alt="Electron">
  <img src="https://img.shields.io/badge/react-^18.3.1-61DAFB.svg" alt="React">
</p>

---

## 🚀 Über das Projekt

**Easy Office** ist eine Desktop-Anwendung für Windows, macOS und Linux, die mit dem Ziel entwickelt wurde, den Prozess der Rechnungserstellung zu vereinfachen. Der Schwerpunkt liegt auf der schnellen und unkomplizierten Erzeugung von **Schweizer QR-Rechnungen**.

Die Anwendung bietet eine saubere, moderne Benutzeroberfläche und ermöglicht es, Rechnungen als PDF zu exportieren und Kundendaten, Projekte und Dienstleistungen zu verwalten.

## ✨ Hauptfunktionen

*   **QR-Rechnungen erstellen:** Intuitive Benutzeroberfläche zur Eingabe aller relevanten Daten für eine Schweizer QR-Rechnung.
*   **PDF-Export:** Generiere professionelle PDF-Rechnungen mit einem Klick.
*   **Kundenverwaltung:** Lege Kunden an und verwalte sie, um sie schnell in Rechnungen wiederzuverwenden.
*   **Projekt- & Dienstleistungsmanagement:** Definiere Projekte und Dienstleistungen für eine detaillierte Abrechnung.
*   **Ausgaben-Tracking:** Erfasse und verwalte deine Geschäftsausgaben.
*   **Moderne UI:** Eine aufgeräumte und benutzerfreundliche Oberfläche, gebaut mit React und Tailwind CSS.
*   **Cross-Platform:** Läuft dank Electron nativ auf Windows, macOS und Linux.

## 🛠️ Tech Stack

Dieses Projekt nutzt einen modernen Technologie-Stack für eine performante und wartbare Desktop-Anwendung.

*   **Desktop Framework:** [Electron](https://www.electronjs.org/)
*   **Frontend:** [React](https://reactjs.org/) & [React Router](https://reactrouter.com/)
*   **Build-Tool:** [Vite](https://vitejs.dev/)
*   **Sprache:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **QR-Rechnung Generierung:** [swissqrbill](https://github.com/schoero/swissqrbill)
*   **PDF-Generierung:** [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

## 📸 Screenshot

*(Hier wäre ein guter Platz für einen Screenshot oder ein GIF deiner Anwendung!)*

![App Screenshot](placeholder.png)

## 🏁 Erste Schritte

Um eine lokale Kopie des Projekts zum Laufen zu bringen, befolge diese einfachen Schritte.

### Voraussetzungen

Stelle sicher, dass du [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen) und npm installiert hast.

*   npm
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  Klone das Repository:
    ```sh
    git clone https://github.com/dein-benutzername/easy-office.git
    ```
2.  Wechsle in das Projektverzeichnis:
    ```sh
    cd easy-office
    ```
3.  Installiere die NPM-Pakete:
    ```sh
    npm install
    ```
4.  Starte die Anwendung im Entwicklungsmodus:
    ```sh
    npm run dev:electron
    ```
    Dieser Befehl startet sowohl den Vite-Entwicklungsserver als auch die Electron-Anwendung.

## 📦 Verfügbare Skripte

*   `npm run dev`: Startet nur den Vite-Entwicklungsserver.
*   `npm run dev:electron`: Startet Vite und Electron für die Entwicklung (der empfohlene Befehl).
*   `npm run build`: Baut die React-Anwendung für die Produktion in den `dist`-Ordner.
*   `npm run preview`: Startet einen lokalen Server, um die Produktions-Build-Version zu testen.

## 📁 Projektstruktur

```
easy-office/
├── electron/
│   ├── main.cjs       # Hauptprozess von Electron (Fenstererstellung, etc.)
│   └── preload.cjs    # Sichere Brücke zwischen Haupt- und Renderer-Prozess
├── public/            # Statische Assets
└── src/
    ├── components/    # Wiederverwendbare React-Komponenten
    ├── context/       # React Context Provider (z.B. FileSystem)
    ├── pages/         # Seiten-Komponenten für die Routen
    ├── App.tsx        # Haupt-App-Komponente mit Routing
    ├── main.tsx       # Einstiegspunkt der React-Anwendung
    └── index.css      # Globale Stile und Tailwind-Konfiguration
```

## 🤝 Mitwirken

Beiträge sind das, was die Open-Source-Community zu einem so großartigen Ort zum Lernen, Inspirieren und Gestalten macht. Jeder Beitrag, den du leistest, wird **sehr geschätzt**.

1.  Forke das Projekt
2.  Erstelle deinen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3.  Commite deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4.  Pushe zum Branch (`git push origin feature/AmazingFeature`)
5.  Öffne einen Pull Request

## 📄 Lizenz

Verteilt unter der MIT-Lizenz. Siehe `LICENSE`-Datei für weitere Informationen.

*(Hinweis: Du musst noch eine `LICENSE`-Datei mit dem MIT-Lizenztext erstellen, falls noch nicht geschehen.)*