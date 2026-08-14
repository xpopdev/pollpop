// RT-BUG-21: dead code, kept for P1 Storage upload — CreateForm.tsx has inline uploader, unify later
"use client";
import { useState } from "react";

type Props = {
  index: number;
  label: string;
  preview: string | null;
  imageUrl: string;
  onFile: (file: File | null) => void;
  onUrl: (url: string) => void;
  onLabel: (label: string) => void;
  onRemoveImage: () => void;
  onRemoveOption?: () => void;
  canRemoveOption?: boolean;
};

export function ImageUploader({
  index,
  label,
  preview,
  imageUrl,
  onFile,
  onUrl,
  onLabel,
  onRemoveImage,
  onRemoveOption,
  canRemoveOption,
}: Props) {
  const [urlMode, setUrlMode] = useState(false);
  const rawUrl = imageUrl.startsWith("data:") ? "" : imageUrl;

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
    const url = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (!f && url) onUrl(url);
  };
  const onPaste = (e: React.ClipboardEvent) => {
    for (const it of Array.from(e.clipboardData.items)) {
      if (it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) { e.preventDefault(); onFile(f); return; }
      }
    }
  };

  return (
    <div className={`uploader-card ${preview ? "has-image" : ""}`} onDragOver={onDragOver} onDrop={onDrop} onPaste={onPaste}>
      <div className="img-area">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="preview" src={preview} alt={label || `option ${index + 1}`} />
        ) : (
          <div className="placeholder">
            <div><b>Drop, paste, or upload</b><br />PNG / JPG / WebP — or paste image URL below</div>
            <label className="btn small" style={{ cursor: "pointer" }}>
              Choose file
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => onFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        )}
        {preview && (
          <button className="remove" title="Remove image" onClick={onRemoveImage} aria-label="Remove image">×</button>
        )}
      </div>
      <div className="label-row">
        <input value={label} onChange={(e) => onLabel(e.target.value.slice(0, 24))} placeholder={`Label — e.g. ${index === 0 ? "Fit A" : "Fit B"}`} aria-label={`Label for option ${index + 1}`} />
        <span style={{ fontSize: 10, color: "var(--muted2)", fontWeight: 800 }}>{label.length}/24</span>
      </div>
      <div style={{ padding: "6px 8px", background: "var(--card)" }}>
        {!urlMode ? (
          <button className="url-toggle" onClick={() => setUrlMode(true)} type="button">Paste image URL instead</button>
        ) : (
          <div>
            <input className="url-input" value={rawUrl} onChange={(e) => onUrl(e.target.value)} placeholder="https://…" autoFocus />
            <button className="url-toggle" onClick={() => setUrlMode(false)} type="button" style={{ marginTop: 4 }}>Use upload instead</button>
          </div>
        )}
      </div>
      {canRemoveOption && onRemoveOption && (
        <button
          title="Remove option"
          onClick={onRemoveOption}
          style={{ position: "absolute", top: 8, left: 8, fontSize: 10, padding: "4px 8px", borderRadius: 999, border: "1px solid var(--line)", background: "rgba(255,255,255,.9)", cursor: "pointer", fontWeight: 800 }}
        >
          Remove
        </button>
      )}
    </div>
  );
}
