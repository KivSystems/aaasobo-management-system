import { describe, it } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { createAdmin, generateAuthCookie } from "../testUtils";

describe("GET /admins/subscription-list", () => {
  it("succeed with subscription list", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    await request(server)
      .get("/admins/subscription-list")
      .set("Cookie", authCookie)
      .expect(200);
  });
});
