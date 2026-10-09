import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}));
vi.mock("../../../prisma/prismaClient", () => ({
  prisma: { instructor: { findFirst: mocks.findFirst, update: mocks.update } },
}));
vi.mock("@vercel/blob", () => ({ put: mocks.put, del: mocks.del }));
import { EnglishBackground } from "../../types";
import { updateInstructor } from "../../services/instructorsService";

const newUrl = "https://store123.public.blob.vercel-storage.com/new.jpg";
const oldUrl = "https://store123.public.blob.vercel-storage.com/old.jpg";
const icon = {
  originalname: "photo.jpg",
  buffer: Buffer.from("image"),
} as Express.Multer.File;
const update = () =>
  updateInstructor(
    1,
    icon,
    "Name",
    "Nick",
    null,
    new Date("1990-01-01"),
    "",
    "",
    "",
    "",
    "",
    "",
    "teacher@example.com",
    "",
    "",
    "",
    EnglishBackground.NonNative,
  );

describe("instructor icon replacement", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.findFirst.mockResolvedValue({ id: 1, icon: oldUrl });
    mocks.put.mockResolvedValue({ url: newUrl });
    mocks.update.mockResolvedValue({ id: 1, icon: newUrl });
  });

  it.each([
    "https://import.local/icons/teacher.jpg",
    "https://other.public.blob.vercel-storage.com/old.jpg",
    "invalid",
  ])("replaces %s without deleting an unowned URL", async (url) => {
    mocks.findFirst.mockResolvedValue({ id: 1, icon: url });
    mocks.del.mockRejectedValue(new Error("Invalid Blob URL"));
    await expect(update()).resolves.toEqual({ id: 1, icon: newUrl });
    expect(mocks.del).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ icon: newUrl }),
      }),
    );
  });

  it("returns the saved instructor if old icon cleanup fails", async () => {
    mocks.del.mockRejectedValue(new Error("Blob cleanup unavailable"));
    await expect(update()).resolves.toEqual({ id: 1, icon: newUrl });
  });

  it("keeps the old icon if upload fails", async () => {
    mocks.put.mockRejectedValue(new Error("Invalid Blob token"));
    await expect(update()).rejects.toThrow("Failed to update");
    expect(mocks.del).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("keeps the old icon if persistence fails", async () => {
    mocks.update.mockRejectedValue(new Error("Database unavailable"));
    await expect(update()).rejects.toThrow("Failed to update");
    expect(mocks.del).not.toHaveBeenCalled();
  });

  it("deletes the old owned icon after upload and persistence", async () => {
    await update();
    expect(mocks.del).toHaveBeenCalledWith(oldUrl);
    expect(mocks.put.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.update.mock.invocationCallOrder[0],
    );
    expect(mocks.update.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.del.mock.invocationCallOrder[0],
    );
  });
});
