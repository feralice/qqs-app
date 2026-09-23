import React, { useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ArrivalLocation } from "@qqs/contracts";

import { theme } from "../theme";
import { styles } from "./LocationMap.styles";

export type LocationMapProps = {
  latitude: number;
  longitude: number;
  address?: string;
  clientName?: string;
  timestamp?: string;
  isLivePreview?: boolean;
  onConfirmArrival?: () => void;
  confirmArrivalLoading?: boolean;
  departureLocation?: ArrivalLocation;
  departureTime?: string;
};

export function LocationMap({
  latitude,
  longitude,
  address,
  clientName,
  timestamp,
  isLivePreview = false,
  onConfirmArrival,
  confirmArrivalLoading = false,
  departureLocation,
  departureTime,
}: LocationMapProps) {
  const [mapType, setMapType] = useState<"m" | "k">("m"); // m = roadmap, k = satellite

  const googleEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=${mapType}&z=16&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : undefined;

  const formattedDepartureTime = departureTime
    ? new Date(departureTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : undefined;

  return (
    <View style={styles.card}>
      <View style={[styles.header, isLivePreview && styles.headerLive]}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.iconCircle, isLivePreview && styles.iconCircleLive]}>
            <Ionicons
              name={isLivePreview ? "navigate" : "location"}
              size={18}
              color={theme.colors.white}
            />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>
              {isLivePreview ? "Localização Atual (GPS ao Vivo)" : "Localização da Chegada"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {clientName ? `${clientName} • ` : ""}
              {isLivePreview
                ? "Confirme sua chegada no local para iniciar o atendimento"
                : formattedTime
                  ? `Registrado às ${formattedTime}`
                  : "Confirmado via GPS"}
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

      {isLivePreview && onConfirmArrival && (
        <View style={styles.actionContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirmar Chegada (OK)"
            disabled={confirmArrivalLoading}
            onPress={onConfirmArrival}
            style={[styles.okButton, confirmArrivalLoading && styles.okButtonDisabled]}
          >
            {confirmArrivalLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
                <Text style={styles.okButtonText}>Confirmar Chegada (OK)</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {address && (
        <View style={styles.addressRow}>
          <Ionicons name="business-outline" size={15} color={theme.colors.darkGray} />
          <Text style={styles.addressText} numberOfLines={2}>
            {address}
          </Text>
        </View>
      )}

      {departureTime && (
        <View style={styles.departureCard}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <View style={{ flex: 1 }}>
            <Text style={styles.departureText}>
              Saída registrada às {formattedDepartureTime ?? departureTime}
            </Text>
            {departureLocation && (
              <Text style={styles.departureCoords}>
                GPS Saída: {departureLocation.latitude.toFixed(5)}, {departureLocation.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setMapType((curr) => (curr === "m" ? "k" : "m"))}
          style={styles.toggleButton}
        >
          <Ionicons
            name={mapType === "m" ? "earth-outline" : "map-outline"}
            size={14}
            color={theme.colors.nearBlack}
          />
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
