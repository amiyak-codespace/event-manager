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

const STATUS_COLORS: Record<PostStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-100 text-slate-600',
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                CMS Board
              </h1>
              <p className="text-xs text-slate-500">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <CalendarDays className="h-4 w-4" />
                Events
              </Button>
            </Link>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Refresh */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={() => void fetchPosts()} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-slate-500">{error}</p>
            <Button variant="outline" onClick={() => void fetchPosts()}>Retry</Button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-700">No CMS posts yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first post to get started.</p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-2">{post.title}</h3>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[post.status]}`}
                  >
                    {post.status}
                  </span>
                </div>

                {post.category && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    {post.category}
                  </Badge>
                )}

                <p className="text-sm text-slate-500 line-clamp-3 flex-1">{post.content}</p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>{post.author?.name ?? 'Unknown'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(post)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => setDeleteTarget(post)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="Post title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Write your content here…"
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="post-category">Category (optional)</Label>
                <Input
                  id="post-category"
                  placeholder="e.g. Announcement"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as PostStatus })}
                >
                  <SelectTrigger>
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
            <div className="p-6 border-t border-slate-100 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPost(null);
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving || !form.title || !form.content}>
                {saving ? 'Saving…' : editingPost ? 'Save changes' : 'Create post'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-slate-900 text-lg">Delete Post?</h3>
            <p className="text-sm text-slate-500 mt-1">
              &ldquo;{deleteTarget.title}&rdquo; will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
