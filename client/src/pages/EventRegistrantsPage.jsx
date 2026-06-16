import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api.js";
import EmptyState from "../components/EmptyState.jsx";

export default function EventRegistrantsPage() {
  const { id } = useParams();
  const [registrants, setRegistrants] = useState([]);
  useEffect(() => { api.get(`/events/${id}/registrants`).then(({ data }) => setRegistrants(data)); }, [id]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Registered students</h1>
      {registrants.length ? <div className="card divide-y divide-line">{registrants.map((item) => <div className="p-4" key={item._id}><p className="font-bold">{item.student.name}</p><p className="text-sm text-neutral-500">{item.student.email}</p></div>)}</div> : <EmptyState title="No registrations yet" />}
    </div>
  );
}
