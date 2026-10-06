import React from "react";

interface PriceTagProps {
  amount: number;
  unit?: string;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  amount,
  unit,
  currency = "TL",
  size = "md",
  className = "",
}) => {
  const formattedAmount = (amount || 0).toLocaleString("tr-TR");

  const sizeClasses = {
    sm: {
      amount: "text-base font-bold",
      unit: "text-[11px]",
    },
    md: {
      amount: "text-lg sm:text-xl font-extrabold",
      unit: "text-xs",
    },
    lg: {
      amount: "text-2xl sm:text-3xl font-black",
      unit: "text-sm",
    },
  };

  return (
    <div className={`inline-flex items-baseline gap-1.5 flex-wrap ${className}`}>
      <span className={`${sizeClasses[size].amount} text-[#F59E0B] tracking-tight leading-none`}>
        {formattedAmount} {currency}
      </span>
      {unit && (
        <span className={`${sizeClasses[size].unit} text-[#8BAF9B] font-semibold opacity-90`}>
          / {unit}
        </span>
      )}
    </div>
  );
};
