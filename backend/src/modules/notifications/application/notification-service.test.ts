import { test } from "node:test";
import assert from "node:assert/strict";

import { createNotificationService } from "./notification-service.js";

test("notification service sends push for operational events and WhatsApp for critical events", async () => {
  const pushes: string[] = [];
  const whatsapps: string[] = [];
  const service = createNotificationService({
    push: { sendPush: async (input) => { pushes.push(input.eventId); } },
    whatsapp: { sendCriticalAlert: async (input) => { whatsapps.push(input.eventId); } },
  });

  await service.publish({ eventId: "event-start", type: "visit_started", message: "Visita iniciada" });
  await service.publish({ eventId: "event-overdue", type: "visit_overdue", message: "Visita atrasada" });

  assert.deepEqual(pushes, ["event-start", "event-overdue"]);
  assert.deepEqual(whatsapps, ["event-overdue"]);
});

test("notification service ignores duplicate event ids", async () => {
  let calls = 0;
  const service = createNotificationService({
    push: { sendPush: async () => { calls += 1; } },
    whatsapp: { sendCriticalAlert: async () => { calls += 1; } },
  });

  const event = { eventId: "event-1", type: "visit_problem" as const, message: "Problema" };
  await service.publish(event);
  await service.publish(event);

  assert.equal(calls, 2);
});
