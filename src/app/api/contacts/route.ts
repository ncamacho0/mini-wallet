import { NextResponse } from "next/server";
import { newContactSchema } from "@/features/contacts";
import { READ_FAULTS, WRITE_FAULTS, faultApiError, resolveFault, sleep } from "@/server/faults";
import {
  apiErrorResponse,
  readJsonBody,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/server/lib/http";
import { createContact, listContacts } from "@/server/services/contacts.service";
import { getAuthenticatedUserId } from "@/server/services/session.service";
import type { ContactsResponse, CreateContactResponse } from "@/shared/types";

export async function GET(request: Request) {
  const fault = resolveFault(request, READ_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  return NextResponse.json<ContactsResponse>({ contacts: listContacts() });
}

export async function POST(request: Request) {
  const fault = resolveFault(request, WRITE_FAULTS, { random: false });
  await sleep(fault.delayMs);

  const faultError = faultApiError(fault.kind);
  if (faultError) return apiErrorResponse(faultError);

  const userId = getAuthenticatedUserId(request);
  if (!userId) return unauthorizedResponse();

  const body = await readJsonBody(request);
  const parsed = newContactSchema.safeParse(body);
  if (!parsed.success) return validationErrorResponse(parsed.error);

  const contact = createContact(parsed.data);

  return NextResponse.json<CreateContactResponse>({ contact }, { status: 201 });
}
