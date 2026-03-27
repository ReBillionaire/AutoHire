'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Eye, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CareerPage {
  id: string;
  title: string;
  description: string;
  logo: string;
  banner: string;
  orgSlug: string;
  theme: 'light' | 'dark';
  published: boolean;
  jobCount?: number;
}

export default function CareersManagement() {
  const [careerPages, setCareerPages] = useState<CareerPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    logo: '',
    banner: '',
    theme: 'light' as 'light' | 'dark',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchCareerPages(); }, []);

  const fetchCareerPages = async () => {
    try {
      const response = await fetch('/api/careers');
      const data = await response.json();
      setCareerPages(data.careerPages || []);
    } catch (error) {
      console.error('Failed to fetch career pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/careers/${editingId}` : '/api/careers';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await fetchCareerPages();
        setOpenDialog(false);
        setEditingId(null);
        setFormData({ title: '', description: '', logo: '', banner: '', theme: 'light' });
      }
    } catch (error) {
      console.error('Failed to save career page:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (page: CareerPage) => {
    setFormData({ title: page.title, description: page.description, logo: page.logo, banner: page.banner, theme: page.theme });
    setEditingId(page.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career page?')) return;
    try {
      await fetch(`/api/careers/${id}`, { method: 'DELETE' });
      await fetchCareerPages();
    } catch (error) {
      console.error('Failed to delete career page:', error);
    }
  };

  const handleTogglePublish = async (page: CareerPage) => {
    try {
      await fetch(`/api/careers/${page.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !page.published }),
      });
      await fetchCareerPages();
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Career Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage public career pages for your organizations.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="gap-1.5 h-9 text-sm"
              onClick={() => {
                setEditingId(null);
                setFormData({ title: '', description: '', logo: '', banner: '', theme: 'light' });
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Career Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">{editingId ? 'Edit' : 'Create'} Career Page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Page Title</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Join Our Team" required className="mt-1.5 h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your organization and culture" rows={3} className="mt-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logo URL</label>
                  <Input type="url" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="mt-1.5 h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Banner URL</label>
                  <Input type="url" value={formData.banner} onChange={(e) => setFormData({ ...formData, banner: e.target.value })} placeholder="https://..." className="mt-1.5 h-9 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</label>
                <Select value={formData.theme} onValueChange={(value: 'light' | 'dark') => setFormData({ ...formData, theme: value })}>
                  <SelectTrigger className="mt-1.5 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : careerPages.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No career pages yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create a career page to showcase your open positions.</p>
          <Button size="sm" variant="outline" onClick={() => setOpenDialog(true)}>Create Your First Career Page</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {careerPages.map((page) => (
            <div key={page.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-elevation-1 transition-all">
              <div className="flex gap-4">
                {page.logo && (
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-xl border border-border overflow-hidden bg-muted">
                    <Image src={page.logo} alt={page.title} fill className="object-contain" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-foreground truncate">{page.title}</h3>
                      <p className="text-[11px] text-muted-foreground">/{page.orgSlug}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      page.published
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  {page.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{page.description}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mb-3">{page.jobCount || 0} active positions</p>
                  <div className="flex gap-1.5">
                    <Link href={`/careers/${page.orgSlug}`} target="_blank">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleEdit(page)}>
                      <Edit className="w-3 h-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleTogglePublish(page)}>
                      {page.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(page.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
