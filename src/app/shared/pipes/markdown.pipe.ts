import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    if (!value) {
      return '';
    }

    const html = this.parseMarkdown(value);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  parseMarkdown(rawText: string): string {
    // 1. Strict HTML escape to prevent XSS injection
    const escaped = this.escapeHtml(rawText);

    // 2. Normalize line endings
    const lines = escaped.replace(/\r\n/g, '\n').split('\n');

    const outputLines: string[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for unordered list item (- or *)
      const ulMatch = line.match(/^(\s*)[-*]\s+(.+)$/);
      // Check for ordered list item (1.)
      const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);

      if (ulMatch) {
        if (!inList || listType !== 'ul') {
          if (inList) outputLines.push(listType === 'ol' ? '</ol>' : '</ul>');
          outputLines.push('<ul class="list-disc ml-5 my-1 space-y-0.5">');
          inList = true;
          listType = 'ul';
        }
        outputLines.push(`<li>${this.formatInline(ulMatch[2])}</li>`);
        continue;
      } else if (olMatch) {
        if (!inList || listType !== 'ol') {
          if (inList) outputLines.push(listType === 'ol' ? '</ol>' : '</ul>');
          outputLines.push('<ol class="list-decimal ml-5 my-1 space-y-0.5">');
          inList = true;
          listType = 'ol';
        }
        outputLines.push(`<li>${this.formatInline(olMatch[2])}</li>`);
        continue;
      } else {
        if (inList) {
          outputLines.push(listType === 'ol' ? '</ol>' : '</ul>');
          inList = false;
          listType = null;
        }

        // Headers
        const h3Match = line.match(/^###\s+(.+)$/);
        const h2Match = line.match(/^##\s+(.+)$/);
        const h1Match = line.match(/^#\s+(.+)$/);

        if (h3Match) {
          outputLines.push(`<p class="font-semibold text-sm mt-2 mb-1">${this.formatInline(h3Match[1])}</p>`);
        } else if (h2Match) {
          outputLines.push(`<p class="font-bold text-base mt-2 mb-1">${this.formatInline(h2Match[1])}</p>`);
        } else if (h1Match) {
          outputLines.push(`<p class="font-bold text-lg mt-2 mb-1">${this.formatInline(h1Match[1])}</p>`);
        } else if (line.trim() === '') {
          outputLines.push('<div class="h-2"></div>');
        } else {
          outputLines.push(`<p class="my-0.5">${this.formatInline(line)}</p>`);
        }
      }
    }

    if (inList) {
      outputLines.push(listType === 'ol' ? '</ol>' : '</ul>');
    }

    return outputLines.join('');
  }

  formatInline(text: string): string {
    // Inline code: `code`
    let res = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">$1</code>');

    // Bold: **text** or __text__
    res = res.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    res = res.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');

    // Italic: *text* or _text_
    res = res.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    res = res.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

    // Links: [text](http... or https...)
    res = res.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline underline">$1</a>');

    return res;
  }

  escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
