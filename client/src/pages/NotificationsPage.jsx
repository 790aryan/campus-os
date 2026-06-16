import { CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import { formatDate } from "../utils/format.js";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/notifications").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);
  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    load();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Notifications</h1>
      {items.length ? <div className="card divide-y divide-line">{items.map((item) => (
        <div key={item._id} className={`flex items-start justify-between gap-4 p-4 ${item.read ? "" : "bg-teal-50"}`}>
          <div><p className="font-bold">{item.title}</p><p className="text-sm text-neutral-600">{item.message}</p><p className="mt-1 text-xs text-neutral-400">{formatDate(item.createdAt)}</p></div>
          {!item.read && <button className="btn-secondary px-3" onClick={() => markRead(item._id)}><CheckCheck size={16} /></button>}
        </div>
      ))}</div> : <EmptyState title="No notifications" />}
    </div>
  );
}
