import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { VisitDetails } from "@qqs/contracts";

import { VisitCard } from "./VisitCard.js";
import { WeekCalendarStrip } from "../../shared/ui/components/WeekCalendarStrip.js";
import { styles } from "./VisitsScreen.styles.js";
import { theme } from "../../shared/ui/theme.js";

export type VisitsScreenProps = {
  visits: VisitDetails[];
  onOpen: (visitId: string) => void;
  initialDate?: string;
};

export function VisitsScreen({
  visits,
  onOpen,
  initialDate,
}: VisitsScreenProps) {
  const todayStr = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (initialDate) return initialDate;
    if (visits.some((v) => v.scheduledFor?.startsWith(todayStr))) {
      return todayStr;
    }
    const firstScheduled = visits.find((v) => v.scheduledFor)?.scheduledFor;
    return firstScheduled ? firstScheduled.substring(0, 10) : todayStr;
  });

  const [filterByDate, setFilterByDate] = useState<boolean>(true);

  const visitCountsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of visits) {
      if (v.scheduledFor) {
        const d = v.scheduledFor.substring(0, 10);
        counts[d] = (counts[d] ?? 0) + 1;
      }
    }
    return counts;
  }, [visits]);

  const displayedVisits = useMemo(() => {
    if (!filterByDate) return visits;
    return visits.filter((v) => v.scheduledFor?.startsWith(selectedDate));
  }, [visits, selectedDate, filterByDate]);

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

      {/* Week Calendar Strip */}
      <WeekCalendarStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        visitCountsByDate={visitCountsByDate}
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
    </View>
  );
}
