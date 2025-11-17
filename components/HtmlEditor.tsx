
import React from 'react';

interface HtmlEditorProps {
  template: string;
  onTemplateChange: (template: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ template, onTemplateChange }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col h-full">
      <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">HTML Template Editor</h3>
      <p className="text-sm text-gray-400 mb-3">
        Hier können Sie das HTML und die Tailwind-CSS-Klassen der Rechnung anpassen. Verwenden Sie Platzhalter wie <code>{'{{creditorName}}'}</code> für dynamische Daten.
      </p>
      <textarea
        value={template}
        onChange={(e) => onTemplateChange(e.target.value)}
        className="w-full flex-grow bg-gray-900 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition font-mono"
        style={{ minHeight: '300px' }}
        spellCheck="false"
      />
    </div>
  );
};

export default HtmlEditor;
