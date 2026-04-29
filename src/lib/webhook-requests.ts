import prisma from '@/prisma';
import { Prisma } from '../../generated/prisma/client';

type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface SaveWebhookRequestParams {
  provider: string;
  path: string;
  method: string;
  authenticated: boolean;
  externalRequestId?: string | null;
  notificationId?: string | null;
  eventType?: string | null;
  action?: string | null;
  resourceId?: string | null;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  payload: JsonValue;
  rawBody?: string | null;
}

export async function saveWebhookRequest({
  provider,
  path,
  method,
  authenticated,
  externalRequestId,
  notificationId,
  eventType,
  action,
  resourceId,
  headers,
  query,
  payload,
  rawBody,
}: SaveWebhookRequestParams) {
  return prisma.webhookRequest.create({
    data: {
      provider,
      path,
      method,
      authenticated,
      externalRequestId: externalRequestId ?? undefined,
      notificationId: notificationId ?? undefined,
      eventType: eventType ?? undefined,
      action: action ?? undefined,
      resourceId: resourceId ?? undefined,
      headers,
      query,
      payload: payload === null ? Prisma.JsonNull : payload,
      rawBody: rawBody ?? undefined,
    },
  });
}
