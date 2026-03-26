"use client";

const stages = [
  {
    name: "Applied",
    color: "border-slate-300",
    headerColor: "bg-slate-100 text-slate-700",
    candidates: [
      { id: "1", name: "David Kim", role: "UX Designer", score: 78, days: 1 },
      { id: "2", name: "Michael Brown", role: "DevOps Engineer", score: 74, days: 1 },
      { id: "3", name: "Rachel Adams", role: "Frontend Engineer", score: 81, days: 2 },
    ],
  },
  {
    name: "Screening",
    color: "border-blue-300",
    headerColor: "bg-blue-50 text-blue-700",
    candidates: [
      { id: "4", name: "James Park", role: "Product Manager", score: 85, days: 3 },
      { id: "5", name: "Emily Wright", role: "Frontend Engineer", score: 82, days: 2 },
    ],
  },
  {
    name: "Interview",
    color: "border-indigo-300",
    headerColor: "bg-indigo-50 text-indigo-700",
    candidates: [
      { id: "6", name: "Sarah Chen", role: "Frontend Engineer", score: 92, days: 5 },
      { id: "7", name: "Lisa Wang", role: "Product Manager", score: 90, days: 4 },
      { id: "8", name: "Tom Wilson", role: "Backend Engineer", score: 87, days: 3 },
    ],
  },
  {
    name: "Assessment",
    color: "border-purple-300",
    headerColor: "bg-purple-50 text-purple-700",
    candidates: [
      { id: "9", name: "Maria Garcia", role: "Backend Engineer", score: 88, days: 6 },
    ],
  },
  {
    name: "Offer",
    color: "border-green-300",
    headerColor: "bg-green-50 text-green-700",
    candidates: [
      { id: "10", name: "Alex Johnson", role: "Backend Engineer", score: 95, days: 10 },
    ],
  },
  {
    name: "Hired",
    color: "border-emerald-400",
    headerColor: "bg-emerald-50 text-emerald-700",
    candidates: [
      { id: "11", name: "Nina Patel", role: "Data Analyst", score: 91, days: 21 },
    ],
  },
];

function getScoreBg(score: number) {
  if (score >= 90) return "bg-green-100 text-green-700";
  if (score >= 80) return "bg-blue-100 text-blue-700";
  if (score >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
        <p className="text-slate-500 mt-1">Drag candidates across stages to manage your hiring pipeline</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.name} className={`flex-shrink-0 w-72 bg-slate-50 rounded-xl border-2 ${stage.color}`}>
            <div className={`px-4 py-3 rounded-t-lg ${stage.headerColor}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{stage.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">{stage.candidates.length}</span>
              </div>
            </div>

            <div className="p-3 space-y-3 min-h-[200px]">
              {stage.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {candidate.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-tight">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getScoreBg(candidate.score)}`}>
                      {candidate.score}
                    </span>
                    <span className="text-xs text-slate-400">{candidate.days}d ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}