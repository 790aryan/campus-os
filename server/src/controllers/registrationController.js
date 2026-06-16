import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createNotification } from "../services/notificationService.js";

export const registerForEvent = asyncHandler(async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user._id });
  if (profile?.verificationStatus !== "verified") throw new ApiError(403, "Verify your roll number before registering for events");
  const event = await Event.findOne({ _id: req.params.eventId, status: "active", deadline: { $gt: new Date() } });
  if (!event) throw new ApiError(404, "Event is unavailable or registration deadline has passed");
  if (event.capacity && event.registrationCount >= event.capacity) throw new ApiError(409, "Event is full");
  const registration = await EventRegistration.findOneAndUpdate(
    { event: event._id, student: req.user._id },
    { status: "registered" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  event.registrationCount = await EventRegistration.countDocuments({ event: event._id, status: "registered" });
  await event.save();
  await createNotification({ user: req.user._id, title: "Registration confirmed", message: `You registered for ${event.title}.`, type: "registration", link: `/events/${event._id}` });
  res.status(201).json(registration);
});

export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const registration = await EventRegistration.findOneAndUpdate(
    { event: req.params.eventId, student: req.user._id, status: "registered" },
    { status: "cancelled" },
    { new: true }
  );
  if (!registration) throw new ApiError(404, "Registration not found");
  const count = await EventRegistration.countDocuments({ event: req.params.eventId, status: "registered" });
  await Event.findByIdAndUpdate(req.params.eventId, { registrationCount: count });
  res.json({ message: "Registration cancelled" });
});

export const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await EventRegistration.find({ student: req.user._id, status: "registered" }).populate("event").sort({ createdAt: -1 });
  res.json(
  registrations.filter(
    (item) =>
      item.event &&
      item.event.status === "active" &&
      new Date(item.event.deadline) > new Date()
  )
);
});
