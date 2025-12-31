import { describe, it, expect } from "vitest";
import request from "supertest";
const { faker } = require("@faker-js/faker");
import { server } from "../../server";
import { prisma } from "../setup";
import {
  createAdmin,
  createCustomer,
  createChild,
  createInstructor,
  createClass,
  createClassAttendance,
  generateAuthCookie,
} from "../testUtils";

async function createAdminAuthCookie() {
  const admin = await createAdmin();
  return await generateAuthCookie(admin.id, "admin");
}

describe("GET /children", () => {
  it("succeed with valid customerId", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    await createChild(customer.id);
    await createChild(customer.id);

    const response = await request(server)
      .get("/children")
      .set("Cookie", authCookie)
      .query({ customerId: customer.id.toString() })
      .expect(200);

    expect(response.body.children).toHaveLength(2);
    expect(response.body.children[0].customerId).toBe(customer.id);
  });
});

describe("POST /children", () => {
  it("succeed with valid data", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const childData = {
      name: faker.person.fullName(),
      birthdate: faker.date.past({ years: 10 }).toISOString().split("T")[0],
      personalInfo: faker.lorem.sentence(),
      customerId: customer.id,
    };

    await request(server)
      .post("/children")
      .set("Cookie", authCookie)
      .send(childData)
      .expect(200);

    // Verify child was created
    const child = await prisma.children.findFirst({
      where: { customerId: customer.id, name: childData.name },
    });
    expect(child).toBeTruthy();
    expect(child?.birthdate?.toISOString().split("T")[0]).toBe(
      childData.birthdate,
    );
    expect(child?.personalInfo).toBe(childData.personalInfo);
  });
});

describe("GET /children/:id", () => {
  it("succeed with valid child ID", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const child = await createChild(customer.id);

    const response = await request(server)
      .get(`/children/${child.id}`)
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.id).toBe(child.id);
    expect(response.body.name).toBe(child.name);
    expect(response.body.customerId).toBe(customer.id);
  });
});

describe("PATCH /children/:id", () => {
  it("succeed with valid update data", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const child = await createChild(customer.id);
    const updateData = {
      name: faker.person.fullName(),
      birthdate: faker.date.past({ years: 10 }).toISOString().split("T")[0],
      personalInfo: faker.lorem.sentence(),
      customerId: customer.id,
    };

    await request(server)
      .patch(`/children/${child.id}`)
      .set("Cookie", authCookie)
      .send(updateData)
      .expect(200);

    // Verify child was updated
    const updatedChild = await prisma.children.findUnique({
      where: { id: child.id },
    });
    expect(updatedChild?.name).toBe(updateData.name);
    expect(updatedChild?.birthdate?.toISOString().split("T")[0]).toBe(
      updateData.birthdate,
    );
    expect(updatedChild?.personalInfo).toBe(updateData.personalInfo);
  });
});

describe("DELETE /children/:id", () => {
  it("succeed with valid ID and no class conflicts", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const child = await createChild(customer.id);

    await request(server)
      .delete(`/children/${child.id}`)
      .set("Cookie", authCookie)
      .expect(200);

    // Verify child was deleted
    const deletedChild = await prisma.children.findUnique({
      where: { id: child.id },
    });
    expect(deletedChild).toBeNull();
  });

  it("fail when child has completed classes", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const child = await createChild(customer.id);
    const instructor = await createInstructor();
    const classInstance = await createClass(
      customer.id,
      instructor.id,
      new Date(),
    );

    // Create completed class attendance
    await createClassAttendance(classInstance.id, child.id);

    await request(server)
      .delete(`/children/${child.id}`)
      .set("Cookie", authCookie)
      .expect(409);

    // Verify child was not deleted
    const stillExists = await prisma.children.findUnique({
      where: { id: child.id },
    });
    expect(stillExists).toBeTruthy();
  });

  it("fail when child has booked classes", async () => {
    const authCookie = await createAdminAuthCookie();
    const customer = await createCustomer();
    const child = await createChild(customer.id);
    const instructor = await createInstructor();
    const futureDate = new Date(Date.now() + 86400000); // 1 day from now
    const classInstance = await createClass(
      customer.id,
      instructor.id,
      futureDate,
    );

    // Create booked class attendance
    await createClassAttendance(classInstance.id, child.id);

    await request(server)
      .delete(`/children/${child.id}`)
      .set("Cookie", authCookie)
      .expect(409);

    // Verify child was not deleted
    const stillExists = await prisma.children.findUnique({
      where: { id: child.id },
    });
    expect(stillExists).toBeTruthy();
  });
});
