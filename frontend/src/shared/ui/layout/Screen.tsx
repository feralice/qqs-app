import React, { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useLayout } from "./LayoutProvider";
import { styles } from "./Screen.styles";

export type ScreenProps = {
  children?: ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { gutter } = useLayout();

  let content = (
    <View style={[styles.inner, { paddingHorizontal: gutter }, style]}>
      {children}
    </View>
  );

  if (scroll) {
    content = (
      <ScrollView
        style={styles.outer}
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    );
  }

  if (keyboard) {
    content = (
      <KeyboardAvoidingView
        style={styles.outer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.outer}>{content}</View>;
}
