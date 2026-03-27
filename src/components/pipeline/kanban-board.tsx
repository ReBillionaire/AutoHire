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
  { id: 'Applied', label: 'Applied', dot: 'bg-blue-500' },
  { id: 'Screening', label: 'Screening', dot: 'bg-violet-500' },
  { id: 'Assessment', label: 'Assessment', dot: 'bg-amber-500' },
  { id: 'Interview', label: 'Interview', dot: 'bg-cyan-500' },
  { id: 'Offer', label: 'Offer', dot: 'bg-emerald-500' },
  { id: 'Hired', label: 'Hired', dot: 'bg-green-500' },
  { id: 'Rejected', label: 'Rejected', dot: 'bg-red-500' },
];

export function KanbanBoard({ candidates, jobTitle }: KanbanBoardProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const handleDragStart = (e: React.DragEvent, candidate: Candidate) => {
    setDraggedCandidate(candidate);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    if (draggedCandidate && draggedCandidate.stage !== targetStage) {
      console.log(`Moving ${draggedCandidate.name} from ${draggedCandidate.stage} to ${targetStage}`);
    }
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailPanelOpen(true);
  };

  return (
    <>
      <div className="h-full px-4 md:px-6 lg:px-8 pb-6 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = candidates.filter((c) => c.stage === stage.id);
            const isDragOver = dragOverStage === stage.id && draggedCandidate?.stage !== stage.id;

            return (
              <div key={stage.id} className="flex flex-col w-72 flex-shrink-0">
                {/* Column header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                      <span className="text-[13px] font-semibold text-foreground">{stage.label}</span>
                    </div>
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {stageCandidates.length}
                    </span>
                  </div>
                  <div className={`h-0.5 rounded-full ${stage.dot} opacity-60`} />
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  className={`flex-1 rounded-xl border border-dashed transition-all duration-200 overflow-y-auto ${
                    isDragOver
                      ? 'border-primary bg-primary/5 scale-[1.01]'
                      : 'border-border/50 bg-muted/20'
                  }`}
                >
                  <div className="flex flex-col gap-2.5 p-3">
                    {stageCandidates.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
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
