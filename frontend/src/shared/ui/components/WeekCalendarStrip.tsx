import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./WeekCalendarStrip.styles";

export type WeekCalendarStripProps = {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  visitCountsByDate?: Record<string, number>;
  enableMonthView?: boolean;
};

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function WeekCalendarStrip({
  selectedDate,
  onSelectDate,
  visitCountsByDate = {},
  enableMonthView = false,
}: WeekCalendarStripProps) {
  const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [referenceDate, setReferenceDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<"week" | "month">("week");

  const startOfWeek = getStartOfWeek(referenceDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const todayStr = formatIsoDate(new Date());
  const monthTitle = `${MONTH_NAMES[startOfWeek.getMonth()]} ${startOfWeek.getFullYear()}`;

  function handlePrevWeek() {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    setReferenceDate(prev);
  }

  function handleNextWeek() {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  }

  function handlePrevMonth() {
    const previous = new Date(referenceDate);
    previous.setMonth(previous.getMonth() - 1);
    setReferenceDate(previous);
  }

  function handleNextMonth() {
    const next = new Date(referenceDate);
    next.setMonth(next.getMonth() + 1);
    setReferenceDate(next);
  }

  function handleToday() {
    const now = new Date();
    setReferenceDate(now);
    onSelectDate(formatIsoDate(now));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
          {viewMode === "month" && <Text style={{ color: theme.colors.darkGray, fontSize: 11 }}>Visão mensal</Text>}
        </View>
        <View style={styles.navRow}>
          <Pressable
            accessibilityLabel={viewMode === "month" ? "Mês anterior" : "Semana anterior"}
            accessibilityRole="button"
            onPress={viewMode === "month" ? handlePrevMonth : handlePrevWeek}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={16} color={theme.colors.nearBlack} />
          </Pressable>
          <Pressable
            accessibilityLabel="Ver mês"
            accessibilityRole="button"
            onPress={() => enableMonthView && setViewMode((current) => current === "week" ? "month" : "week")}
            style={styles.todayButton}
          >
            <Text style={styles.todayText}>{viewMode === "month" ? "Semana" : "Mês"}</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Voltar para hoje"
            accessibilityRole="button"
            onPress={handleToday}
            style={styles.todayButton}
          >
            <Text style={styles.todayText}>Hoje</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={viewMode === "month" ? "Próximo mês" : "Próxima semana"}
            accessibilityRole="button"
            onPress={viewMode === "month" ? handleNextMonth : handleNextWeek}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.colors.nearBlack} />
          </Pressable>
        </View>
      </View>

      {viewMode === "week" || !enableMonthView ? <View style={styles.daysRow}>
        {weekDays.map((date) => {
          const dateStr = formatIsoDate(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const count = visitCountsByDate[dateStr] ?? 0;

          return (
            <Pressable
              key={dateStr}
              accessibilityRole="button"
              accessibilityLabel={`${DAY_NAMES[date.getDay()]}, ${date.getDate()}`}
              onPress={() => onSelectDate(dateStr)}
              style={[
                styles.dayCol,
                isSelected && styles.dayColSelected,
                isToday && !isSelected && styles.dayColToday,
              ]}
            >
              <Text style={[styles.dayOfWeek, isSelected && styles.dayOfWeekSelected]}>
                {DAY_NAMES[date.getDay()]}
              </Text>
              <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
                {date.getDate()}
              </Text>
              {count > 0 && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeSelected]}>
                  <Text style={[styles.countText, isSelected && styles.countTextSelected]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View> : <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 6 }}>
        {Array.from({ length: new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate() }, (_, index) => {
          const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), index + 1);
          const dateStr = formatIsoDate(date);
          const count = visitCountsByDate[dateStr] ?? 0;
          const isSelected = dateStr === selectedDate;
          return (
            <Pressable
              key={dateStr}
              accessibilityRole="button"
              accessibilityLabel={`Dia ${date.getDate()}`}
              onPress={() => onSelectDate(dateStr)}
              style={{ alignItems: "center", borderRadius: 8, minWidth: "14.28%", paddingVertical: 8, backgroundColor: isSelected ? theme.colors.corporateBlue : "transparent" }}
            >
              <Text style={{ color: isSelected ? theme.colors.white : theme.colors.nearBlack, fontWeight: "600" }}>{date.getDate()}</Text>
              {count > 0 && <Text style={{ color: isSelected ? theme.colors.white : theme.colors.corporateBlue, fontSize: 10 }}>{count}</Text>}
            </Pressable>
          );
        })}
      </View>}
    </View>
  );
}
