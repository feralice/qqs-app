export type OperationalEventType =
  | "visit_started"
  | "visit_finished"
  | "visit_created"
  | "visit_changed"
  | "visit_overdue"
  | "visit_problem";

export type OperationalEvent = {
  eventId: string;
  type: OperationalEventType;
  message: string;
};

export type NotificationInput = { eventId: string; message: string };

export type NotificationDependencies = {
  push: { sendPush(input: NotificationInput): Promise<void> };
  whatsapp: { sendCriticalAlert(input: NotificationInput): Promise<void> };
};

export function createNotificationService(dependencies: NotificationDependencies) {
  const published = new Set<string>();
  const criticalTypes = new Set<OperationalEventType>(["visit_overdue", "visit_problem"]);

  return {
    async publish(event: OperationalEvent): Promise<void> {
      if (published.has(event.eventId)) return;
      await dependencies.push.sendPush({ eventId: event.eventId, message: event.message });
      if (criticalTypes.has(event.type)) {
        await dependencies.whatsapp.sendCriticalAlert({ eventId: event.eventId, message: event.message });
      }
      published.add(event.eventId);
    },
  };
}
