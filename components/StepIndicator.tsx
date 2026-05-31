"use client";

const STEPS = [
  { id: 1, label: "商品录入" },
  { id: 2, label: "AI 分析" },
  { id: 3, label: "素材预览" },
  { id: 4, label: "迭代演示" },
];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-xl mx-auto">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? "bg-orange-500 text-white"
                    : active
                    ? "bg-orange-500 text-white ring-4 ring-orange-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : step.id}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  active ? "text-orange-500" : done ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 -mt-5 mx-1 transition-all ${
                  done ? "bg-orange-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
