import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { VisitStatus } from "@qqs/contracts";
import { theme } from "../../shared/ui/theme";
import { styles } from "./VisitTimer.styles";

export function VisitTimer({
  arrivedAt,
  finishedAt,
  status,
}: {
  arrivedAt?: string;
  finishedAt?: string;
  status: VisitStatus;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() =>
    calculateElapsed(arrivedAt, finishedAt),
  );

  useEffect(() => {
    if (status !== "in_progress" || !arrivedAt) return;

    // Recalcula a cada 1 segundo em tempo real
    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed(arrivedAt, finishedAt));
    }, 1000);
    if (typeof interval?.unref === "function") {
      interval.unref();
    }

    return () => clearInterval(interval);
  }, [arrivedAt, finishedAt, status]);

  const isCompleted = status === "completed";
  const formattedTime = formatDuration(elapsedSeconds);

  return (
    <View style={[styles.timerCard, isCompleted && styles.timerCardCompleted]}>
      <View style={styles.timerHeaderRow}>
        <View style={styles.timerIconGroup}>
          <View style={[styles.iconCircle, isCompleted && styles.iconCircleCompleted]}>
            <Ionicons
              name={isCompleted ? "checkmark-done-circle" : "stopwatch-outline"}
              size={20}
              color={theme.colors.white}
            />
          </View>
          <View>
            <Text style={styles.timerLabel}>
              {isCompleted ? "Tempo Total de Atendimento" : "Tempo em Atendimento"}
            </Text>
            <Text style={styles.timerSublabel}>
              {isCompleted
                ? `Finalizado às ${finishedAt ? new Date(finishedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}`
                : "Contabilizando tempo no local"}
            </Text>
          </View>
        </View>

        {status === "in_progress" && (
          <View style={styles.liveBadge}>
            <View style={styles.pulsingDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}
      </View>

      <View style={styles.timeDisplayBox}>
        <Text style={[styles.timeText, isCompleted && styles.timeTextCompleted]}>
          {formattedTime}
        </Text>
      </View>
    </View>
  );
}

function calculateElapsed(arrivedAt?: string, finishedAt?: string): number {
  if (!arrivedAt) return 0;
  const startMs = new Date(arrivedAt).getTime();
  if (Number.isNaN(startMs)) return 0;
  const endMs = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  const diffSec = Math.max(0, Math.floor((endMs - startMs) / 1000));
  return diffSec;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(minutes)}m ${pad(seconds)}s`;
}
