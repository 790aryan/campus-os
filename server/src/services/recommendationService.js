import OpenAI from "openai";
import { Event } from "../models/Event.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { RecommendationCache } from "../models/RecommendationCache.js";

const openai = () => (process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null);

const scoreEvent = (event, interests) => {
  const haystack = `${event.title} ${event.description} ${event.category} ${event.tags.join(" ")}`.toLowerCase();
  return interests.reduce((score, interest) => score + (haystack.includes(interest.toLowerCase()) ? 3 : 0), 0);
};

const fallbackRecommendations = (events, interests) =>
  events
    .map((event) => ({ event, score: scoreEvent(event, interests) + Math.max(0, 5 - Math.ceil((event.eventDate - Date.now()) / 86400000)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ event, score }) => ({ event, reason: score > 0 ? "Matches your interests and upcoming activity" : "Popular upcoming event" }));

export const getRecommendationsForStudent = async (studentId) => {
  const cached = await RecommendationCache.findOne({ student: studentId, expiresAt: { $gt: new Date() } }).populate("eventIds");
  if (cached?.eventIds?.length) {
  const activeEvents = cached.eventIds.filter(
    (event) =>
      event &&
      event.status === "active" &&
      new Date(event.deadline) > new Date()
  );

  return activeEvents.map((event) => ({
    event,
    reason:
      cached.reasonMap?.get(String(event._id)) ||
      "Recommended for you"
  }));
}

  const profile = await StudentProfile.findOne({ user: studentId });
  const interests = profile?.interests || [];
  const events = await Event.find({ status: "active", deadline: { $gt: new Date() } }).sort({ eventDate: 1 }).limit(50);
  let recommendations = fallbackRecommendations(events, interests);

  const client = openai();
  if (client && events.length && interests.length) {
    try {
      const prompt = {
        interests,
        events: events.map((event) => ({
          id: String(event._id),
          title: event.title,
          category: event.category,
          tags: event.tags,
          description: event.description.slice(0, 500)
        }))
      };
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Return JSON with key recommendations: array of {id, reason}. Pick at most 8 college events that best match the student's interests." },
          { role: "user", content: JSON.stringify(prompt) }
        ]
      });
      const parsed = JSON.parse(completion.choices[0].message.content);
      const byId = new Map(events.map((event) => [String(event._id), event]));
      const aiItems = (parsed.recommendations || [])
        .map((item) => ({ event: byId.get(item.id), reason: item.reason || "AI matched this event to your interests" }))
        .filter((item) => item.event);
      if (aiItems.length) recommendations = aiItems;
    } catch {
      recommendations = fallbackRecommendations(events, interests);
    }
  }

  await RecommendationCache.findOneAndUpdate(
    { student: studentId },
    {
      student: studentId,
      eventIds: recommendations.map((item) => item.event._id),
      reasonMap: Object.fromEntries(recommendations.map((item) => [String(item.event._id), item.reason])),
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
    },
    { upsert: true, new: true }
  );
  return recommendations;
};
