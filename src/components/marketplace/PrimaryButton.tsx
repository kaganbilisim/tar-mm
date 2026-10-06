import React from "react";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "amber";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  children,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-bold transition-all duration-150 active:scale-[0.98] select-none rounded-[11px] min-h-[44px] px-4 cursor-pointer gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const variantClasses = {
    primary:
      "bg-[#20C878] hover:bg-[#29D17F] text-[#071C17] shadow-sm shadow-[#20C878]/20 font-extrabold",
    secondary:
      "bg-[#164C3B] hover:bg-[#1B5C48] text-[#F5FFF8] border border-[#20C878]/25",
    outline:
      "bg-transparent hover:bg-[#10352B] text-[#C7DDD0] border border-[#20C878]/30 hover:text-[#F5FFF8]",
    amber:
      "bg-[#F59E0B] hover:bg-[#D97706] text-[#071C17] font-extrabold shadow-sm shadow-[#F59E0B]/20",
    danger:
      "bg-[#EF5B5B] hover:bg-[#DC2626] text-white font-bold shadow-sm shadow-[#EF5B5B]/20",
  };

  const sizeClasses = {
    sm: "text-xs py-2 px-3 min-h-[40px]",
    md: "text-sm py-2.5 px-4 min-h-[44px]",
    lg: "text-base py-3 px-6 min-h-[48px]",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};
