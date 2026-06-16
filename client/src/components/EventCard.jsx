import { CalendarDays, MapPin, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";

export default function EventCard({ event, reason }) {
  return (
    <Link to={`/events/${event._id}`} className="card block overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-36 bg-neutral-200">
        {event.poster?.url ? <img src={event.poster.url} alt={event.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-teal-700 to-coral text-2xl font-black text-white">{event.clubName?.slice(0, 2).toUpperCase()}</div>}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand">{event.clubName}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-black">{event.title}</h3>
        </div>
        <p className="line-clamp-2 text-sm text-neutral-600">{event.description}</p>
        <div className="space-y-2 text-sm text-neutral-600">
          <p className="flex items-center gap-2"><CalendarDays size={16} /> {formatDate(event.eventDate)}</p>
          <p className="flex items-center gap-2"><MapPin size={16} /> {event.venue}</p>
          <p className="flex items-center gap-2"><Tag size={16} /> {event.category}</p>
        </div>
        {reason && <p className="rounded-md bg-teal-50 p-2 text-xs font-medium text-teal-900">{reason}</p>}
      </div>
    </Link>
  );
}
