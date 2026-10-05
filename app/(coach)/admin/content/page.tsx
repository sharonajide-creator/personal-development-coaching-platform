"use client";

// Phase 4 — Content CRUD: paths (create/edit/delete) + lessons (add/edit/delete/move).
import { useEffect, useState } from "react";

type Path = { id: string; slug: string; title: string; category: string; description: string | null; recommendedFor: string | null; order: number; _count?: { lessons: number } };
type Lesson = { id: string; pathId: string; type: string; title: string; body: string | null; mediaUrl: string | null; resourceUrls: string[]; order: number };

const CATS = ["SELF_DISCOVERY", "PURPOSE_VISION", "CONFIDENCE", "COMMUNICATION", "CAREER_BUSINESS", "LEADERSHIP", "PRODUCTIVITY"];
const TYPES = ["GUIDE", "ARTICLE", "VIDEO", "AUDIO", "EXERCISE", "WORKSHEET", "REFLECTION"];

export default function ContentPage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState(CATS[0]);
  const emptyLesson = { type: "ARTICLE", title: "", body: "", mediaUrl: "", order: 0 };
  const [lessonForm, setLessonForm] = useState<Record<string, typeof emptyLesson>>({});
  const [editing, setEditing] = useState<Record<string, Lesson>>({});

  async function loadPaths() {
    const r = await fetch("/api/admin/paths").then((x) => x.json());
    setPaths(r.paths ?? []);
  }

  async function loadLessons(pathId: string) {
    const r = await fetch(`/api/paths/${paths.find((p) => p.id === pathId)?.slug}`).then((x) => x.json());
    setLessons((m) => ({ ...m, [pathId]: r.path?.lessons ?? [] }));
  }

  useEffect(() => { void loadPaths(); }, []);

  async function toggle(path: Path) {
    if (openPath === path.id) {
      setOpenPath(null);
    } else {
      setOpenPath(path.id);
      await loadLessons(path.id);
    }
  }

  async function createPath(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/paths", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: newSlug.trim(), title: newTitle.trim(), category: newCat }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? "Could not create path.");
    else {
      setNewSlug(""); setNewTitle("");
      void loadPaths();
    }
  }

  async function deletePath(id: string) {
    if (!confirm("Delete this path and ALL its lessons?")) return;
    const res = await fetch(`/api/admin/paths/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPaths((ps) => ps.filter((p) => p.id !== id));
      if (openPath === id) setOpenPath(null);
    }
  }

  async function createLesson(pathId: string) {
    const f = lessonForm[pathId] ?? emptyLesson;
    if (!f.title.trim()) {
      setError("Lesson title is required.");
      return;
    }
    const res = await fetch("/api/admin/lessons", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathId, type: f.type, title: f.title.trim(), body: f.body, mediaUrl: f.mediaUrl, order: Number(f.order) || 0 }),
    });
    if (res.ok) {
      setLessonForm((m) => ({ ...m, [pathId]: emptyLesson }));
      void loadLessons(pathId);
      void loadPaths();
    } else {
      setError("Could not create lesson.");
    }
  }

  async function saveLessonEdit(l: Lesson) {
    const res = await fetch(`/api/admin/lessons/${l.id}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: l.type, title: l.title, body: l.body ?? "", mediaUrl: l.mediaUrl ?? "", order: l.order }),
    });
    if (res.ok) {
      setEditing((m) => {
        const c = { ...m };
        delete c[l.id];
        return c;
      });
      void loadLessons(l.pathId);
    }
  }

  async function deleteLesson(l: Lesson) {
    if (!confirm(`Delete "${l.title}"?`)) return;
    const res = await fetch(`/api/admin/lessons/${l.id}`, { method: "DELETE" });
    if (res.ok) {
      void loadLessons(l.pathId);
      void loadPaths();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <a href="/admin" className="text-sm text-brand underline">← Admin</a>
        <h1 className="mt-1 font-display text-2xl font-semibold">Content</h1>
        <p className="text-sm text-slate-500">Publish paths and lessons — live on the site immediately.</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form onSubmit={createPath} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row">
        <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug e.g. building-confidence" className="rounded-lg border px-3 py-2 text-sm" />
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Path title" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Add path</button>
      </form>

      {paths.map((p) => (
        <div key={p.id} className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => void toggle(p)} className="text-left">
              <span className="font-semibold">{p.title}</span>
              <span className="block text-xs text-slate-500">{p.slug} · {p.category} · {p._count?.lessons ?? "?"} lessons</span>
            </button>
            <button onClick={() => void deletePath(p.id)} className="text-xs text-red-600 underline">Delete</button>
          </div>

          {openPath === p.id && (
            <div className="mt-3 space-y-2 border-t pt-3">
              {(lessons[p.id] ?? []).map((l) => {
                const ed = editing[l.id];
                return (
                  <div key={l.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    {ed ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <select value={ed.type} onChange={(e) => setEditing((m) => ({ ...m, [l.id]: { ...ed, type: e.target.value } }))} className="rounded-lg border px-2 py-1 text-sm">
                            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <input value={ed.title} onChange={(e) => setEditing((m) => ({ ...m, [l.id]: { ...ed, title: e.target.value } }))} className="flex-1 rounded-lg border px-2 py-1 text-sm" />
                          <input type="number" value={ed.order} onChange={(e) => setEditing((m) => ({ ...m, [l.id]: { ...ed, order: Number(e.target.value) } }))} className="w-16 rounded-lg border px-2 py-1 text-sm" />
                        </div>
                        <textarea value={ed.body ?? ""} onChange={(e) => setEditing((m) => ({ ...m, [l.id]: { ...ed, body: e.target.value } }))} rows={4} className="w-full rounded-lg border px-2 py-1 text-sm" />
                        <input value={ed.mediaUrl ?? ""} onChange={(e) => setEditing((m) => ({ ...m, [l.id]: { ...ed, mediaUrl: e.target.value } }))} placeholder="Media URL (optional)" className="w-full rounded-lg border px-2 py-1 text-sm" />
                        <div className="flex gap-2">
                          <button onClick={() => void saveLessonEdit(ed)} className="rounded-lg bg-brand px-3 py-1 text-sm font-semibold text-white">Save</button>
                          <button onClick={() => setEditing((m) => { const c = { ...m }; delete c[l.id]; return c; })} className="rounded-lg border px-3 py-1 text-sm">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span>#{l.order} [{l.type}] {l.title}</span>
                        <span className="flex gap-2 text-xs">
                          <button onClick={() => setEditing((m) => ({ ...m, [l.id]: { ...l } }))} className="underline">Edit</button>
                          <button onClick={() => void deleteLesson(l)} className="text-red-600 underline">Delete</button>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row">
                <select value={(lessonForm[p.id] ?? emptyLesson).type} onChange={(e) => setLessonForm((m) => ({ ...m, [p.id]: { ...(m[p.id] ?? emptyLesson), type: e.target.value } }))} className="rounded-lg border px-2 py-1.5 text-sm">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={(lessonForm[p.id] ?? emptyLesson).title} onChange={(e) => setLessonForm((m) => ({ ...m, [p.id]: { ...(m[p.id] ?? emptyLesson), title: e.target.value } }))} placeholder="New lesson title" className="flex-1 rounded-lg border px-2 py-1.5 text-sm" />
                <button onClick={() => void createLesson(p.id)} className="rounded-lg border px-3 py-1.5 text-sm">Add lesson</button>
              </div>
              <p className="text-xs text-slate-400">Tip: open the lesson in Edit to write its body and media link.</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
