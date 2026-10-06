import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-3.5 my-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-[#10352B] border border-[#20C878]/15 rounded-[16px] p-4 animate-pulse flex flex-col gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-[12px] bg-[#164C3B]/60 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#164C3B]/80 rounded w-3/4" />
              <div className="h-3 bg-[#164C3B]/60 rounded w-1/2" />
              <div className="h-4 bg-[#164C3B]/90 rounded w-1/3" />
            </div>
          </div>
          <div className="h-9 bg-[#164C3B]/50 rounded-[10px] w-full" />
        </div>
      ))}
    </div>
  );
};
