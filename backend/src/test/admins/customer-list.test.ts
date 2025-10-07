import { describe, it, expect } from "vitest";
import request from "supertest";
import { server } from "../../server";
import { createCustomer } from "../testUtils";

describe("GET /admins/customer-list", () => {
  it("succeed with multiple customers", async () => {
    const customer1 = await createCustomer();
    const customer2 = await createCustomer();

    const response = await request(server)
      .get("/admins/customer-list")
      .expect(200);

    expect(response.body.data).toEqual([
      {
        No: 1,
        ID: customer1.id,
        Customer: customer1.name,
        Email: customer1.email,
        Prefecture: customer1.prefecture,
      },
      {
        No: 2,
        ID: customer2.id,
        Customer: customer2.name,
        Email: customer2.email,
        Prefecture: customer2.prefecture,
      },
    ]);
  });
});
