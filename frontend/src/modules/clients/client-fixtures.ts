import type { ClientSummary } from "@qqs/contracts";

export const sampleClients: ClientSummary[] = [
  {
    id: "client-001",
    name: "Gases da Amazônia",
    cnpj: "11222333000181",
    address: "Manaus, AM",
    latitude: -3.1019,
    longitude: -60.025,
    radiusMeters: 200,
    active: true,
    systems: [{ id: "s1", clientId: "client-001", name: "Torre 1", type: "tower" }],
  },
  {
    id: "client-002",
    name: "Ambev Manaus",
    cnpj: "00000000000191",
    address: "Distrito Industrial",
    latitude: -3.13,
    longitude: -59.95,
    radiusMeters: 300,
    active: true,
    systems: [],
  },
];
