import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../server";
import { createAdmin, generateAuthCookie } from "./testUtils";
import { prisma } from "./setup";

describe("PATCH /admins/:id", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const updatedName = "Updated Admin Name";

    await request(server)
      .patch(`/admins/${admin.id}`)
      .set("Cookie", authCookie)
      .send({ name: updatedName, email: admin.email })
      .expect(200);

    const updatedAdmin = await prisma.admins.findUnique({
      where: { id: admin.id },
    });
    expect(updatedAdmin?.name).toBe(updatedName);
  });

  it("fail for unauthenticated request", async () => {
    const admin = await createAdmin();

    await request(server)
      .patch(`/admins/${admin.id}`)
      .send({ name: "Updated Name", email: admin.email })
      .expect(401);
  });
});
