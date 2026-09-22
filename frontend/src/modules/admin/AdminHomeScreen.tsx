import { ScrollView, Text, View } from "react-native";

import { useAuth } from "../auth/AuthContext";
import { styles } from "./AdminHomeScreen.styles";

const upcomingSections = [
  { title: "Visão geral", body: "Visitas do dia, técnicos ativos e ocorrências fora do raio." },
  { title: "Mapa operacional", body: "Localização dos check-ins e empresas atendidas." },
  { title: "Empresas e funcionários", body: "Cadastro, edição e inativação." },
  { title: "Auditoria e relatórios", body: "Consulta de visitas com exportação em PDF e CSV." },
];

export function AdminHomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView>
      <Text style={styles.title}>Olá, {user?.name}</Text>
      <Text style={styles.subtitle}>Área do administrador</Text>
      <Text style={styles.sectionLabel}>Em construção</Text>
      {upcomingSections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardBody}>{section.body}</Text>
          <View style={styles.cardTag}>
            <Text style={styles.cardTagText}>Em breve</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
