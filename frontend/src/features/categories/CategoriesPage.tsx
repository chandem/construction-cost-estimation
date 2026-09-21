import { useEffect, useState } from "react";
import { Plus, Tags } from "lucide-react";
import {
  createCategory,
  listCategories,
  type Category,
} from "../../api/categories";
import { useApp } from "../../context/AppContext";

export default function CategoriesPage() {
  const { pushToast } = useApp();
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createCategory({
        name: name.trim(),
        description: description.trim() || null,
      });
      setRows((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      setDescription("");
      setShowForm(false);
      pushToast("success", "Category created");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack">
      <div className="pageBar">
        <div>
          <h2>Cost categories</h2>
          <p className="muted">
            Group unit rates into Material, Labor, Equipment and other categories.
          </p>
        </div>
        <button type="button" className="primary" onClick={() => setShowForm((v) => !v)}>
          <Plus size={16} />
          {showForm ? "Cancel" : "Add category"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <section className="panel form">
          <h3>New category</h3>
          <div className="formGrid">
            <label>
              Name *
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Material" />
            </label>
            <label>
              Description
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>
          <div className="formActions">
            <button type="button" className="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="primary"
              disabled={saving || !name.trim()}
              onClick={() => void handleCreate()}
            >
              {saving ? "Saving…" : "Create"}
            </button>
          </div>
        </section>
      )}

      <section className="panel tablePanel">
        <div className="tableHead">
          <h3>All categories</h3>
          <button type="button" className="secondary" onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="emptySmall">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="emptySmall">
            <Tags size={28} />
            <strong>No categories yet</strong>
            <span>Create Material, Labor, Equipment to organise rates.</span>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                    </td>
                    <td>{c.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
