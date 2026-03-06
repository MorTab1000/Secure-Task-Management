
/**
 * Sanitizes raw HTML input to remove or neutralize XSS (Cross-Site Scripting) vectors,
 * producing safe HTML suitable for rendering via innerHTML or similar DOM APIs.
 *
 * @param html - Raw, potentially unsafe HTML string (e.g., user-supplied content).
 *               May contain scripts, event handlers, dangerous attributes, or malicious URLs.
 * @returns Sanitized HTML string containing only allowed tags, allowed attributes with
 *          validated values, and no executable JavaScript or other XSS payloads.
 *
 * ## XSS Vulnerabilities Mitigated
 *
 * ### 1. Script / iframe / object / embed injection
 * Entire `<script>`, `<iframe>`, `<object>`, and `<embed>` elements are removed via regex
 * before parsing. This mitigates:
 * - Direct script execution from injected tags
 * - Malicious iframes (phishing, clickjacking)
 * - Plugin-based exploits via object/embed
 *
 * ### 2. Tag injection
 * A whitelist of allowed tags is enforced; all other element nodes are stripped.
 * Prevents injection of arbitrary HTML elements that could carry XSS (e.g., form, input, meta).
 *
 * ### 3. Event handler attributes (e.g., onclick, onerror, onload)
 * Any attribute whose name starts with "on" is dropped.
 * Mitigates event handler–based XSS such as `<img onerror="...">` or `<div onclick="...">`.
 *
 * ### 4. Inline styles
 * The `style` attribute is stripped to avoid style-based XSS (e.g., `expression()` in legacy IE)
 * and other style-driven payloads.
 *
 * ### 5. Dangerous URL protocols in href and src
 * Values for `href` and `src` are validated to block:
 * - `javascript:` URLs
 * - `data:` URIs (can embed scripts or redirect)
 * - `vbscript:` URLs
 * Only `https?`, `mailto`, `tel`, root-relative (`/`), and fragment-only (`#`) values are allowed.
 *
 * ### 6. Tabnabbing via target="_blank"
 * When `target="_blank"` is used on links, `rel="noopener noreferrer"` is added to reduce
 * tabnabbing and related window.opener exploits.
 *
 * ### 7. Arbitrary attributes
 * Attributes are restricted to a per-tag whitelist (e.g., href/title/target for anchors,
 * src/alt/title/width/height for images). Unlisted attributes are dropped.
 *
 * ### 8. Non-element / non-text nodes
 * Comments, doctypes, and other non-element nodes are discarded during traversal.
 */
export function sanitizeHtml(html: string): string {
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHtml, "text/html");

  const allowedTags = [
    "b", "i", "u", "em", "strong",
    "p", "br", "ul", "ol", "li",
    "a", "img", "blockquote", "code", "pre", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6", "span", "div"
  ];

  const allowedAttributes: Record<string, string[]> = {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title", "width", "height"]
  };

  function cleanNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toLowerCase();

      if (!allowedTags.includes(tag)) {
        return null; // strip disallowed tags entirely
      }

      const cleanEl = document.createElement(tag);

      // Copy allowed attributes with validation
      const attrs = allowedAttributes[tag] || [];
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        let value = attr.value;

        // Drop any event handler
        if (name.startsWith("on")) continue;
        // Drop inline styles
        if (name === "style") continue;
        if (!attrs.includes(name)) continue;

        if (name === "href" || name === "src") {
          // Block dangerous protocols
          if (/^(javascript|data|vbscript):/i.test(value)) continue;
          // Allow http(s), mailto, tel, root-relative (/...), or anchors (#...)
          const safeScheme = /^(https?|mailto|tel):/i;
          if (
            value &&
            !value.startsWith("#") &&
            !value.startsWith("/") &&
            !safeScheme.test(value)
          ) {
            continue;
          }
          if (name === "href" && el.getAttribute("target") === "_blank") {
            cleanEl.setAttribute("rel", "noopener noreferrer");
          }
        }

        cleanEl.setAttribute(name, value);
      }

      // Recursively sanitize children
      for (const child of Array.from(el.childNodes)) {
        const cleanChild = cleanNode(child);
        if (cleanChild) cleanEl.appendChild(cleanChild);
      }

      return cleanEl;
    }

    // Skip comments, doctype, etc.
    return null;
  }

  const fragment = document.createElement("div");
  for (const child of Array.from(doc.body.childNodes)) {
    const cleanChild = cleanNode(child);
    if (cleanChild) fragment.appendChild(cleanChild);
  }

  return fragment.innerHTML;
}
