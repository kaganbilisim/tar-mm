import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { HarvestRecord } from "../types";
import { TrendingUp, BarChart3, Calendar, Scale, Award, ArrowUpRight } from "lucide-react";

interface HarvestAnalyticsProps {
  harvests: HarvestRecord[];
  isDark: boolean;
}

interface MonthlyData {
  monthKey: string;      // "2026-05"
  monthLabel: string;    // "Mayıs 2026"
  shortLabel: string;    // "May"
  totalKg: number;
  teaKg: number;
  hazelnutKg: number;
  otherKg: number;
  totalRevenue: number;
  avgPrice: number;
  harvestCount: number;
}

export const HarvestAnalytics: React.FC<HarvestAnalyticsProps> = ({ harvests, isDark }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [metricMode, setMetricMode] = useState<"kg" | "revenue">("kg");
  const [hoveredData, setHoveredData] = useState<MonthlyData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Month names in Turkish
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const shortMonthNames = [
    "Oca", "Şub", "Mar", "Nis", "May", "Haz",
    "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
  ];

  // Process data by month
  const monthlyData: MonthlyData[] = useMemo(() => {
    if (!harvests || harvests.length === 0) return [];

    const map = new Map<string, {
      totalKg: number;
      teaKg: number;
      hazelnutKg: number;
      otherKg: number;
      totalRevenue: number;
      count: number;
      year: number;
      month: number;
    }>();

    harvests.forEach((h) => {
      // Parse date: e.g. "2026-08-15" or "15.08.2026"
      let dateObj: Date | null = null;
      if (h.date.includes("-")) {
        dateObj = new Date(h.date);
      } else if (h.date.includes(".")) {
        const parts = h.date.split(".");
        if (parts.length === 3) {
          dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }

      if (!dateObj || isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      const year = dateObj.getFullYear();
      const month = dateObj.getMonth(); // 0 - 11
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      const curr = map.get(key) || {
        totalKg: 0,
        teaKg: 0,
        hazelnutKg: 0,
        otherKg: 0,
        totalRevenue: 0,
        count: 0,
        year,
        month,
      };

      const kg = h.quantityKg || 0;
      curr.totalKg += kg;
      curr.totalRevenue += h.grossAmount || 0;
      curr.count += 1;

      // Classify by crop
      const crop = (h.cropType || "").toLowerCase();
      if (crop.includes("çay") || crop.includes("cay")) {
        curr.teaKg += kg;
      } else if (crop.includes("fındık") || crop.includes("findik")) {
        curr.hazelnutKg += kg;
      } else {
        curr.otherKg += kg;
      }

      map.set(key, curr);
    });

    // Sort chronologically
    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((k) => {
      const val = map.get(k)!;
      return {
        monthKey: k,
        monthLabel: `${monthNames[val.month]} ${val.year}`,
        shortLabel: shortMonthNames[val.month],
        totalKg: val.totalKg,
        teaKg: val.teaKg,
        hazelnutKg: val.hazelnutKg,
        otherKg: val.otherKg,
        totalRevenue: val.totalRevenue,
        avgPrice: val.totalKg > 0 ? val.totalRevenue / val.totalKg : 0,
        harvestCount: val.count,
      };
    });
  }, [harvests]);

  // Overall calculations
  const stats = useMemo(() => {
    if (monthlyData.length === 0) {
      return { peakMonth: null, totalKg: 0, totalRevenue: 0, avgMonthlyKg: 0 };
    }
    let peak: MonthlyData = monthlyData[0];
    let totalKg = 0;
    let totalRevenue = 0;

    monthlyData.forEach((m) => {
      if (m.totalKg > peak.totalKg) peak = m;
      totalKg += m.totalKg;
      totalRevenue += m.totalRevenue;
    });

    return {
      peakMonth: peak,
      totalKg,
      totalRevenue,
      avgMonthlyKg: Math.round(totalKg / monthlyData.length),
    };
  }, [monthlyData]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || monthlyData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    // Get width from container
    const width = containerRef.current ? containerRef.current.clientWidth : 360;
    const height = 230;
    const margin = { top: 20, right: 16, bottom: 38, left: 46 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define gradients
    const defs = svg.append("defs");

    // Bar gradient (Emerald to Teal)
    const barGradient = defs
      .append("linearGradient")
      .attr("id", "harvestBarGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    barGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#20C878")
      .attr("stop-opacity", 0.95);

    barGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#0F766E")
      .attr("stop-opacity", 0.7);

    // Active Bar gradient
    const activeBarGradient = defs
      .append("linearGradient")
      .attr("id", "harvestActiveBarGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    activeBarGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4ADE80")
      .attr("stop-opacity", 1);

    activeBarGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#15803D")
      .attr("stop-opacity", 0.9);

    // X scale
    const x = d3
      .scaleBand()
      .domain(monthlyData.map((d) => d.shortLabel))
      .range([0, innerWidth])
      .padding(0.32);

    // Y scale
    const yMax = d3.max(monthlyData, (d) => (metricMode === "kg" ? d.totalKg : d.totalRevenue)) || 100;
    const y = d3
      .scaleLinear()
      .domain([0, yMax * 1.15])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines (horizontal)
    const yAxisTicks = y.ticks(4);
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(yAxisTicks)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")
      .attr("stroke-dasharray", "3,3");

    // X Axis
    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0));

    xAxis.select(".domain").attr("stroke", isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)");
    xAxis
      .selectAll("text")
      .attr("fill", isDark ? "#8BAF9B" : "#4B5563")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("dy", "12px");

    // Y Axis
    const formatY = (d: d3.NumberValue) => {
      const num = Number(d);
      if (metricMode === "kg") {
        if (num >= 1000) return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}t`;
        return `${num}kg`;
      } else {
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k₺`;
        return `${num}₺`;
      }
    };

    const yAxis = g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat((d) => formatY(d))
        .tickSize(0)
    );

    yAxis.select(".domain").remove();
    yAxis
      .selectAll("text")
      .attr("fill", isDark ? "#8BAF9B" : "#6B7280")
      .attr("font-size", "10px")
      .attr("font-weight", "500")
      .attr("dx", "-4px");

    // Bars
    const bars = g
      .selectAll(".bar")
      .data(monthlyData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.shortLabel) || 0)
      .attr("width", x.bandwidth())
      .attr("y", innerHeight)
      .attr("height", 0)
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "url(#harvestBarGradient)")
      .attr("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("fill", "url(#harvestActiveBarGradient)")
          .attr("transform", "scale(1.03)")
          .attr("transform-origin", `${(x(d.shortLabel) || 0) + x.bandwidth() / 2}px ${y(metricMode === "kg" ? d.totalKg : d.totalRevenue)}px`);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = event.clientX - rect.left;
          const clientY = event.clientY - rect.top;
          setTooltipPos({ x: clientX, y: clientY });
          setHoveredData(d);
        }
      })
      .on("mousemove", function (event) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("fill", "url(#harvestBarGradient)")
          .attr("transform", "scale(1)")
          .attr("transform-origin", "center");
        setHoveredData(null);
      });

    // Bar animation
    bars
      .transition()
      .duration(700)
      .delay((_, i) => i * 60)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(metricMode === "kg" ? d.totalKg : d.totalRevenue))
      .attr("height", (d) => innerHeight - y(metricMode === "kg" ? d.totalKg : d.totalRevenue));

    // Value Labels on top of bars
    g.selectAll(".bar-label")
      .data(monthlyData)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", (d) => (x(d.shortLabel) || 0) + x.bandwidth() / 2)
      .attr("y", innerHeight)
      .attr("text-anchor", "middle")
      .attr("fill", isDark ? "#C7DDD0" : "#1F2937")
      .attr("font-size", "9.5px")
      .attr("font-weight", "700")
      .text((d) => {
        const val = metricMode === "kg" ? d.totalKg : d.totalRevenue;
        if (val === 0) return "";
        if (metricMode === "kg") {
          return val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${Math.round(val)}`;
        } else {
          return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${Math.round(val)}`;
        }
      })
      .transition()
      .duration(700)
      .delay((_, i) => i * 60 + 200)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(metricMode === "kg" ? d.totalKg : d.totalRevenue) - 6);

    // Trend Curve (Spline Line)
    const lineGenerator = d3
      .line<MonthlyData>()
      .x((d) => (x(d.shortLabel) || 0) + x.bandwidth() / 2)
      .y((d) => y(metricMode === "kg" ? d.totalKg : d.totalRevenue))
      .curve(d3.curveMonotoneX);

    const path = g
      .append("path")
      .datum(monthlyData)
      .attr("fill", "none")
      .attr("stroke", "#8FE3AE")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.65)
      .attr("d", lineGenerator);

    const pathLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${pathLength} ${pathLength}`)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
  }, [monthlyData, metricMode, isDark]);

  if (harvests.length === 0) {
    return (
      <div
        className={`p-5 rounded-2xl border text-center transition-all ${
          isDark
            ? "bg-[#10352B]/60 border-[#20C878]/20 text-[#8BAF9B]"
            : "bg-emerald-50/70 border-emerald-200 text-emerald-800"
        }`}
      >
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#20C878] opacity-75" />
        <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
          Aylık Hasat Verimlilik Grafiği
        </h4>
        <p className="text-xs opacity-75 max-w-xs mx-auto">
          Kaydedilen hasatlar doğrultusunda aylık verim grafiğiniz ve trend analiziniz burada otomatik hesaplanır.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id="harvest-analytics-widget"
      className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
        isDark
          ? "bg-[#10352B]/80 border-[#20C878]/30 text-[#F5FFF8] shadow-lg shadow-black/20"
          : "bg-white border-emerald-200 text-gray-900 shadow-sm"
      }`}
    >
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#20C878]/20 text-[#20C878] flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#20C878]">
                HASAT VERİMLİLİK ANALİZİ
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-[#20C878]/15 text-[#8FE3AE] border border-[#20C878]/30">
                D3.js
              </span>
            </div>
            <div className="text-xs font-semibold opacity-85">
              Aylık Üretim & Verim Trendi
            </div>
          </div>
        </div>

        {/* KG vs TL Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/25 border border-[#20C878]/20">
          <button
            type="button"
            onClick={() => setMetricMode("kg")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              metricMode === "kg"
                ? "bg-[#20C878] text-[#071C17] shadow-xs"
                : "text-[#8BAF9B] hover:text-[#F5FFF8]"
            }`}
          >
            Hasat (KG)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("revenue")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              metricMode === "revenue"
                ? "bg-[#20C878] text-[#071C17] shadow-xs"
                : "text-[#8BAF9B] hover:text-[#F5FFF8]"
            }`}
          >
            Gelir (TL)
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div
          className={`p-2 rounded-xl border flex flex-col justify-between ${
            isDark ? "bg-[#0B241D]/90 border-[#20C878]/20" : "bg-emerald-50/60 border-emerald-100"
          }`}
        >
          <span className="text-[10px] text-[#8BAF9B] font-medium flex items-center gap-1">
            <Scale className="w-3 h-3 text-[#20C878]" />
            Toplam Hacim
          </span>
          <span className="text-xs font-black text-[#8FE3AE] mt-0.5">
            {stats.totalKg >= 1000 ? `${(stats.totalKg / 1000).toFixed(2)} ton` : `${stats.totalKg.toLocaleString("tr-TR")} kg`}
          </span>
        </div>

        <div
          className={`p-2 rounded-xl border flex flex-col justify-between ${
            isDark ? "bg-[#0B241D]/90 border-[#20C878]/20" : "bg-emerald-50/60 border-emerald-100"
          }`}
        >
          <span className="text-[10px] text-[#8BAF9B] font-medium flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            Zirve Ay
          </span>
          <span className="text-xs font-black text-amber-300 mt-0.5 truncate">
            {stats.peakMonth ? stats.peakMonth.shortLabel : "-"} (
            {stats.peakMonth ? `${Math.round(stats.peakMonth.totalKg)} kg` : ""}
            )
          </span>
        </div>

        <div
          className={`p-2 rounded-xl border flex flex-col justify-between ${
            isDark ? "bg-[#0B241D]/90 border-[#20C878]/20" : "bg-emerald-50/60 border-emerald-100"
          }`}
        >
          <span className="text-[10px] text-[#8BAF9B] font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#20C878]" />
            Aylık Ort.
          </span>
          <span className="text-xs font-black text-[#8FE3AE] mt-0.5">
            {stats.avgMonthlyKg.toLocaleString("tr-TR")} kg/ay
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full flex justify-center">
        <svg ref={svgRef} className="overflow-visible select-none max-w-full" />

        {/* Hover Tooltip */}
        {hoveredData && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none p-2.5 rounded-xl text-xs shadow-xl border backdrop-blur-md transition-transform"
            style={{
              left: `${Math.min(Math.max(tooltipPos.x - 70, 10), (containerRef.current?.clientWidth || 300) - 150)}px`,
              top: `${Math.max(tooltipPos.y - 85, 0)}px`,
              backgroundColor: isDark ? "rgba(7, 28, 23, 0.95)" : "rgba(255, 255, 255, 0.95)",
              borderColor: "#20C878",
              color: isDark ? "#F5FFF8" : "#071C17",
            }}
          >
            <div className="font-extrabold text-[#20C878] border-b border-emerald-500/20 pb-1 mb-1 flex items-center justify-between gap-3">
              <span>{hoveredData.monthLabel}</span>
              <span className="text-[10px] text-[#8BAF9B]">{hoveredData.harvestCount} Hasat</span>
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between gap-3">
                <span className="text-[#8BAF9B]">Toplam Miktar:</span>
                <span className="font-bold text-[#8FE3AE]">{hoveredData.totalKg.toLocaleString("tr-TR")} KG</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#8BAF9B]">Brüt Tutar:</span>
                <span className="font-bold">{hoveredData.totalRevenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#8BAF9B]">Ortalama Birim:</span>
                <span className="font-bold text-amber-300">{hoveredData.avgPrice.toFixed(2)} TL/KG</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#8BAF9B] pt-2 border-t border-[#20C878]/15 mt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-xs bg-[#20C878]" />
            <span>{metricMode === "kg" ? "Hasat Hacmi (KG)" : "Brüt Ciro (TL)"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-[#8FE3AE] rounded-full" />
            <span>Eğilim Eğrisi</span>
          </div>
        </div>
        <span className="text-[10px] text-[#8FE3AE] font-semibold flex items-center gap-0.5">
          Verimlilik Ölçümü <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
