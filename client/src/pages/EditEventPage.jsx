import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/api.js";
import EventForm from "../components/EventForm.jsx";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  useEffect(() => { api.get(`/events/${id}`).then(({ data }) => setEvent(data)); }, [id]);
  const submit = async (payload) => {
    await api.put(`/events/${id}`, payload);
    toast.success("Event updated");
    navigate("/club");
  };
  return <div className="space-y-4"><h1 className="text-2xl font-black">Edit event</h1>{event && <EventForm initialEvent={event} onSubmit={submit} />}</div>;
}
