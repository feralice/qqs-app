import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { EmployeeSummary, VisitDetails, VisitPhoto } from "@qqs/contracts";

import type { LocationProvider } from "../location/location-provider.js";
import { startVisit } from "./start-visit.js";
import { finishVisit } from "./finish-visit.js";
import type { VisitApi } from "./visit-api.js";
import { SyncQueue } from "../sync/sync-queue.js";
import { VisitStore } from "./visit-store.js";
import { LocationMap } from "../../shared/ui/components/LocationMap.js";
import { VisitTimer } from "./VisitTimer.js";
import { StaffPicker } from "../../shared/ui/components/StaffPicker.js";
import { ServiceReportCard } from "../../shared/ui/components/ServiceReportCard.js";
import { PhotoEvidencePicker } from "../../shared/ui/components/PhotoEvidencePicker.js";
import { Button } from "../../shared/ui/components/Button.js";
import { styles } from "./VisitDetailsScreen.styles.js";

const DEFAULT_EMPLOYEES: EmployeeSummary[] = [
  { id: "employee-001", name: "Técnico Responsável", email: "tecnico@qqs.com", role: "employee" },
  { id: "emp-2", name: "Carlos Silva", email: "carlos@qqs.com", role: "employee" },
  { id: "emp-3", name: "Marcos Lima", email: "marcos@qqs.com", role: "employee" },
];

export type VisitDetailsScreenProps = {
  visit: VisitDetails;
  api: Pick<VisitApi, "startVisit" | "finishVisit"> & Partial<Pick<VisitApi, "listEmployees">>;
  locationProvider: LocationProvider;
  employeeId?: string;
  queue?: SyncQueue;
  store?: VisitStore;
  availableEmployees?: EmployeeSummary[];
};

export function VisitDetailsScreen({
  visit,
  api,
  locationProvider,
  employeeId = "employee-001",
  queue = new SyncQueue(),
  store = new VisitStore(),
  availableEmployees,
}: VisitDetailsScreenProps) {
  const [current, setCurrent] = useState(visit);
  const [message, setMessage] = useState<string>();
  const [loading, setLoading] = useState(false);

  // States for service execution
  const [description, setDescription] = useState(visit.description ?? "");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(
    () => visit.attendants?.map((a) => a.id) ?? [],
  );
  const [photos, setPhotos] = useState<VisitPhoto[]>(() => visit.photos ?? []);
  const [employees, setEmployees] = useState<EmployeeSummary[]>(
    () => availableEmployees ?? DEFAULT_EMPLOYEES,
  );
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: -3.10194,
    longitude: -60.025,
  });

  useEffect(() => {
    if (availableEmployees) {
      setEmployees(availableEmployees);
    } else if (api.listEmployees) {
      api.listEmployees()
        .then((items) => {
          if (items && items.length > 0) setEmployees(items);
        })
        .catch(() => {
          // Mantém colaboradores padrão em caso de indisponibilidade de rede
        });
    }
  }, [api, availableEmployees]);

  useEffect(() => {
    if (current.status === "assigned") {
      locationProvider.getArrivalLocation().then((res) => {
        if (res.status === "granted" && res.location) {
          setLiveLocation({
            latitude: res.location.latitude,
            longitude: res.location.longitude,
          });
        }
      });
    }
  }, [current.status, locationProvider]);

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
          ? "Chegada confirmada com sucesso via GPS no mapa!"
          : "Chegada registrada sem localização GPS."
        : "Chegada salva no aparelho; será sincronizada assim que houver rede.",
    );
    setLoading(false);
  }

  async function handleFinish() {
    setLoading(true);
    const attendantsToSave = employees.filter((emp) => selectedStaffIds.includes(emp.id));
    const result = await finishVisit({
      visitId: current.id,
      clientId: current.clientId,
      employeeId,
      now: new Date().toISOString(),
      locationProvider,
      queue,
      store,
      api,
      description,
      attendants: attendantsToSave,
      photos,
    });
    setCurrent(result.visit);
    setMessage(
      result.syncStatus === "synced"
        ? "Atendimento finalizado e sincronizado com sucesso!"
        : "Atendimento finalizado localmente no aparelho (sincronização pendente).",
    );
    setLoading(false);
  }

  function handleToggleStaff(id: string) {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleAddPhoto(photo: VisitPhoto) {
    setPhotos((prev) => [...prev, photo]);
  }

  function handleRemovePhoto(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  function handleUpdateCaption(photoId: string, caption: string) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, caption } : p)),
    );
  }

  const coordinates = current.arrival?.location ?? liveLocation;
  const isInProgress = current.status === "in_progress";
  const isCompleted = current.status === "completed";
  const isAssigned = current.status === "assigned";

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

      {/* Mapa do Google Maps com Live Preview e Check-in ou Registros de Chegada/Saída */}
      {isAssigned ? (
        <LocationMap
          latitude={liveLocation.latitude}
          longitude={liveLocation.longitude}
          address={current.clientAddress}
          clientName={current.clientName}
          isLivePreview={true}
          onConfirmArrival={handleStart}
          confirmArrivalLoading={loading}
        />
      ) : (
        <LocationMap
          latitude={coordinates.latitude}
          longitude={coordinates.longitude}
          address={current.clientAddress}
          clientName={current.clientName}
          timestamp={current.arrival?.arrivedAt}
          departureLocation={current.departure?.location}
          departureTime={current.departure?.leftAt ?? current.finishedAt}
        />
      )}

      {/* Sistemas vistoriados */}
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

      {/* Card da Equipe Presente */}
      <StaffPicker
        employees={employees}
        selectedIds={selectedStaffIds}
        onToggle={handleToggleStaff}
        editable={!isCompleted}
      />

      {/* Card do Relatório do Serviço */}
      <ServiceReportCard
        value={description}
        onChangeText={setDescription}
        editable={!isCompleted}
      />

      {/* Card de Fotos e Evidências */}
      <PhotoEvidencePicker
        photos={photos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
        onUpdateCaption={handleUpdateCaption}
        editable={!isCompleted}
      />

      {/* Ações de início ou encerramento */}
      {isAssigned && (
        <Button
          label="Registrar chegada"
          loading={loading}
          onPress={handleStart}
          style={styles.arrivalButton}
        />
      )}

      {isInProgress && (
        <Button
          label="Marcar Saída"
          loading={loading}
          onPress={handleFinish}
          style={styles.finishButton}
        />
      )}

      {message && <Text style={styles.message}>{message}</Text>}
    </ScrollView>
  );
}
