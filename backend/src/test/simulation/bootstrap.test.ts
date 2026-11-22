import "../mockEmail";
import { describe, it, expect } from "vitest";
import { prisma } from "../setup";
import { bootstrapSimulation } from "./bootstrap";
import { defaultSimulationBootstrapConfig } from "./config";

describe("simulation bootstrap", () => {
  it("creates a realistic initial state via APIs", async () => {
    const seed = 12345;
    const state = await bootstrapSimulation({
      ...defaultSimulationBootstrapConfig,
      seed,
      scale: {
        ...defaultSimulationBootstrapConfig.scale,
        instructors: 2,
        customers: 3,
      },
    });

    expect(state.seed).toBe(seed);
    expect(state.admin.id).toBeGreaterThan(0);
    expect(state.instructors).toHaveLength(2);
    expect(state.customers).toHaveLength(3);

    expect(await prisma.subscription.count()).toBe(3);
    expect(await prisma.recurringClass.count()).toBeGreaterThanOrEqual(3);
    expect(
      await prisma.class.count({ where: { status: "booked" } }),
    ).toBeGreaterThan(0);
  }, 20_000);
});
