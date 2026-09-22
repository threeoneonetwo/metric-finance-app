import { ImageIcon } from "lucide-react";

export function BriefImageSlot({ label, height }: { label: string; height: number }) {
  return (
    <div
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        background: "#0a101d",
        color: "#5a6b8c",
      }}
    >
      <ImageIcon size={22} strokeWidth={1.5} />
      <span style={{ fontSize: "12px", padding: "0 24px", textAlign: "center" }}>{label}</span>
    </div>
  );
}
