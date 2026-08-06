
import React, { useMemo } from 'react';

interface ResultDisplayProps {
  content: string | null;
}

const simpleMarkdownParser = (text: string): string => {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 1. Handle Code Blocks with institutional headers and language badges
  const parts = html.split(/(```[\s\S]*?```)/g);
  
  const processedParts = parts.map((part, index) => {
      if (index % 2 === 1) { // It's a code block
          const matchLang = part.match(/^```([a-zA-Z0-9_\-\+]+)/);
          const lang = matchLang ? matchLang[1].toUpperCase() : 'KERNEL_CODE';
          const codeContent = part.replace(/^```[^\n]*\n?/, '').replace(/```$/, '').trim();
          const langBadgeClass = lang.includes('RUST') ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' :
                                 lang.includes('GO') ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                 lang.includes('SOLIDITY') || lang.includes('YUL') ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                 lang.includes('CIRCOM') ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                 lang.includes('HUFF') || lang.includes('MOVE') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                 'bg-blue-500/10 border-blue-500/20 text-blue-400';
          return `<div class="my-8 rounded-none overflow-hidden border border-white/10 bg-[#0C0C0C]"><div class="px-5 py-2.5 bg-white/5 border-b border-white/5 flex justify-between items-center"><div class="flex items-center gap-2.5"><span class="px-2 py-0.5 border ${langBadgeClass} text-[9px] font-mono font-black uppercase tracking-widest">${lang}</span><span class="text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] font-black">// SPEC_PAYLOAD_BUFFER</span></div><div class="flex gap-1.5"><div class="w-1.5 h-1.5 rounded-full bg-white/10"></div><div class="w-1.5 h-1.5 rounded-full bg-white/10"></div></div></div><pre class="p-6 overflow-x-auto text-xs font-mono text-blue-300 custom-scrollbar leading-relaxed"><code>${codeContent}</code></pre></div>`;
      }

      return part
          // 2. Enhanced Callouts
          .replace(/^&gt; \[!(INFO|WARNING|CRITICAL|SUCCESS)\]\n([\s\S]*?)$/gim, (match, type, content) => {
              const styles = {
                  INFO: 'bg-blue-500/5 border-blue-500/20 text-blue-400',
                  WARNING: 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400',
                  CRITICAL: 'bg-red-500/5 border-red-500/20 text-red-400',
                  SUCCESS: 'bg-green-500/5 border-green-500/20 text-green-400'
              }[type as 'INFO'|'WARNING'|'CRITICAL'|'SUCCESS'];
              return `<div class="my-8 p-6 border-l-4 rounded-sm ${styles}"><div class="flex gap-4 items-start"><span class="font-mono text-[10px] font-black uppercase tracking-widest mt-0.5">${type} //</span><p class="text-[13px] leading-relaxed font-light">${content.trim()}</p></div></div>`;
          })
          // 3. Institutional Data Tables
          .replace(/\|(.+)\|/g, (match) => {
              const rows = match.split('\n').filter(r => r.trim().startsWith('|'));
              if (rows.length === 0) return match;
              
              let tableHtml = '<div class="my-10 overflow-x-auto border border-white/10 rounded-none bg-black/40"><table class="w-full text-left font-mono text-[10px] uppercase tracking-tighter border-collapse">';
              rows.forEach((row, i) => {
                  const cells = row.split('|').filter(c => c.trim() !== '' || (row.indexOf('|') !== row.lastIndexOf('|')));
                  if (row.includes('---')) return; // Skip separator row
                  
                  tableHtml += `<tr class="${i === 0 ? 'bg-white/5 text-white' : 'border-b border-white/5 text-gray-400 hover:bg-white/[0.02]'}">`;
                  cells.forEach(cell => {
                      tableHtml += i === 0 
                        ? `<th class="px-5 py-4 font-black border-r border-white/5 last:border-r-0">${cell.trim()}</th>`
                        : `<td class="px-5 py-4 border-r border-white/5 last:border-r-0">${cell.trim()}</td>`;
                  });
                  tableHtml += '</tr>';
              });
              tableHtml += '</table></div>';
              return tableHtml;
          })
          // 4. Standard Typography
          .replace(/^### (.*$)/gim, '<h3 class="text-white font-mono text-sm font-black uppercase tracking-widest mt-12 mb-5 border-l-4 border-blue-500 pl-5">$1</h3>')
          .replace(/^## (.*$)/gim, '<h2 class="text-white font-mono text-lg font-black uppercase tracking-[0.2em] mt-16 mb-8 border-b border-white/10 pb-4">$1</h2>')
          .replace(/^# (.*$)/gim, '<h1 class="text-white font-mono text-2xl font-black uppercase tracking-[0.3em] mt-20 mb-10 text-blue-400">$1</h1>')
          .replace(/^\* (.*$)/gim, '<li class="ml-6 pl-3 border-l border-white/10 hover:border-blue-500/50 transition-colors py-1.5">$1</li>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-blue-300 px-2 py-0.5 rounded-sm font-mono text-[11px] border border-white/5">$1</code>')
          .replace(/\n\n/g, '</p><p class="mb-8 leading-relaxed text-gray-400 text-[14px] tracking-tight">')
          .replace(/\n/g, '<br />')
          .replace(/^<p><\/p>$/g, '');
  });

  html = processedParts.join('');

  if (html.includes('<li>')) {
      html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul class="space-y-4 my-8">$1</ul>');
  }
  
  if (!html.startsWith('<') && !html.startsWith('Data_Payload') && !html.startsWith('<div')) {
      html = '<p class="mb-8 leading-relaxed text-gray-400 text-[14px] tracking-tight">' + html + '</p>';
  }

  return html;
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ content }) => {
  // Memoize the HTML content to avoid unnecessary parsing on every render
  const htmlContent = useMemo(() => simpleMarkdownParser(content || ""), [content]);

  if (!content) return null;

  return (
    <div className="bg-transparent border-none p-0 relative overflow-visible group">
      <div className="relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
          <div
            className="prose prose-invert max-w-none relative z-10 transition-opacity duration-300"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
      </div>
      
      <div className="mt-20 pt-6 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-gray-600 uppercase font-black tracking-widest">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> END_OF_SPECIFICATION</span>
          </div>
          <span>SIG: {Math.random().toString(36).substr(2, 10).toUpperCase()}</span>
      </div>
    </div>
  );
};

export default ResultDisplay;
