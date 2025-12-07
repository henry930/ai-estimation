'use client';

export default function ManHourSummary({
    totalMin,
    totalMax,
    rate = 100
}: {
    totalMin: number;
    totalMax: number;
    rate?: number
}) {
    const avgHours = Math.round((totalMin + totalMax) / 2);
    const cost = avgHours * rate;

    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
                <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Estimation</h2>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{totalMin}-{totalMax}</span>
                    <span className="text-gray-500 font-medium">hours</span>
                </div>
            </div>

            <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-400">Estimated Cost</span>
                    <span className="text-xl font-semibold text-green-400">
                        ${cost.toLocaleString()}
                    </span>
                </div>
                <div className="text-xs text-gray-600 text-right">
                    Based on ${rate}/hr avg rate
                </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-200">AI Confidence Score</span>
                </div>
                <div className="text-2xl font-bold text-blue-100">92%</div>
                <p className="text-xs text-blue-300/60 mt-1">High confidence based on detailed requirements.</p>
            </div>
        </div>
    );
}
