import type { VisitDetails } from "@qqs/contracts";

import type { Visit } from "../../../domain/visits/visit.js";

export function toVisitDetails(visit: Visit): VisitDetails {
  const systems = visit.systems ?? [];
  return {
    id: visit.id,
    clientId: visit.clientId,
    employeeId: visit.employeeId,
    clientName: visit.clientName ?? visit.clientId,
    scheduledFor: visit.scheduledFor ?? new Date(0).toISOString(),
    status: visit.status,
    systemsCount: systems.length,
    clientAddress: visit.clientAddress,
    clientLocation: visit.clientLocation,
    systems,
    arrival: visit.arrivedAt
      ? {
          arrivedAt: visit.arrivedAt,
          location: visit.arrivalLocation,
          distanceMeters: visit.arrivalDistanceMeters,
          outsideRadius: visit.outsideRadius,
          justification: visit.arrivalJustification,
        }
      : undefined,
    departure: visit.leftAt ? { leftAt: visit.leftAt, location: visit.departureLocation } : undefined,
    durationMinutes: visit.durationMinutes,
    description: visit.description,
    attendants: visit.attendants,
    photos: visit.photos,
    finishedAt: visit.finishedAt,
    syncStatus: "synced",
  };
}
