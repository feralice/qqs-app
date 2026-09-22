import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../auth/AuthContext";
import { StatCard } from "../../shared/ui/components/StatCard";
import { Badge } from "../../shared/ui/components/Badge";
import { theme } from "../../shared/ui/theme";
import { styles } from "./AdminHomeScreen.styles";

const adminModules = [
  {
    title: "Visão Geral das Visitas",
    body: "Acompanhamento em tempo real dos checklists e status das vistorias.",
    iconName: "clipboard" as const,
    badgeLabel: "Ativo",
    badgeVariant: "success" as const,
  },
  {
    title: "Mapa Operacional & GPS",
    body: "Localização precisa dos check-ins e empresas atendidas no dia.",
    iconName: "map" as const,
    badgeLabel: "Ao Vivo",
    badgeVariant: "info" as const,
  },
  {
    title: "Empresas e Funcionários",
    body: "Gerenciamento de clientes, cadastro de técnicos e permissões.",
    iconName: "people" as const,
    badgeLabel: "Gestão",
    badgeVariant: "neutral" as const,
  },
  {
    title: "Auditoria e Relatórios PDF/CSV",
    body: "Exportação de comprovantes de visita e relatórios com assinatura.",
    iconName: "document-text" as const,
    badgeLabel: "Relatórios",
    badgeVariant: "warning" as const,
  },
];

export function AdminHomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Olá, {user?.name ?? "Administrador"}</Text>
          <Text style={styles.subtitle}>Painel de Controle e Gestão Operacional</Text>
        </View>
        <Badge label="Supervisor" variant="info" iconName="shield-checkmark" />
      </View>

      {/* KPI Stats Grid */}
      <Text style={styles.sectionTitle}>Métricas da Operação</Text>
      <View style={styles.statsRow}>
        <StatCard
          title="Visitas Hoje"
          value="12"
          subtitle="4 concluídas"
          iconName="calendar"
          accentColor={theme.colors.corporateBlue}
          trend="+15%"
        />
        <StatCard
          title="Técnicos Ativos"
          value="5"
          subtitle="Em campo agora"
          iconName="people"
          accentColor="#27AE60"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          title="Tempo Médio"
          value="45 min"
          subtitle="Por atendimento"
          iconName="stopwatch"
          accentColor="#F39C12"
        />
        <StatCard
          title="Precisão GPS"
          value="100%"
          subtitle="Sem divergência"
          iconName="navigate"
          accentColor={theme.colors.corporateBlue}
        />
      </View>

      {/* Admin Modules */}
      <Text style={styles.sectionTitle}>Módulos do Sistema</Text>
      {adminModules.map((item) => (
        <View key={item.title} style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={styles.moduleIconWrap}>
              <Ionicons name={item.iconName} size={20} color={theme.colors.corporateBlue} />
            </View>
            <View style={styles.moduleTextWrap}>
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleBody}>{item.body}</Text>
            </View>
          </View>
          <View style={styles.moduleFooter}>
            <Badge label={item.badgeLabel} variant={item.badgeVariant} showDot />
            <Ionicons name="chevron-forward" size={18} color="#8A8F98" />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
