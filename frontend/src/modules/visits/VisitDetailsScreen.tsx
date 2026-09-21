import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider";
import { startVisit } from "./start-visit";
import type { VisitApi } from "./visit-api";
import { SyncQueue } from "../sync/sync-queue";
import { VisitStore } from "./visit-store";
import { theme } from "../../shared/ui/theme";

export function VisitDetailsScreen({
  visit,
  api,
  locationProvider,
  queue = new SyncQueue(),
  store = new VisitStore(),
}: {
  visit: VisitDetails;
  api: Pick<VisitApi, "startVisit">;
  locationProvider: LocationProvider;
  queue?: SyncQueue;
  store?: VisitStore;
}) {
  const [current, setCurrent] = useState(visit);
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    store.set(current);
    const result = await startVisit({
      visitId: current.id,
      clientId: current.clientId,
      employeeId: "employee-001",
      now: new Date().toISOString(),
      locationProvider,
      queue,
      store,
      api,
    });
    setCurrent(store.get(current.id) ?? current);
    setMessage(
      result.syncStatus === "synced"
        ? result.locationStatus === "granted"
          ? "Chegada registrada com localização."
          : "Chegada registrada sem localização."
        : "Chegada salva no dispositivo; será sincronizada depois.",
    );
    setLoading(false);
  }

  const coordinates = current.arrival?.location;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{current.clientName}</Text>
      {current.clientAddress && <Text style={styles.address}>{current.clientAddress}</Text>}
      <Text style={styles.section}>Sistemas</Text>
      {current.systems.map((system) => (
        <Text key={system.id} style={styles.system}>
          • {system.name}
        </Text>
      ))}
      {current.status === "assigned" && (
        <Pressable disabled={loading} onPress={handleStart} style={styles.primaryButton}>
          <Text style={styles.primaryText}>{loading ? "Registrando..." : "Registrar chegada"}</Text>
        </Pressable>
      )}
      {message && <Text style={styles.message}>{message}</Text>}
      {coordinates && (
        <Pressable
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
            )
          }
          style={styles.mapButton}
        >
          <Text style={styles.mapText}>Abrir localização no Google Maps</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: theme.spacing.lg },
  title: { color: theme.colors.darkGray, fontSize: 26, fontWeight: "700" },
  address: { color: theme.colors.nearBlack, marginTop: 8 },
  section: { color: theme.colors.darkGray, fontSize: 18, fontWeight: "700", marginTop: 28 },
  system: { color: theme.colors.nearBlack, fontSize: 16, marginTop: 10 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.colors.corporateBlue,
    borderRadius: theme.radius.md,
    marginTop: 28,
    padding: theme.spacing.md,
  },
  primaryText: { color: theme.colors.white, fontWeight: "700" },
  message: { color: theme.colors.darkGray, marginTop: theme.spacing.md },
  mapButton: {
    alignItems: "center",
    backgroundColor: theme.colors.aqua,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  mapText: { color: theme.colors.nearBlack, fontWeight: "700" },
});
