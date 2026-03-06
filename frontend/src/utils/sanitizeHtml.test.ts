import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  describe('script injection', () => {
    test('removes inline script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('<p>Hello</p>');
      expect(result).toContain('<p>World</p>');
    });

    test('removes script tags with src attribute', () => {
      const input = '<script src="https://evil.com/steal.js"></script><p>Content</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.com');
      expect(result).toContain('<p>Content</p>');
    });

    test('removes script tags with attributes', () => {
      const input = '<script type="text/javascript">document.cookie</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
    });
  });

  describe('iframe injection', () => {
    test('removes iframe tags', () => {
      const input = '<iframe src="https://evil.com/phish"></iframe><div>Safe</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<iframe');
      expect(result).toContain('<div>Safe</div>');
    });
  });

  describe('object and embed injection', () => {
    test('removes object tags', () => {
      const input = '<object data="evil.swf"></object><p>Text</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<object');
      expect(result).toContain('<p>Text</p>');
    });

    test('removes embed tags', () => {
      const input = '<embed src="evil.swf"><span>Ok</span>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<embed');
      expect(result).toContain('<span>Ok</span>');
    });
  });

  describe('event handler attributes', () => {
    test('strips onclick from allowed elements', () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click me');
    });

    test('strips onerror from img', () => {
      const input = '<img src="https://example.com/img.png" onerror="alert(1)">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('alert');
    });

    test('strips onload from img', () => {
      const input = '<img src="/logo.png" onload="steal()">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onload');
      expect(result).not.toContain('steal');
    });

    test('strips onmouseover and other on* attributes', () => {
      const input = '<a href="https://example.com" onmouseover="evil()">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('evil');
    });
  });

  describe('dangerous URL protocols in href and src', () => {
    test('blocks javascript: URLs in href', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });

    test('blocks javascript: URLs in src', () => {
      const input = '<img src="javascript:alert(1)">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    test('blocks data: URIs in href', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('data:');
      expect(result).not.toContain('alert');
    });

    test('blocks data: URIs in img src', () => {
      const input = '<img src="data:image/svg+xml,<svg onload=alert(1)>">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('data:');
    });

    test('blocks vbscript: URLs', () => {
      const input = '<a href="vbscript:msgbox(1)">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('vbscript:');
    });

    test('allows https URLs in href', () => {
      const input = '<a href="https://example.com">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="https://example.com"');
    });

    test('allows http URLs in href', () => {
      const input = '<a href="http://example.com">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="http://example.com"');
    });

    test('allows fragment-only anchors', () => {
      const input = '<a href="#section">Anchor</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="#section"');
    });

    test('allows root-relative URLs', () => {
      const input = '<a href="/about">About</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="/about"');
    });

    test('allows mailto: URLs', () => {
      const input = '<a href="mailto:user@example.com">Email</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="mailto:user@example.com"');
    });

    test('allows tel: URLs', () => {
      const input = '<a href="tel:+1234567890">Call</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="tel:+1234567890"');
    });
  });

  describe('disallowed tags', () => {
    test('strips form elements', () => {
      const input = '<form action="evil.com"><input name="x"></form><p>Text</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
      expect(result).toContain('<p>Text</p>');
    });

    test('strips meta tags', () => {
      const input = '<meta http-equiv="refresh" content="0;url=evil.com"><p>Ok</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<meta');
      expect(result).toContain('<p>Ok</p>');
    });

    test('strips link tags', () => {
      const input = '<link rel="import" href="evil.html"><div>Content</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<link');
      expect(result).toContain('<div>Content</div>');
    });

    test('strips svg with event handlers', () => {
      const input = '<svg onload="alert(1)"><circle></circle></svg>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<svg');
      expect(result).not.toContain('onload');
    });
  });

  describe('inline styles', () => {
    test('strips style attribute', () => {
      const input = '<p style="color:red;expression(alert(1))">Text</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('style=');
      expect(result).not.toContain('expression');
      expect(result).toContain('Text');
    });
  });

  describe('target="_blank" and tabnabbing', () => {
    test('adds rel="noopener noreferrer" when target="_blank" is used', () => {
      const input = '<a href="https://example.com" target="_blank">External</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('target="_blank"');
    });
  });

  describe('allowed content preserved', () => {
    test('preserves basic formatting tags', () => {
      const input = '<p><b>Bold</b> <i>italic</i> <u>underline</u></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>italic</i>');
      expect(result).toContain('<u>underline</u>');
    });

    test('preserves list structure', () => {
      const input = '<ul><li>One</li><li>Two</li></ul>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>One</li>');
      expect(result).toContain('<li>Two</li>');
    });

    test('preserves headings and blockquote', () => {
      const input = '<h1>Title</h1><blockquote>Quote</blockquote>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<blockquote>Quote</blockquote>');
    });

    test('preserves img with safe src and alt', () => {
      const input = '<img src="https://example.com/logo.png" alt="Logo">';
      const result = sanitizeHtml(input);
      expect(result).toContain('src="https://example.com/logo.png"');
      expect(result).toContain('alt="Logo"');
    });

    test('preserves plain text without tags', () => {
      const input = 'Just plain text';
      const result = sanitizeHtml(input);
      expect(result).toContain('Just plain text');
    });
  });

  describe('edge cases', () => {
    test('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    test('handles string with only malicious content', () => {
      const input = '<script>alert(1)</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('');
    });

    test('handles nested script attempts', () => {
      const input = '<div><script>evil()</script></div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).toContain('<div>');
    });

    test('handles mixed case script tag', () => {
      const input = '<ScRiPt>alert(1)</ScRiPt><p>Safe</p>';
      const result = sanitizeHtml(input);
      expect(result).not.toMatch(/<script/i);
      expect(result).toContain('<p>Safe</p>');
    });
  });
});
