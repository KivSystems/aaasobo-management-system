import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import {
  createAdmin,
  createCustomer,
  createChild,
  generateAuthCookie,
} from "../testUtils";

describe("GET /admins/child-list", () => {
  it("succeed with multiple children", async () => {
    const admin = await createAdmin();
    const authCookie = await generateAuthCookie(admin.id, "admin");
    const customer = await createCustomer();
    const child1 = await createChild(customer.id);
    const child2 = await createChild(customer.id);

    const response = await request(server)
      .get("/admins/child-list")
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.data).toEqual([
      {
        No: 1,
        ID: child1.id,
        Child: child1.name,
        "Customer ID": customer.id,
        Customer: customer.name,
        Birthdate: child1.birthdate?.toISOString().split("T")[0],
        "Personal Info": child1.personalInfo,
      },
      {
        No: 2,
        ID: child2.id,
        Child: child2.name,
        "Customer ID": customer.id,
        Customer: customer.name,
        Birthdate: child2.birthdate?.toISOString().split("T")[0],
        "Personal Info": child2.personalInfo,
      },
    ]);
  });
});
