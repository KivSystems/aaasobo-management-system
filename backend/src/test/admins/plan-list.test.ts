import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import {
  createAdmin,
  createPlan,
  generateTestPlan,
  generateAuthCookie,
} from "../testUtils";
import { prisma } from "../setup";

describe("GET /admins/plan-list", () => {
  it("succeed with multiple plans", async () => {
    const plan1 = await createPlan();
    const plan2 = await createPlan();

    const response = await request(server).get("/admins/plan-list").expect(200);

    expect(response.body.data).toEqual([
      {
        No: 1,
        ID: plan1.id,
        Plan: plan1.name,
        "Weekly Class Times": plan1.weeklyClassTimes,
        Description: plan1.description,
      },
      {
        No: 2,
        ID: plan2.id,
        Plan: plan2.name,
        "Weekly Class Times": plan2.weeklyClassTimes,
        Description: plan2.description,
      },
    ]);
  });
});

describe("POST /admins/plan-list/register", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const planData = generateTestPlan();
    const authCookie = await generateAuthCookie(admin.id, "admin");

    await request(server)
      .post("/admins/plan-list/register")
      .set("Cookie", authCookie)
      .send(planData)
      .expect(201);

    const createdPlan = await prisma.plan.findFirst({
      where: { name: planData.name },
    });
    expect(createdPlan).toBeTruthy();
  });

  it("fail for unauthenticated request", async () => {
    const planData = generateTestPlan();

    await request(server)
      .post("/admins/plan-list/register")
      .send(planData)
      .expect(401);
  });
});

describe("PATCH /admins/plan-list/update/:id", () => {
  it("succeed with authenticated admin", async () => {
    const admin = await createAdmin();
    const plan = await createPlan();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const updatedDescription = "Updated plan description";

    await request(server)
      .patch(`/admins/plan-list/update/${plan.id}`)
      .set("Cookie", authCookie)
      .send({
        isDelete: false,
        name: plan.name,
        description: updatedDescription,
      })
      .expect(200);

    const updatedPlan = await prisma.plan.findUnique({
      where: { id: plan.id },
    });
    expect(updatedPlan?.description).toBe(updatedDescription);
  });

  it("fail for unauthenticated request", async () => {
    const plan = await createPlan();

    await request(server)
      .patch(`/admins/plan-list/update/${plan.id}`)
      .send({ isDelete: false, name: plan.name, description: "Updated" })
      .expect(401);
  });
});
