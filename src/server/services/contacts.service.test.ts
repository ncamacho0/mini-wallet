import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/server/db";
import { createContact, findContactById, listContacts } from "./contacts.service";

beforeEach(() => {
  resetDb();
});

describe("listContacts", () => {
  it("sorts favorites first and then by name", () => {
    const contacts = listContacts();

    expect(contacts.map((contact) => contact.isFavorite)).toEqual([true, true, false, false]);
    expect(contacts.slice(0, 2).map((contact) => contact.name)).toEqual([
      "Luis Gómez",
      "Marta Ruiz",
    ]);
    expect(contacts.slice(2).map((contact) => contact.name)).toEqual([
      "Carlos Díaz",
      "Sofía Herrera",
    ]);
  });
});

describe("createContact", () => {
  it("persists the contact as non-favorite with a generated id", () => {
    const contact = createContact({ name: "Ana Pérez", phone: "+525598765432" });

    expect(contact.id).toMatch(/^cnt_/);
    expect(contact.isFavorite).toBe(false);
    expect(findContactById(contact.id)).toEqual(contact);
    expect(listContacts()).toHaveLength(5);
  });

  it("normalizes empty optional fields to undefined", () => {
    const contact = createContact({ name: "Ana Pérez" });

    expect(contact.phone).toBeUndefined();
    expect(contact.email).toBeUndefined();
  });
});
