import { CalendarCheck, Edit, PlusCircle, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatDate } from "../utils/format.js";

export default function ClubDashboard() {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const load = () => {
    api.get("/events/club/mine").then(({ data }) => setEvents(data));
    api.get("/events/club/stats").then(({ data }) => setStats(data));
  };
  useEffect(load, []);
  const archive = async (id) => {
    await api.delete(`/events/${id}`);
    toast.success("Event archived");
    load();
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total events" value={stats.events} icon={CalendarCheck} />
        <StatCard label="Active events" value={stats.active} icon={PlusCircle} />
        <StatCard label="Registrations" value={stats.registrations} icon={Users} />
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">Club events</h2>
        <Link className="btn-primary" to="/events/new"><PlusCircle size={18} /> Create event</Link>
      </div>
      {events.length ? (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-neutral-500"><tr><th className="p-3">Event</th><th>Date</th><th>Status</th><th>Registrations</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{events.map((event) => (
              <tr key={event._id} className="border-t border-line">
                <td className="p-3 font-bold">{event.title}<p className="text-xs font-normal text-neutral-500">{event.clubName}</p></td>
                <td>{formatDate(event.eventDate)}</td>
                <td className="capitalize">{event.status}</td>
                <td>{event.registrationCount}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link className="btn-secondary px-3" to={`/events/${event._id}/edit`}><Edit size={16} /></Link>
                    <Link className="btn-secondary px-3" to={`/events/${event._id}/registrants`}><Users size={16} /></Link>
                    <button className="btn-secondary px-3" onClick={() => archive(event._id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <EmptyState title="No events yet" />}
    </div>
  );
}
