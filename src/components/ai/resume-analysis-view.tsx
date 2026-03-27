/**
 * Resume Analysis View Component
 * Displays detailed resume analysis with skills matrix and key insights
 */

'use client';

import React from 'react';
import { ResumeAnalysis, SkillMatch } from '@/types/ai';
import { AIScoreBadge, CompactScoreBadge } from './ai-score-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp, Mail, Phone, Linkedin, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeAnalysisViewProps {
  analysis: ResumeAnalysis;
  className?: string;
}

export function ResumeAnalysisView({ analysis, className }: ResumeAnalysisViewProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Score */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Resume Analysis</CardTitle>
              <p className="mt-2 text-sm text-gray-600">{analysis.summary}</p>
            </div>
            <AIScoreBadge score={analysis.fitScore} size="lg" />
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-2xl font-semibold">{analysis.contactInfo.name}</p>
              {analysis.contactInfo.location && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {analysis.contactInfo.location}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {analysis.contactInfo.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a href={`mailto:${analysis.contactInfo.email}`} className="text-blue-600 hover:underline">
                    {analysis.contactInfo.email}
                  </a>
                </div>
              )}
              {analysis.contactInfo.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {analysis.contactInfo.phone}
                </div>
              )}
              {analysis.contactInfo.linkedin && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-gray-500" />
                  <a
                    href={analysis.contactInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Professional Experience</CardTitle>
            <Badge variant="outline">{analysis.yearsOfExperience} years total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.experience.length > 0 ? (
              analysis.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500">{exp.duration}</p>
                    </div>
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.highlights.slice(0, 3).map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {exp.technologies.slice(0, 4).map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No experience found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.education.length > 0 ? (
              analysis.education.map((edu, idx) => (
                <div key={idx} className="border-b pb-3 last:border-0">
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-sm text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                  {edu.honors && <p className="text-xs font-medium text-green-600 mt-1">{edu.honors}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No education found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills & Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Technical Skills */}
            {analysis.skills.technical.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.technical.map((skill, idx) => (
                    <Badge key={idx} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {analysis.skills.soft.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.soft.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {analysis.skills.languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.languages.map((lang, idx) => (
                    <Badge key={idx} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {analysis.skills.certifications && analysis.skills.certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.certifications.map((cert, idx) => (
                    <Badge key={idx} variant="outline" className="border-green-200 bg-green-50">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skill Match Matrix */}
      {analysis.skillMatchMatrix.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Required Skills Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.skillMatchMatrix.map((match: SkillMatch, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {match.found ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{match.required}</h4>
                      <span className={cn('text-xs font-semibold', match.found ? 'text-green-600' : 'text-orange-600')}>
                        {match.confidence}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{match.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths, Gaps, Red Flags */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500 mt-1" />
                    {strength}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No strengths identified</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-yellow-600 rotate-180" />
              Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.gaps.length > 0 ? (
                analysis.gaps.map((gap, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-500 mt-1" />
                    {gap}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No gaps identified</p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Red Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Red Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.redFlags.length > 0 ? (
                analysis.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500 mt-1" />
                    {flag}
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No red flags</p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Career Trajectory */}
      {analysis.careerTrajectory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Career Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{analysis.careerTrajectory}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
