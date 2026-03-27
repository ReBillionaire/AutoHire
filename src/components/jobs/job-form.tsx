'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface JobFormProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
  onGenerateDescription?: (title: string) => Promise<void>;
  isGenerating?: boolean;
}

export function JobForm({
  initialData,
  onSave,
  onGenerateDescription,
  isGenerating = false,
}: JobFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      department: '',
      location: '',
      description: '',
      requirements: [],
      responsibilities: [],
      qualifications: [],
      benefits: [],
      type: 'full-time',
      workMode: 'hybrid',
      experienceLevel: 'mid-level',
      salary: { min: 0, max: 0, currency: 'USD' },
      skills: [],
      status: 'draft',
      customQuestions: [],
    }
  );

  const [skillInput, setSkillInput] = useState('');
  const [requirementInput, setRequirementInput] = useState('');
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const [qualificationInput, setQualificationInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()],
      });
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleAddResponsibility = () => {
    if (responsibilityInput.trim()) {
      setFormData({
        ...formData,
        responsibilities: [
          ...formData.responsibilities,
          responsibilityInput.trim(),
        ],
      });
      setResponsibilityInput('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleAddQualification = () => {
    if (qualificationInput.trim()) {
      setFormData({
        ...formData,
        qualifications: [
          ...formData.qualifications,
          qualificationInput.trim(),
        ],
      });
      setQualificationInput('');
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData({
      ...formData,
      qualifications: formData.qualifications.filter(
        (_, i) => i !== index
      ),
    });
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()],
      });
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Senior Frontend Engineer"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Department</label>
            <Input
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="e.g., Engineering"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="e.g., San Francisco, CA"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Job Type</label>
            <Select value={formData.type} onValueChange={(value) =>
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Work Mode</label>
            <Select value={formData.workMode} onValueChange={(value) =>
              setFormData({ ...formData, workMode: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Experience Level</label>
            <Select value={formData.experienceLevel} onValueChange={(value) =>
              setFormData({ ...formData, experienceLevel: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry-level">Entry-level</SelectItem>
                <SelectItem value="mid-level">Mid-level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Salary */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Compensation</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Salary Min</label>
            <Input
              type="number"
              value={formData.salary.min}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary: {
                    ...formData.salary,
                    min: parseInt(e.target.value) || 0,
                  },
                })
              }
              placeholder="150000"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Salary Max</label>
            <Input
              type="number"
              value={formData.salary.max}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  salary: {
                    ...formData.salary,
                    max: parseInt(e.target.value) || 0,
                  },
                })
              }
              placeholder="200000"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Currency</label>
            <Select value={formData.salary.currency} onValueChange={(value) =>
              setFormData({
                ...formData,
                salary: { ...formData.salary, currency: value },
              })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Description</h2>
          {onGenerateDescription && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onGenerateDescription(formData.title)}
              disabled={!formData.title || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
          )}
        </div>
        <Textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the role, team, and impact..."
          rows={8}
        />
      </div>

      {/* Requirements */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Requirements</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            placeholder="Add a requirement"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRequirement();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddRequirement}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.requirements.map((req: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <span className="text-sm">{req}</span>
              <button
                type="button"
                onClick={() => handleRemoveRequirement(idx)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Responsibilities</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={responsibilityInput}
            onChange={(e) => setResponsibilityInput(e.target.value)}
            placeholder="Add a responsibility"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddResponsibility();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddResponsibility}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.responsibilities.map((resp: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <span className="text-sm">{resp}</span>
              <button
                type="button"
                onClick={() => handleRemoveResponsibility(idx)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Qualifications */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Qualifications</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={qualificationInput}
            onChange={(e) => setQualificationInput(e.target.value)}
            placeholder="Add a qualification"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddQualification();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddQualification}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.qualifications.map((qual: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <span className="text-sm">{qual}</span>
              <button
                type="button"
                onClick={() => handleRemoveQualification(idx)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Benefits</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            placeholder="Add a benefit"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddBenefit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddBenefit}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {formData.benefits.map((benefit: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded"
            >
              <span className="text-sm">{benefit}</span>
              <button
                type="button"
                onClick={() => handleRemoveBenefit(idx)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Skills</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSkill}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill: string, idx: number) => (
            <div
              key={idx}
              className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(idx)}
                className="hover:text-primary/70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Status</h2>
        <Select value={formData.status} onValueChange={(value) =>
          setFormData({ ...formData, status: value })
        }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit */}
      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
        >
          {submitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Job'
          )}
        </Button>
      </div>
    </form>
  );
}
