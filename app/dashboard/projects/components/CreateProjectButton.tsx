"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectButton({ isFirst = false }: { isFirst?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      if (res.ok) {
        setIsOpen(false);
        setName("");
        setDescription("");
        router.refresh();
      } else {
        console.error("Failed to create project");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        + {isFirst ? "Create your first project" : "New Project"}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, backgroundColor: "#FFF", borderRadius: 12, padding: 24, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="label">Project Name</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="e.g. Acme Corp Migration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="label">Description (Optional)</label>
                <textarea 
                  className="input" 
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ minHeight: 80, resize: "vertical" }}
                />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || !name.trim()}
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
