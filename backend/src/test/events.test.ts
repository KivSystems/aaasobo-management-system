import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../server";
import { createAdmin, createEvent, generateAuthCookie } from "./testUtils";

async function createAdminAuthCookie() {
  const admin = await createAdmin();
  return await generateAuthCookie(admin.id, "admin");
}

describe("GET /events/:id", () => {
  it("succeed with authenticated admin and valid ID", async () => {
    const authCookie = await createAdminAuthCookie();
    const event = await createEvent({ name: "Test Event", color: "#FF5733" });

    const response = await request(server)
      .get(`/events/${event.id}`)
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.event).toEqual({
      id: event.id,
      name: "Test Event",
      color: "#FF5733",
    });
  });
});
