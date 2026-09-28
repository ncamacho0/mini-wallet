import { db } from "@/server/db";
import type { NewContactRequest } from "@/features/contacts";
import type { Contact } from "@/shared/types";

export function listContacts(): Contact[] {
  return [...db.contacts].sort(
    (a, b) => Number(b.isFavorite) - Number(a.isFavorite) || a.name.localeCompare(b.name),
  );
}

export function findContactById(id: string): Contact | undefined {
  return db.contacts.find((contact) => contact.id === id);
}

export function createContact(input: NewContactRequest): Contact {
  const contact: Contact = {
    id: `cnt_${crypto.randomUUID().split("-")[0]}`,
    name: input.name,
    phone: input.phone || undefined,
    email: input.email || undefined,
    isFavorite: false,
  };

  db.contacts.push(contact);
  return contact;
}
