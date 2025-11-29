import React from 'react';
import { Code } from 'lucide-react';

interface HtmlEditorProps {
  template: string;
  onTemplateChange: (template: string) => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ template, onTemplateChange }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <p className="text-[#94A3B8] text-sm leading-relaxed">
          Passe das HTML und die Tailwind-CSS-Klassen der Rechnung an. Verwende Platzhalter wie
          <code className="bg-[#64748B]/20 px-2 py-0.5 rounded text-[#00E5FF] text-xs mx-1 font-mono">{'{{creditorName}}'}</code> für dynamische Daten.
        </p>
      </div>

      <div className="flex-1 relative">
        <label className="block text-sm font-medium text-[#94A3B8] mb-2">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-[#64748B]" />
            Template-Code
          </div>
        </label>

        <div className="relative">
          <textarea
            value={template}
            onChange={(e) => onTemplateChange(e.target.value)}
            className="w-full h-full min-h-[400px] bg-[#16232B] border border-[#64748B]/30 rounded-xl p-4 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#00E5FF]/50 focus:ring-2 focus:ring-[#00E5FF]/20 transition-all duration-200 font-mono leading-relaxed resize-none"
            style={{ lineHeight: '1.6' }}
            spellCheck="false"
            placeholder="HTML Template..."
          />

          <div className="absolute top-3 right-3 p-1.5 bg-[#64748B]/10 rounded-lg border border-[#64748B]/20">
            <svg className="h-4 w-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-4">
            <span>Zeilen: {template.split('\n').length}</span>
            <span>Zeichen: {template.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Format: HTML / Tailwind CSS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HtmlEditor;
