import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface SellerBadgeProps {
  verified?: boolean;
  type?: "producer" | "merchant" | "cooperative";
  label?: string;
  className?: string;
}

export const SellerBadge: React.FC<SellerBadgeProps> = ({
  verified = true,
  type = "producer",
  label,
  className = "",
}) => {
  const typeText =
    label ||
    (type === "producer"
      ? "Doğrulanmış Üretici"
      : type === "cooperative"
      ? "Kooperatif"
      : "Yerel Satıcı");

  if (!verified) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold text-[#8BAF9B] bg-[#10352B]/80 px-2 py-0.5 rounded-full border border-[#20C878]/15 ${className}`}
      >
        <span>{typeText}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-bold text-[#8FE3AE] bg-[#124235] px-2 py-0.5 rounded-full border border-[#20C878]/30 shrink-0 ${className}`}
      title="Kimliği ve bahçe kaydı onaylanmış yerel üretici"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[#20C878] shrink-0" />
      <span className="truncate">{typeText}</span>
    </span>
  );
};
