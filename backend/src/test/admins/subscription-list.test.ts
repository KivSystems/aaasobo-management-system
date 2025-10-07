import { describe, it } from "vitest";
import request from "supertest";
import { server } from "../../server";

describe("GET /admins/subscription-list", () => {
  it("succeed with subscription list", async () => {
    await request(server).get("/admins/subscription-list").expect(200);
  });
});
