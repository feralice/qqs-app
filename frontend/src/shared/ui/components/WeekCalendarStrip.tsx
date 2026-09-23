import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./WeekCalendarStrip.styles";

export type WeekCalendarStripProps = {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  visitCountsByDate?: Record<string, number>;
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
}: WeekCalendarStripProps) {
  const initialDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [referenceDate, setReferenceDate] = useState<Date>(initialDate);

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

  function handleToday() {
    const now = new Date();
    setReferenceDate(now);
    onSelectDate(formatIsoDate(now));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthTitle}>{monthTitle}</Text>
        <View style={styles.navRow}>
          <Pressable
            accessibilityLabel="Semana anterior"
            accessibilityRole="button"
            onPress={handlePrevWeek}
            style={styles.navButton}
          >
            <Ionicons name="chevron-back" size={16} color={theme.colors.nearBlack} />
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
            accessibilityLabel="Próxima semana"
            accessibilityRole="button"
            onPress={handleNextWeek}
            style={styles.navButton}
          >
            <Ionicons name="chevron-forward" size={16} color={theme.colors.nearBlack} />
          </Pressable>
        </View>
      </View>

      <View style={styles.daysRow}>
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
      </View>
    </View>
  );
}
