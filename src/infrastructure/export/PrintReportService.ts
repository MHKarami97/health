export var escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

/** Prints through a hidden iframe so pop-up blockers on mobile do not interfere. */
export class PrintReportService {
  print(title: string, bodyHtml: string): void {
    var frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden'
    frame.srcdoc = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
      <style>
        body{font-family:Vazirmatn,Tahoma,sans-serif;padding:24px;color:#0f172a;line-height:1.8}
        h1{color:#0f766e;margin:0 0 4px} h2{border-bottom:2px solid #0f766e;padding-bottom:4px;margin-top:24px}
        table{width:100%;border-collapse:collapse;margin:8px 0} th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:right;font-size:13px}
        th{background:#f1f5f9} .warn{background:#fef3c7;padding:8px 12px;border-radius:8px;font-size:13px}
        .muted{color:#64748b;font-size:12px}
      </style></head><body>${bodyHtml}</body></html>`
    frame.onload = () => {
      frame.contentWindow?.focus()
      frame.contentWindow?.print()
      setTimeout(() => frame.remove(), 60_000)
    }
    document.body.appendChild(frame)
  }
}
