import { Event } from "../models/Event.js";
import { EventRegistration } from "../models/EventRegistration.js";
import { ClubProfile } from "../models/ClubProfile.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageBuffer } from "../services/cloudinaryService.js";

const ensureOwner = (event, user) => {
  if (user.role !== "super_admin" && String(event.clubAdmin) !== String(user._id)) throw new ApiError(403, "Only the owning club can modify this event");
};

export const listEvents = asyncHandler(async (req, res) => {
  const { search, club, category, interest, from, to, includeArchived } = req.query;
  const query = includeArchived === "true" && req.user?.role === "super_admin" ? {} : { status: "active", deadline: { $gt: new Date() } };
  if (search) query.$text = { $search: search };
  if (club) query.clubName = new RegExp(club, "i");
  if (category) query.category = new RegExp(category, "i");
  if (interest) query.tags = interest.toLowerCase();
  if (from || to) query.eventDate = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
  const events = await Event.find(query).sort({ eventDate: 1 });
  res.json(events);
});

export const listMyClubEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ clubAdmin: req.user._id }).sort({ createdAt: -1 });
  res.json(events);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) throw new ApiError(404, "Event not found");

  if (
    event.status !== "active" &&
    req.user?.role !== "super_admin" &&
    String(event.clubAdmin) !== String(req.user?._id)
  ) {
    throw new ApiError(404, "Event not found");
  }

  let isRegistered = false;

  if (req.user?.role === "student") {

  const registration = await EventRegistration.findOne({
    event: event._id,
    student: req.user._id,
    status: "registered"
  });

  isRegistered = !!registration;
}

  res.json({
    ...event.toObject(),
    isRegistered
  });
});

export const createEvent = asyncHandler(async (req, res) => {
  let poster = { url: req.body.posterUrl || "", publicId: "" };
  if (req.file) poster = await uploadImageBuffer(req.file.buffer);
  const club = await ClubProfile.findOne({ user: req.user._id });
  if (!club) {
  throw new ApiError(404, "Club profile not found");
}

if (!club.isApproved) {
  throw new ApiError(
    403,
    "Your club must be approved by an admin before creating events"
  );
}
  const deadline = new Date(req.body.deadline);
const eventDate = new Date(req.body.eventDate);

if (eventDate <= new Date()) {
  throw new ApiError(400, "Event date must be in the future");
}

if (deadline <= new Date()) {
  throw new ApiError(400, "Registration deadline must be in the future");
}

if (deadline >= eventDate) {
  throw new ApiError(
    400,
    "Registration deadline must be before the event date"
  );
}
  const event = await Event.create({
    ...req.body,
    tags: Array.isArray(req.body.tags)
  ? req.body.tags
  : JSON.parse(req.body.tags || "[]"),
    poster,
    clubAdmin: req.user._id,
    clubName: club?.clubName
  });
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  ensureOwner(event, req.user);
  if (req.file) event.poster = await uploadImageBuffer(req.file.buffer);
      const {
      clubName,
      clubAdmin,
      ...allowedFields
    } = req.body;

  Object.assign(event, allowedFields, {
    tags: req.body.tags
  ? (
      Array.isArray(req.body.tags)
        ? req.body.tags
        : JSON.parse(req.body.tags)
    )
  : event.tags
  });
    if (
    req.body.capacity &&
    Number(req.body.capacity) < event.registrationCount
  ) {
    throw new ApiError(
      400,
      `Capacity cannot be less than current registrations (${event.registrationCount})`
    );
  }
  const deadline = new Date(event.deadline);
  const eventDate = new Date(event.eventDate);


  if (eventDate <= new Date()) {
    throw new ApiError(400, "Event date must be in the future");
  }

  if (deadline <= new Date()) {
    throw new ApiError(400, "Registration deadline must be in the future");
  }

  if (deadline >= eventDate) {
    throw new ApiError(
      400,
      "Registration deadline must be before the event date"
    );
  }

  if (
    event.status === "archived" &&
    deadline > new Date()
  ) {
    event.status = "active";
    event.archiveReason = "";
  }

  await event.save();
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  ensureOwner(event, req.user);
  event.status = "archived";
  event.archiveReason = "Deleted by owner";
  await event.save();
  res.json({ message: "Event archived" });
});

export const clubStats = asyncHandler(async (req, res) => {
  const filter = req.user.role === "club_admin" ? { clubAdmin: req.user._id } : {};
  const [events, active, registrations] = await Promise.all([
    Event.countDocuments(filter),
    Event.countDocuments({ ...filter, status: "active", deadline: { $gt: new Date() } }),
    EventRegistration.countDocuments({ status: "registered", event: { $in: await Event.find(filter).distinct("_id") } })
  ]);
  res.json({ events, active, registrations });
});

export const eventRegistrants = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event not found");
  ensureOwner(event, req.user);
  const registrations = await EventRegistration.find({ event: event._id, status: "registered" }).populate("student", "name email");
  res.json(registrations);
});
