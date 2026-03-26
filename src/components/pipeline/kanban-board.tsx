'use client';

import { useState } from 'react';
import { CandidateCard } from './candidate-card';
import { CandidateDetailPanel } from './candidate-detail-panel';

interface Candidate {
  id: string;
  name: string;
  title: string;
  company: string;
  stage: string;
  aiScore: number;
  discProfile: string;
  source: string;
  avatar: string;
  timeInStage: string;
  appliedDate: string;
  jobId: string;
}

interface KanbanBoardProps {
  candidates: Candidate[];
  jobTitle?: string;
}

const PIPELINE_STAGES = [
  { id: 'Applied', label: 'Applied', color: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 'Screening', label: 'Screening', color: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 'Assessment', label: 'Assessment', color: 'bg-amber-50 dark:bg-amber-950', borderColor: 'border-amber-200 dark:border-amber-800' },
  { id: 'Interview', label: 'Interview', color: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
  { id: 'Offer', label: 'Offer', color: 'bg-emerald-50 dark:bg-emerald-950', borderColor: 'border-emerald-200 dark:border-emerald-800' },
  { id: 'Hired', label: 'Hired', color: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },
  { id: 'Rejected', label: 'Rejected', color: 'bg-red-50 dark:bg-red-950', borderColor: 'border-red-200 dark:border-red-800' },
];

export function KanbanBoard({ candidates, jobTitle }: KanbanBoardProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.stage !== targetStage) {
      // TODO: Update candidate stage in API
      console.log(`Moving ${draggedCandidate.name} from ${draggedCandidate.stage} to ${targetStage}`);
    }
    setDraggedCandidate(null);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailPanelOpen(true);
  };

  return (
    <>
      <div className="p-6 h-full">
        {/* Kanban Board */}
        <div className="flex gap-6 h-full overflow-x-auto pb-6">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = candidates.filter((c) => c.stage === stage.id);

            return (
              <div key={stage.id} className="flex flex-col flex-shrink-0 w-80">
                {/* Column Header */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{
                        backgroundColor: stage.id === 'Applied' ? '#3b82f6' :
                                        stage.id === 'Screening' ? '#a855f7' :
                                        stage.id === 'Assessment' ? '#f59e0b' :
                                        stage.id === 'Interview' ? '#06b6d4' :
                                        stage.id === 'Offer' ? '#10b981' :
                                        stage.id === 'Hired' ? '#22c55e' : '#ef4444'
                      }} />
                      {stage.label}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <div className="h-1 bg-gradient-to-r rounded-full" style={{
                    background: stage.id === 'Applied' ? '#3b82f6' :
                               stage.id === 'Screening' ? '#a855f7' :
                               stage.id === 'Assessment' ? '#f59e0b' :
                               stage.id === 'Interview' ? '#06b6d4' :
                               stage.id === 'Offer' ? '#10b981' :
                               stage.id === 'Hired' ? '#22c55e' : '#ef4444'
                  }} />
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex-1 rounded-lg border-2 border-dashed transition-colors ${
                    draggedCandidate?.stage !== stage.id
                      ? `${stage.borderColor} bg-opacity-30`
                      : 'border-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col gap-3 p-4">
                    {stageCandidates.length === 0 ? (
                      <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm">
                        No candidates
                      </div>
                    ) : (
                      stageCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, candidate)}
                          onClick={() => handleCandidateClick(candidate)}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <CandidateCard candidate={candidate} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <CandidateDetailPanel
        candidate={selectedCandidate}
        isOpen={isDetailPanelOpen}
        onClose={() => {
          setIsDetailPanelOpen(false);
          setSelectedCandidate(null);
        }}
      />
    </>
  );
}
