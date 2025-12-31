type SimulationBootstrapScale = {
  plans: number;
  instructors: number;
  customers: number;
  slotsPerInstructor: number;
  recurringClassesPerCustomer: number;
};

export type SimulationBootstrapConfig = {
  seed: number;
  timezone: string;
  scheduleEffectiveFrom: string; // YYYY-MM-DD
  subscriptionStartAtIso: string; // ISO string
  recurringStartDate: string; // YYYY-MM-DD
  scale: SimulationBootstrapScale;
};

export const defaultSimulationBootstrapConfig: SimulationBootstrapConfig = {
  seed: 123456,
  timezone: "Asia/Tokyo",
  scheduleEffectiveFrom: "2025-01-01",
  subscriptionStartAtIso: "2025-01-01T00:00:00.000Z",
  recurringStartDate: "2025-01-15",
  scale: {
    plans: 1,
    instructors: 5,
    customers: 20,
    slotsPerInstructor: 6,
    recurringClassesPerCustomer: 1,
  },
};
