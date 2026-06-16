import { Save } from "lucide-react";
import { useState } from "react";
import { toInputDateTime } from "../utils/format.js";

export default function EventForm({ initialEvent, onSubmit, submitting }) {
  const [form, setForm] = useState({
    title: initialEvent?.title || "",
    description: initialEvent?.description || "",
    posterUrl: initialEvent?.poster?.url || "",
    deadline: toInputDateTime(initialEvent?.deadline),
    eventDate: toInputDateTime(initialEvent?.eventDate),
    venue: initialEvent?.venue || "",
    eligibility: initialEvent?.eligibility || "Open to all students",
    tags: initialEvent?.tags?.join(", ") || "",
    category: initialEvent?.category || "",
    clubName: initialEvent?.clubName || "",
    capacity: initialEvent?.capacity || 0
  });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean), capacity: Number(form.capacity) });
  };
  return (
    <form onSubmit={submit} className="card grid gap-4 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" required placeholder="Event title" value={form.title} onChange={(e) => update("title", e.target.value)} />
        <input className="input" required placeholder="Club name" value={form.clubName} onChange={(e) => update("clubName", e.target.value)} />
      </div>
      <textarea className="input min-h-32" required placeholder="Description" value={form.description} onChange={(e) => update("description", e.target.value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" type="datetime-local" required value={form.deadline} onChange={(e) => update("deadline", e.target.value)} />
        <input className="input" type="datetime-local" required value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
        <input className="input" required placeholder="Venue" value={form.venue} onChange={(e) => update("venue", e.target.value)} />
        <input className="input" required placeholder="Category" value={form.category} onChange={(e) => update("category", e.target.value)} />
        <input className="input" placeholder="Eligibility" value={form.eligibility} onChange={(e) => update("eligibility", e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Capacity, 0 for unlimited" value={form.capacity} onChange={(e) => update("capacity", e.target.value)} />
      </div>
      <input className="input" placeholder="Poster image URL" value={form.posterUrl} onChange={(e) => update("posterUrl", e.target.value)} />
      <input className="input" placeholder="Tags, comma separated" value={form.tags} onChange={(e) => update("tags", e.target.value)} />
      <button className="btn-primary w-fit" disabled={submitting}><Save size={18} /> Save event</button>
    </form>
  );
}
