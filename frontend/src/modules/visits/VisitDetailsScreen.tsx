import { useState } from "react";
import { ScrollView, Text, View } from "react-native";

import type { VisitDetails } from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider";
import { startVisit } from "./start-visit";
import type { VisitApi } from "./visit-api";
import { SyncQueue } from "../sync/sync-queue";
import { VisitStore } from "./visit-store";
import { LocationMap } from "../../shared/ui/components/LocationMap";
import { VisitTimer } from "./VisitTimer";
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
  api: Pick<VisitApi, "startVisit" | "finishVisit">;
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
          ? "Chegada registrada com localização no mapa."
          : "Chegada registrada sem localização."
        : "Chegada salva no dispositivo; será sincronizada depois.",
    );
    setLoading(false);
  }

  async function handleFinish() {
    setLoading(true);
    const finishedAt = new Date().toISOString();
    try {
      if ("finishVisit" in api && typeof api.finishVisit === "function") {
        const updated = await api.finishVisit(current.id, {
          operationId: `op-finish-${Date.now()}`,
          finishedAt,
        });
        const updatedVisit: VisitDetails = {
          ...current,
          ...updated,
          status: "completed",
          finishedAt,
        };
        store.set(updatedVisit);
        setCurrent(updatedVisit);
      } else {
        const updatedVisit: VisitDetails = {
          ...current,
          status: "completed",
          finishedAt,
        };
        store.set(updatedVisit);
        setCurrent(updatedVisit);
      }
      setMessage("Atendimento finalizado com sucesso!");
    } catch {
      const updatedVisit: VisitDetails = {
        ...current,
        status: "completed",
        finishedAt,
      };
      store.set(updatedVisit);
      setCurrent(updatedVisit);
      setMessage("Atendimento finalizado localmente no aparelho!");
    } finally {
      setLoading(false);
    }
  }

  const coordinates = current.arrival?.location;
  const isInProgress = current.status === "in_progress";
  const isCompleted = current.status === "completed";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{current.clientName}</Text>
      {current.clientAddress && <Text style={styles.address}>{current.clientAddress}</Text>}
      
      <View
        style={[
          styles.badge,
          isInProgress && styles.badgeInProgress,
          isCompleted && styles.badgeCompleted,
        ]}
      >
        <Text style={styles.badgeText}>
          {isCompleted
            ? "Atendimento Concluído"
            : isInProgress
              ? "Em andamento"
              : "Aguardando chegada"}
        </Text>
      </View>

      {(isInProgress || isCompleted) && (
        <VisitTimer
          arrivedAt={current.arrival?.arrivedAt}
          finishedAt={current.finishedAt}
          status={current.status}
        />
      )}

      <Text style={styles.section}>Sistemas para vistoria</Text>
      <View style={styles.systemsCard}>
        {current.systems.map((system, index) => (
          <View
            key={system.id}
            style={[styles.systemRow, index === current.systems.length - 1 && styles.systemRowLast]}
          >
            <View style={[styles.systemDot, isCompleted && styles.systemDotCompleted]} />
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

      {isInProgress && (
        <Button
          label="Finalizar atendimento"
          loading={loading}
          onPress={handleFinish}
          style={styles.finishButton}
        />
      )}

      {message && <Text style={styles.message}>{message}</Text>}

      {coordinates && (
        <LocationMap
          latitude={coordinates.latitude}
          longitude={coordinates.longitude}
          address={current.clientAddress}
          clientName={current.clientName}
          timestamp={current.arrival?.arrivedAt}
        />
      )}
    </ScrollView>
  );
}
