import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider";
import { startVisit } from "./start-visit";
import type { VisitApi } from "./visit-api";
import { SyncQueue } from "../sync/sync-queue";
import { VisitStore } from "./visit-store";
import { Button } from "../../shared/ui/components/Button";
import { styles } from "./VisitDetailsScreen.styles";

export function VisitDetailsScreen({
  visit,
  api,
  locationProvider,
  employeeId = "employee-001",
  queue = new SyncQueue(),
  store = new VisitStore(),
}: {
  visit: VisitDetails;
  api: Pick<VisitApi, "startVisit">;
  locationProvider: LocationProvider;
  employeeId?: string;
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
      employeeId,
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
      <View style={[styles.badge, current.status === "in_progress" && styles.badgeInProgress]}>
        <Text style={styles.badgeText}>
          {current.status === "in_progress" ? "Em andamento" : "Aguardando chegada"}
        </Text>
      </View>
      <Text style={styles.section}>Sistemas</Text>
      <View style={styles.systemsCard}>
        {current.systems.map((system, index) => (
          <View
            key={system.id}
            style={[styles.systemRow, index === current.systems.length - 1 && styles.systemRowLast]}
          >
            <View style={styles.systemDot} />
            <Text style={styles.system}>{system.name}</Text>
          </View>
        ))}
      </View>
      {current.status === "assigned" && (
        <Button
          label="Registrar chegada"
          loading={loading}
          onPress={handleStart}
          style={styles.arrivalButton}
        />
      )}
      {message && <Text style={styles.message}>{message}</Text>}
      {coordinates && (
        <Button
          label="Abrir localização no Google Maps"
          variant="secondary"
          style={styles.mapButton}
          onPress={() =>
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`,
            )
          }
        />
      )}
    </ScrollView>
  );
}
