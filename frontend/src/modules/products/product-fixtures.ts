import type { ClientProgram, Product } from "@qqs/contracts";

export const sampleProducts: Product[] = [
  { id: "product-bio", name: "QQS BIO", description: "Biocida", unit: "L", active: true },
  { id: "product-inp", name: "QQS INP", description: "Inibidor de corrosão", unit: "L", active: true },
  { id: "product-nss", name: "QQS NSS", unit: "kg", active: false },
];

export const sampleProgram: ClientProgram = {
  clientId: "client-001",
  systems: [
    {
      systemId: "system-001",
      systemName: "Torre 1",
      systemType: "tower",
      parameters: [{ name: "pH", min: 6.8, max: 8.2 }],
      products: [
        { productId: "product-inp", productName: "QQS INP", unit: "L", productActive: true, dailyDose: 2, maintenanceDose: 1 },
      ],
    },
    { systemId: "system-003", systemName: "Caldeira 1", systemType: "boiler", parameters: [], products: [] },
  ],
};
