import Image from "next/image";
import type { FC } from "react";
import { IoIosFlash } from "react-icons/io";
import { LuGamepad2, LuGraduationCap } from "react-icons/lu";
import { TbTimeDuration30 } from "react-icons/tb";
import { Typography } from "@/components/common/atoms/typography";
import type { InterviewConfig } from "@/components/configure/utils/types";
import { cn } from "@/lib/utils";

interface ModeSelectionStepProps {
  config: InterviewConfig;
  onSelect: (mode: string) => void;
}

export const ModeSelectionStep: FC<ModeSelectionStepProps> = ({
  config,
  onSelect,
}) => {
  const currentMode = config.interviewMode;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      {/* 1. FLASH / QUICK MODE - High-End "Wrapped" Style */}
      <button
        type="button"
        className={cn(
          "md:col-span-2 bg-black rounded-[32px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-end border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5 cursor-pointer group text-left",
          currentMode === "flash" &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        onClick={() => onSelect("flash")}
      >
        <Image
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3"
          alt="Abstract fluid background"
          fill
          className="object-cover opacity-60 mix-blend-lighten pointer-events-none transition-transform group-hover:scale-105 duration-700"
          priority
        />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <IoIosFlash className="size-6 text-white" />
            </div>
          </div>
          <div className="font-[family-name:var(--font-space-grotesk)] text-7xl sm:text-8xl lg:text-[120px] font-bold leading-[0.8] tracking-tighter text-white -ml-1 sm:-ml-1.5 uppercase text-left">
            Flash
          </div>
          <div className="mt-6 bg-white/10 backdrop-blur-md border-t border-white/20 p-4 sm:p-5 rounded-2xl w-full">
            <p className="text-sm sm:text-base font-medium opacity-90 text-white leading-relaxed">
              Quick 3-question session.
            </p>
          </div>
        </div>
      </button>

      {/* 2. REGULAR MODE - "Peak Productivity" Style */}
      <button
        type="button"
        className={cn(
          "bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-[32px] p-6 sm:p-8 border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between text-left",
          currentMode === "regular" &&
            "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        onClick={() => onSelect("regular")}
      >
        <div className="w-full">
          <div className="flex flex-row-reverse justify-between items-start">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40">
              <TbTimeDuration30 className="size-5" />
            </div>
            <div>
              <div className="text-2xl sm:text-[28px] font-bold text-white mb-1">
                Regular
              </div>
              <div className="text-sm text-[#a1a1aa] mb-6 leading-relaxed">
                Realistic time pressure.
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            {[
              1, 2, 1, 3, 2, 1, 1, 2, 3, 3, 3, 3, 2, 1, 1, 2, 3, 2, 1, 1, 1, 1,
              1, 2, 1, 1, 2, 1, 1, 2, 2, 3, 2, 1, 2,
            ].map((level, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-[3px]",
                  level === 1
                    ? "bg-[#262626]"
                    : level === 2
                      ? "bg-primary/40"
                      : "bg-primary",
                )}
              />
            ))}
          </div>
        </div>
      </button>

      {/* 3. PRACTICE MODE - "Persona" Style */}
      <button
        type="button"
        className={cn(
          "bg-white text-black rounded-[32px] p-6 sm:p-8 flex flex-col justify-between min-h-[320px] sm:min-h-[380px] border border-[#262626] transition-all hover:border-[#404040] hover:-translate-y-0.5 cursor-pointer text-left",
          currentMode === "practice" && "ring-4 ring-primary ring-offset-2",
        )}
        onClick={() => onSelect("practice")}
      >
        <div className="text-center flex-1 flex flex-col justify-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10 sm:w-12 sm:h-12"
              role="img"
              aria-label="Practice Mode Icon"
            >
              <title>Practice Mode</title>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div className="text-xs font-semibold uppercase mb-2 opacity-40 tracking-widest font-mono">
            untimed
          </div>
          <div className="font-[family-name:var(--font-space-grotesk)] text-3xl sm:text-[36px] font-bold leading-tight tracking-tight mb-2">
            Practice
          </div>
        </div>

        <div className="text-sm leading-relaxed font-medium border-t border-black/10 pt-5 opacity-70 italic w-full">
          Take your time to think. Feel free to use the internet and research.
        </div>
      </button>
      {/* -- BOTTOM ROW -- */}

      {/* 4. PLAY MODE - Elite Console Aesthetic */}
      <div className="relative overflow-hidden md:col-span-2 min-h-[380px] rounded-[32px] bg-[#0C0C0E] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(255,255,255,0.02)] pointer-events-none group p-2">
        {/* Console Chassis / Side Rails */}
        <div className="absolute inset-x-0 inset-y-8 flex justify-between pointer-events-none">
          <div className="w-[4px] h-full bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent blur-[1px]" />
          <div className="w-[4px] h-full bg-gradient-to-b from-transparent via-fuchsia-500/40 to-transparent blur-[1px]" />
        </div>

        {/* Internal Screen Housing */}
        <div className="relative w-full h-full rounded-[28px] bg-[#050505] overflow-hidden border border-white/5 flex flex-col items-center justify-center p-8">
          {/* Immersive Glass Layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px]" />

          {/* HUD Metadata */}
          <div className="absolute top-6 left-8 right-8 flex justify-between items-center opacity-30">
            <div className="flex gap-2 items-center">
              <div className="w-12 h-1.5 rounded-full bg-cyan-500/20 overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-500" />
              </div>
              <span className="text-[7px] font-mono text-cyan-400 tracking-wider">
                SYSTEM LOAD
              </span>
            </div>
            <span className="text-[7px] font-mono text-fuchsia-400 tracking-[0.3em]">
              B-ENGINE {/* // 004 */}
            </span>
          </div>

          {/* Main Game UI */}
          <div className="relative z-20 flex flex-col items-center gap-4">
            <div className="relative group/icon">
              <div className="absolute inset-0 bg-fuchsia-500/20 blur-2xl animate-pulse rounded-full" />
              <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 border border-white/10 backdrop-blur-xl shadow-2xl">
                <LuGamepad2 className="size-16 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>

            <div className="text-center">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-6xl sm:text-[60px] font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                PLAY MODE
              </h2>
              <div className="flex justify-center gap-4 mt-2">
                <span className="px-2 py-0.5 rounded-sm border border-cyan-500/30 text-cyan-400 text-[8px] font-bold tracking-widest uppercase">
                  Coming soon...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware Footer */}
        <div className="absolute bottom-4 left-0 right-0 px-10 flex justify-between items-center opacity-10">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-1 bg-white rounded-full" />
            ))}
          </div>
          <span className="text-[8px] font-mono text-white tracking-widest uppercase italic">
            Advanced Simulation Core
          </span>
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-4 h-1 bg-white rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* 5. COMPETITIVE MODE - CLI Aesthetic */}
      <div className="relative overflow-hidden md:col-span-2 min-h-[380px] rounded-[32px] border border-border/20 bg-[#0D0D0F] pointer-events-none group flex flex-col p-6 sm:p-8">
        {/* Terminal Header */}
        <div className="flex items-center gap-1.5 mb-6 opacity-40">
          <div className="size-2.5 rounded-full bg-red-500/50" />
          <div className="size-2.5 rounded-full bg-yellow-500/50" />
          <div className="size-2.5 rounded-full bg-green-500/50" />
          <div className="ml-2 text-[10px] font-mono text-white/40 uppercase tracking-widest">
            bash — 80×24
          </div>
        </div>

        <div className="flex-1 font-mono text-sm sm:text-base space-y-4 opacity-80 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-2">
            <span className="text-green-500">➜</span>
            <span className="text-cyan-400">~</span>
            <span className="text-white">blairify --mode competitive</span>
          </div>

          <div className="text-white/60 leading-relaxed">
            <div className="text-white italic mb-2">
              {/* // Initializing ranked environment... */}
              Initializing ranked environment...
            </div>
            <div>[OK] Loading global leaderboards</div>
            <div>[OK] Connecting to Arena matchmaking</div>
            <div>[OK] Verifying anti-cheat protocols</div>
          </div>

          <div className="pt-4">
            <div className="font-bold text-white text-3xl sm:text-4xl tracking-tighter uppercase mb-4">
              Competitive
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 animate-pulse">●</span>
              <span className="text-white/40 text-xs">
                Waiting for deployment coming soon...
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. TEACHER MODE - Neuro-Architect Aesthetic */}
      <div className="relative overflow-hidden min-h-[380px] rounded-[32px] border border-emerald-500/20 bg-[#060606] pointer-events-none group flex flex-col p-8 shadow-[0_0_50px_rgba(16,185,129,0.05)]">
        {/* Holographic Neural Grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[length:24px_24px]" />

        {/* Animated Scanning Line */}
        <div className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent top-[-100px] animate-[scan_4s_linear_infinite] z-0" />
        <div className="absolute inset-x-0 h-[1px] bg-emerald-300/40 top-[-1px] animate-[scan_4s_linear_infinite] z-0" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
                  @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(480px); }
                  }
                `,
          }}
        />

        {/* Dynamic Light Streams */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/25 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-300/15 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.02] via-transparent to-emerald-400/[0.02] pointer-events-none" />

        <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px] bg-black/20">
          <div className="px-6 py-2 rounded-full bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 shadow-2xl">
            <Typography.Caption className="text-emerald-400 text-xs uppercase font-black tracking-[0.3em] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
              Coming Soon
            </Typography.Caption>
          </div>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between opacity-30">
          <div className="flex justify-between items-start">
            <div className="px-4 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                AI Architect
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-inner">
              <LuGraduationCap className="size-6 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-[0.4em] mb-2">
                Neural Link Active
              </div>
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-4xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none">
                Teacher
              </h2>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 p-5">
              <div className="absolute left-0 top-0 w-[2px] h-full bg-emerald-500/40" />
              <Typography.Caption className="text-emerald-50/50 text-sm font-medium leading-relaxed block italic">
                Get real-time feedback on your answers with interactive
                mentorship and deep technical analysis.
              </Typography.Caption>
            </div>
          </div>
        </div>

        {/* HUD Footnote */}
        <div className="absolute bottom-4 right-8 opacity-10">
          <span className="text-[8px] font-mono text-emerald-500 tracking-widest uppercase">
            Deep Inference Engine v1.4
          </span>
        </div>
      </div>
    </div>
  );
};
