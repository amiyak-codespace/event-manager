import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  LayoutDashboard,
  CalendarDays,
  Pencil,
  Trash2,
  FileText,
  RefreshCw,
  LogOut,
  BookOpen,
  Globe,
  Archive,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { cmsApi, type CmsPost, type PostStatus } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; bg: string; icon: typeof BookOpen }> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    icon: BookOpen,
  },
  PUBLISHED: {
    label: 'Published',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    icon: Globe,
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    icon: Archive,
  },
};

interface PostFormData {
  title: string;
  content: string;
  category: string;
  status: PostStatus;
}

const EMPTY_FORM: PostFormData = {
  title: '',
  content: '',
  category: '',
  status: 'DRAFT',
};

export function CmsBoardPage() {
  const { user, logout } = useAuth();

  const [posts, setPosts] = useState<CmsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CmsPost | null>(null);
  const [form, setForm] = useState<PostFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CmsPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await cmsApi.list();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  function openCreate() {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(post: CmsPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      content: post.content,
      category: post.category ?? '',
      status: post.status,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        status: form.status,
        ...(form.category ? { category: form.category } : {}),
      };
      if (editingPost) {
        await cmsApi.update(editingPost.id, payload);
      } else {
        await cmsApi.create(payload);
      }
      await fetchPosts();
      setShowForm(false);
      setEditingPost(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await cmsApi.remove(deleteTarget.id);
      await fetchPosts();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const draftCount = posts.filter(p => p.status === 'DRAFT').length;
  const publishedCount = posts.filter(p => p.status === 'PUBLISHED').length;
  const archivedCount = posts.filter(p => p.status === 'ARCHIVED').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Gradient Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">CMS Board</h1>
              <p className="text-xs text-indigo-200">
                {posts.length} post{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg"
              >
                <CalendarDays className="h-4 w-4" />
                Events
              </Button>
            </Link>
            <span className="text-xs text-indigo-200 hidden sm:inline font-medium">
              {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-white text-violet-700 hover:bg-white/90 font-semibold rounded-lg shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Drafts', value: draftCount, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: BookOpen },
            { label: 'Published', value: publishedCount, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Globe },
            { label: 'Archived', value: archivedCount, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: Archive },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex items-center gap-3`}>
              <div className={`h-10 w-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void fetchPosts()}
            title="Refresh"
            className="rounded-xl bg-white border-slate-200 text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-slate-500">{error}</p>
            <Button variant="outline" onClick={() => void fetchPosts()} className="rounded-xl">
              Retry
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                <Plus className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">No CMS posts yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first post to get started.</p>
            </div>
            <Button onClick={openCreate} className="btn-primary-gradient rounded-xl px-6">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        )}

        {/* Posts grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {posts.map((post) => {
              const statusCfg = STATUS_CONFIG[post.status];
              const StatusIcon = statusCfg.icon;
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm card-hover flex flex-col overflow-hidden"
                >
                  {/* Top stripe */}
                  <div className={`h-1.5 w-full ${
                    post.status === 'PUBLISHED'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                      : post.status === 'DRAFT'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                        : 'bg-gradient-to-r from-slate-300 to-slate-400'
                  }`} />

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1">{post.title}</h3>
                      <span
                        className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${statusCfg.color} ${statusCfg.bg}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {post.category && (
                      <Badge variant="secondary" className="w-fit text-xs rounded-lg">
                        {post.category}
                      </Badge>
                    )}

                    <p className="text-sm text-slate-500 line-clamp-3 flex-1 leading-relaxed">{post.content}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                      <span className="font-medium text-slate-500">{post.author?.name ?? 'Unknown'}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="px-5 pb-4 flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl gap-1.5"
                      onClick={() => openEdit(post)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl gap-1.5"
                      onClick={() => setDeleteTarget(post)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {editingPost ? 'Update your content below' : 'Fill in the details to create a new post'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-title" className="font-medium">Title</Label>
                <Input
                  id="post-title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-content" className="font-medium">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Write your content here…"
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="rounded-xl resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="post-category" className="font-medium">Category <span className="text-slate-400 font-normal">(optional)</span></Label>
                  <Input
                    id="post-category"
                    placeholder="e.g. Announcement"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-medium">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm({ ...form, status: v as PostStatus })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                }}
                disabled={saving}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleSave()}
                disabled={saving || !form.title || !form.content}
                className="btn-primary-gradient rounded-xl"
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </div>
                ) : editingPost ? 'Save changes' : 'Create post'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <span className="text-xl">🗑️</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Delete Post?</h3>
            <p className="text-sm text-slate-500 mt-1.5">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-xl"
              >
                {deleting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </div>
                ) : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
