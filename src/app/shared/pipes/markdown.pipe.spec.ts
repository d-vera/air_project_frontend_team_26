import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownPipe]
    });

    pipe = TestBed.inject(MarkdownPipe);
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null, undefined, or empty value', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should transform bold and italic text', () => {
    const raw = '**Bold message** and *italic note* plus __another bold__';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('<strong class="font-semibold">Bold message</strong>');
    expect(parsed).toContain('<em class="italic">italic note</em>');
    expect(parsed).toContain('<strong class="font-semibold">another bold</strong>');
  });

  it('should transform inline code', () => {
    const raw = 'Sensor reading is `412 ppm` right now.';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-mono">412 ppm</code>');
  });

  it('should transform unordered lists', () => {
    const raw = '- First item\n- Second item';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('<ul class="list-disc ml-5 my-1 space-y-0.5">');
    expect(parsed).toContain('<li>First item</li>');
    expect(parsed).toContain('<li>Second item</li>');
    expect(parsed).toContain('</ul>');
  });

  it('should transform ordered lists', () => {
    const raw = '1. Step one\n2. Step two';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('<ol class="list-decimal ml-5 my-1 space-y-0.5">');
    expect(parsed).toContain('<li>Step one</li>');
    expect(parsed).toContain('<li>Step two</li>');
    expect(parsed).toContain('</ol>');
  });

  it('should transform headers', () => {
    const raw = '# Title\n## Section\n### Subtitle';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('font-bold text-lg');
    expect(parsed).toContain('Title');
    expect(parsed).toContain('font-bold text-base');
    expect(parsed).toContain('Section');
    expect(parsed).toContain('font-semibold text-sm');
    expect(parsed).toContain('Subtitle');
  });

  it('should transform external links safely', () => {
    const raw = 'Read more at [Documentation](https://air-quality.example.com)';
    const parsed = pipe.parseMarkdown(raw);

    expect(parsed).toContain('<a href="https://air-quality.example.com" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline underline">Documentation</a>');
  });

  it('should strictly escape raw HTML tags to prevent XSS attacks', () => {
    const malicious = '<script>alert("hacked")</script><img src="x" onerror="evil()"/>';
    const parsed = pipe.parseMarkdown(malicious);

    expect(parsed).not.toContain('<script>');
    expect(parsed).toContain('&lt;script&gt;');
    expect(parsed).not.toContain('<img src="x"');
    expect(parsed).toContain('&lt;img src=&quot;x&quot;');
  });

  it('should bypassSecurityTrustHtml via sanitizer in transform()', () => {
    const bypassSpy = vi.spyOn(sanitizer, 'bypassSecurityTrustHtml');
    const result = pipe.transform('**Important note**');

    expect(bypassSpy).toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
