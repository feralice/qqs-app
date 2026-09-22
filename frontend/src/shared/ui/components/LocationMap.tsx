import { useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { theme } from "../theme";
import { styles } from "./LocationMap.styles";

export type LocationMapProps = {
  latitude: number;
  longitude: number;
  address?: string;
  clientName?: string;
  timestamp?: string;
};

export function LocationMap({
  latitude,
  longitude,
  address,
  clientName,
  timestamp,
}: LocationMapProps) {
  const [mapType, setMapType] = useState<"m" | "k">("m"); // m = roadmap, k = satellite

  const googleEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=${mapType}&z=16&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : undefined;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={18} color={theme.colors.white} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Localização da Chegada</Text>
            <Text style={styles.headerSubtitle}>
              {clientName ? `${clientName} • ` : ""}
              {formattedTime ? `Registrado às ${formattedTime}` : "Confirmado via GPS"}
            </Text>
          </View>
        </View>

        <View style={styles.coordsBadge}>
          <Ionicons name="navigate-outline" size={13} color={theme.colors.corporateBlue} />
          <Text style={styles.coordsText}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
      </View>

      {/* Embedded Map Container */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          // @ts-ignore - iframe for React Native Web
          <iframe
            title="Mapa de localização da visita"
            src={googleEmbedUrl}
            width="100%"
            height="220"
            style={{ border: "0px", borderRadius: "12px", display: "block" }}
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <View style={styles.nativeFallback}>
            <Ionicons name="map-outline" size={36} color={theme.colors.corporateBlue} />
            <Text style={styles.fallbackTitle}>Mapa GPS Registrado</Text>
            <Text style={styles.fallbackText}>
              Lat: {latitude.toFixed(5)} | Long: {longitude.toFixed(5)}
            </Text>
          </View>
        )}
      </View>

      {address && (
        <View style={styles.addressRow}>
          <Ionicons name="business-outline" size={15} color={theme.colors.darkGray} />
          <Text style={styles.addressText} numberOfLines={2}>
            {address}
          </Text>
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMapType((curr) => (curr === "m" ? "k" : "m"))}
          style={styles.toggleButton}
        >
          <Ionicons name={mapType === "m" ? "earth-outline" : "map-outline"} size={14} color={theme.colors.nearBlack} />
          <Text style={styles.toggleText}>
            {mapType === "m" ? "Modo Satélite" : "Modo Mapa"}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => Linking.openURL(externalMapUrl)}
          style={styles.externalLink}
        >
          <Text style={styles.externalText}>Abrir no app do Maps</Text>
          <Ionicons name="open-outline" size={13} color={theme.colors.corporateBlue} />
        </Pressable>
      </View>
    </View>
  );
}
