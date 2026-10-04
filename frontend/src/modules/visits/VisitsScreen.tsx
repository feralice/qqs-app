import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { ClientSummary, VisitDetails } from "@qqs/contracts";

import { VisitCard } from "./VisitCard";
import { WeekCalendarStrip } from "../../shared/ui/components/WeekCalendarStrip";
import { styles } from "./VisitsScreen.styles";
import { theme } from "../../shared/ui/theme";
import { TechnicianCreateVisitModal, type TechnicianVisitDraft } from "./TechnicianCreateVisitModal";

export type VisitsScreenProps = {
  visits: VisitDetails[];
  onOpen: (visitId: string) => void;
  initialDate?: string;
  clients?: ClientSummary[];
  onCreateVisit?: (draft: TechnicianVisitDraft) => Promise<void> | void;
  pendingSyncCount?: number;
  rejectedSyncCount?: number;
  onSync?: () => void;
};

export function VisitsScreen({
  visits: allVisits,
  onOpen,
  initialDate,
  clients = [],
  onCreateVisit,
  pendingSyncCount = 0,
  rejectedSyncCount = 0,
  onSync,
}: VisitsScreenProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    if (allVisits.some((v) => v.scheduledFor?.startsWith(todayStr))) {
      return todayStr;
    }
    const firstScheduled = allVisits.find((v) => v.scheduledFor)?.scheduledFor;
    return firstScheduled ? firstScheduled.substring(0, 10) : todayStr;
  });

  const [filterByDate, setFilterByDate] = useState<boolean>(true);

  const visitCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of allVisits) {
      if (v.scheduledFor) {
        const d = v.scheduledFor.substring(0, 10);
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }
    return counts;
  }, [allVisits]);

  const displayedVisits = useMemo(() => {
    if (!filterByDate) return allVisits;
    return allVisits.filter((v) => v.scheduledFor?.startsWith(selectedDate));
  }, [allVisits, selectedDate, filterByDate]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setFilterByDate(true);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <View>
          <Text style={styles.title}>Minhas visitas</Text>
          <Text style={styles.subtitle}>Visitas e checklists do dia</Text>
        </View>
        <View style={styles.countBadge}>
          <Ionicons name="calendar" size={14} color={theme.colors.corporateBlue} />
          <Text style={styles.countText}>{displayedVisits.length}</Text>
        </View>
      </View>

      {pendingSyncCount > 0 && (
        <View
          style={{
            alignItems: "center",
            backgroundColor: theme.colors.lightBlue,
            borderRadius: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
            padding: 12,
          }}
        >
          <Text style={{ color: theme.colors.darkGray, flex: 1 }}>
            {pendingSyncCount === 1 ? "1 registro aguardando envio" : `${pendingSyncCount} registros aguardando envio`}
          </Text>
          {onSync && (
            <Pressable accessibilityRole="button" accessibilityLabel="Sincronizar agora" onPress={onSync}>
              <Text style={{ color: theme.colors.corporateBlue, fontWeight: "700" }}>Sincronizar</Text>
            </Pressable>
          )}
        </View>
      )}

      {rejectedSyncCount > 0 && (
        <View style={{ backgroundColor: theme.colors.nearBlack, borderRadius: 10, marginBottom: 10, padding: 12 }}>
          <Text style={{ color: theme.colors.white }}>
            {rejectedSyncCount === 1
              ? "1 registro recusado pelo servidor. Procure o gestor para conferir a visita."
              : `${rejectedSyncCount} registros recusados pelo servidor. Procure o gestor para conferir as visitas.`}
          </Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar nova visita"
        onPress={() => setCreateModalOpen(true)}
        style={{ backgroundColor: theme.colors.corporateBlue, borderRadius: 10, marginBottom: 10, padding: 12 }}
      >
        <Text style={{ color: theme.colors.white, fontWeight: "700", textAlign: "center" }}>+ Adicionar visita</Text>
      </Pressable>

      {/* Week Calendar Strip */}
      <WeekCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        visitCountsByDate={visitCountsByDate}
        enableMonthView
      />

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>
          {filterByDate
            ? `Visitas de ${selectedDate.split("-").reverse().join("/")}`
            : "Exibindo todas as visitas"}
        </Text>
        {filterByDate ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver todas as visitas"
            onPress={() => setFilterByDate(false)}
            style={styles.allVisitsButton}
          >
            <Text style={styles.allVisitsText}>Ver todas</Text>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtrar por data selecionada"
            onPress={() => setFilterByDate(true)}
            style={styles.allVisitsButton}
          >
            <Text style={styles.allVisitsText}>Filtrar por dia</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={displayedVisits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="clipboard-outline" size={32} color={theme.colors.corporateBlue} />
            </View>
            <Text style={styles.emptyTitle}>
              {filterByDate
                ? "Nenhuma visita nesta data"
                : "Nenhuma visita atribuída"}
            </Text>
            <Text style={styles.emptyBody}>
              {filterByDate
                ? "Não há atendimentos agendados para este dia. Selecione outra data no calendário acima."
                : "Quando uma empresa for atribuída a você, ela aparecerá nesta lista."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <VisitCard visit={item} onPress={() => onOpen(item.id)} />
        )}
      />
      <TechnicianCreateVisitModal
        visible={createModalOpen}
        clients={clients}
        onClose={() => setCreateModalOpen(false)}
        onSave={async (draft) => {
          await onCreateVisit?.(draft);
        }}
      />
    </View>
  );
}
