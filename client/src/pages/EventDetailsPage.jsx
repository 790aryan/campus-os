import { CalendarDays, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { api } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format.js";

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [registering, setRegistering] = useState(false);
const [unregistering, setUnregistering] = useState(false);
useEffect(() => {
  const fetchEvent = async () => {
    try {
      const { data } = await api.get(`/events/${id}`);
      setEvent(data);
    } catch (err) {
      setError(err.response?.data?.message || "Event not found");
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [id]);
 const register = async () => {
  if (registering || event.isRegistered) return;

  try {
    setRegistering(true);

    await api.post(`/registrations/${id}`);

    toast.success("Registered");

    const { data } = await api.get(`/events/${id}`);
    setEvent(data);

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Registration failed"
    );
  } finally {
    setRegistering(false);
  }
};
  const unregister = async () => {
  if (unregistering || !event.isRegistered) return;

  try {
    setUnregistering(true);

    await api.delete(`/registrations/${id}`);

    toast.success("Unregistered");

    const { data } = await api.get(`/events/${id}`);
    setEvent(data);

  } catch (error) {
    toast.error(error.response?.data?.message || "Failed");
  } finally {
    setUnregistering(false);
  }
};
 if (loading) {
  return <p className="text-sm text-neutral-500">Loading event...</p>;
}

if (error) {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold">Event not found</h2>
      <p className="text-neutral-600 mt-2">
        This event is unavailable or has been moderated.
      </p>
    </div>
  );
}
  return (
    <div className="card overflow-hidden">
      <div className="h-64 bg-neutral-200">{event.poster?.url && <img src={event.poster.url} alt={event.title} className="h-full w-full object-cover" />}</div>
      <div className="space-y-5 p-6">
        <div>
          <p className="font-bold uppercase tracking-wide text-brand">{event.clubName}</p>
          <h1 className="mt-2 text-3xl font-black">{event.title}</h1>
        </div>
        <p className="text-neutral-700">{event.description}</p>
        <div className="grid gap-3 md:grid-cols-3">
          <p className="flex items-center gap-2"><CalendarDays size={18} /> {formatDate(event.eventDate)}</p>
          <p className="flex items-center gap-2"><MapPin size={18} /> {event.venue}</p>
          <p className="flex items-center gap-2"><Users size={18} /> {event.registrationCount} registered</p>
        </div>
        <p className="text-sm text-neutral-600">Deadline: {formatDate(event.deadline)}</p>
        <div className="flex flex-wrap gap-2">{event.tags.map((tag) => <span key={tag} className="rounded-md bg-mist px-2 py-1 text-xs font-bold">{tag}</span>)}</div>
        {user?.role === "student" && (
  <div className="flex gap-3">
    {event.isRegistered ? (
      <button
        className="btn-secondary"
        onClick={unregister}
        disabled={unregistering}
      >
        {unregistering ? "Unregistering..." : "Unregister"}
      </button>
    ) : (
      <button
        className="btn-primary"
        onClick={register}
        disabled={registering}
      >
        {registering ? "Registering..." : "Register"}
      </button>
    )}
  </div>
)}
      </div>
    </div>
  );
}
