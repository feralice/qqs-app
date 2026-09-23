import React from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { VisitPhoto } from "@qqs/contracts";

import { theme } from "../theme";
import { styles } from "./PhotoEvidencePicker.styles";

export type PhotoEvidencePickerProps = {
  photos: VisitPhoto[];
  onAddPhoto: (photo: VisitPhoto) => void;
  onRemovePhoto: (photoId: string) => void;
  onUpdateCaption: (photoId: string, caption: string) => void;
  editable?: boolean;
};

export function PhotoEvidencePicker({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onUpdateCaption,
  editable = true,
}: PhotoEvidencePickerProps) {
  function handleCapture(source: "camera" | "gallery") {
    const newPhoto: VisitPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uri: `https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80`,
      caption: source === "camera" ? "Foto tirada em campo" : "Foto da galeria",
      takenAt: new Date().toISOString(),
    };
    onAddPhoto(newPhoto);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="camera" size={18} color={theme.colors.corporateBlue} />
          <Text style={styles.title}>Fotos e Evidências</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {photos.length} {photos.length === 1 ? "foto" : "fotos"}
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>
        Adicione fotos dos equipamentos, sistemas e condições gerais:
      </Text>

      {editable && (
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tirar foto com a câmera"
            onPress={() => handleCapture("camera")}
            style={styles.actionButton}
          >
            <Ionicons name="camera-outline" size={18} color={theme.colors.corporateBlue} />
            <Text style={styles.actionText}>Tirar Foto</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Escolher foto da galeria"
            onPress={() => handleCapture("gallery")}
            style={styles.actionButton}
          >
            <Ionicons name="images-outline" size={18} color={theme.colors.corporateBlue} />
            <Text style={styles.actionText}>Galeria</Text>
          </Pressable>
        </View>
      )}

      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={32} color="#CBD5E1" />
          <Text style={styles.emptyText}>Nenhuma evidência fotográfica anexada.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {photos.map((photo) => (
            <View key={photo.id} style={styles.photoCard}>
              <View style={styles.imagePlaceholder}>
                <Image
                  accessibilityLabel={photo.caption || "Foto da visita"}
                  resizeMode="cover"
                  source={{ uri: photo.uri }}
                  style={styles.imagePreview}
                />
              </View>

              {editable && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover foto"
                  onPress={() => onRemovePhoto(photo.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash" size={14} color={theme.colors.white} />
                </Pressable>
              )}

              <TextInput
                accessibilityLabel="Legenda da foto"
                editable={editable}
                onChangeText={(text) => onUpdateCaption(photo.id, text)}
                placeholder="Adicione uma legenda para a foto..."
                placeholderTextColor="#94A3B8"
                style={styles.captionInput}
                value={photo.caption ?? ""}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
