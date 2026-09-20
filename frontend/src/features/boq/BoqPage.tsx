import { useState } from "react";
import { createBOQ, listBOQ, type BOQItem } from "../../api/boq";
import { type Project } from "../../api/projects";

type BoqPageProps = {
  projects: Project[];
};

export default function BoqPage({ projects }: BoqPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id ?? "");
  const [items, setItems] = useState<BOQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [itemNo, setItemNo] = useState("1");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("m3");
  const [quantity, setQuantity] = useState("1");
  const [unitRate, setUnitRate] = useState("0");

  async function loadItems(projectId: string) {
    if (!projectId) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const rows = await listBOQ(projectId);
      setItems(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load BOQ");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateItem() {
    if (!selectedProjectId) return;
    setSaving(true);
    setError("");
    try {
      const created = await createBOQ(selectedProjectId, {
        item_no: Number(itemNo),
        description,
        unit,
        quantity: Number(quantity),
        unit_rate: Number(unitRate),
      });
      setItems((current) => [...current, created]);
      setDescription("");
      setQuantity("1");
      setUnitRate("0");
      setItemNo(String(Number(itemNo) + 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create BOQ item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <h2>Bill of Quantities</h2>
      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <select
          value={selectedProjectId}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedProjectId(value);
            void loadItems(value);
          }}
        >
          {projects.length === 0 ? (
            <option value="">No projects</option>
          ) : (
            projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="boq-form">
        <input
          type="number"
          value={itemNo}
          onChange={(e) => setItemNo(e.target.value)}
          placeholder="Item no"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit" />
        <input
          type="number"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <input
          type="number"
          step="0.01"
          value={unitRate}
          onChange={(e) => setUnitRate(e.target.value)}
          placeholder="Unit rate"
        />
        <button onClick={() => void handleCreateItem()} disabled={saving || !selectedProjectId}>
          {saving ? "Saving..." : "Add item"}
        </button>
      </div>

      {loading ? (
        <div>Loading BOQ...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6}>No BOQ items yet.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.item_no}</td>
                  <td>{item.description}</td>
                  <td>{item.unit}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_rate}</td>
                  <td>{item.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
