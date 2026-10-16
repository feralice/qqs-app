import React, { Children, type ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { theme } from "../theme";
import { useLayout } from "./LayoutProvider";
import { styles } from "./Grid.styles";

export type GridProps = {
  columns?: number;
  gap?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Grid({
  columns = 2,
  gap = theme.spacing.md,
  children,
  style,
}: GridProps) {
  const { size } = useLayout();
  const effectiveColumns = size === "compact" ? 1 : columns;

  const childArray = Children.toArray(children).filter(Boolean);

  if (effectiveColumns <= 1) {
    return (
      <View style={[styles.container, { gap }, style]}>
        {childArray.map((child, index) => (
          <View key={index} style={styles.item}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  const rows: ReactNode[][] = [];
  for (let i = 0; i < childArray.length; i += effectiveColumns) {
    rows.push(childArray.slice(i, i + effectiveColumns));
  }

  return (
    <View style={[styles.container, { gap }, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((child, colIndex) => (
            <View key={colIndex} style={styles.item}>
              {child}
            </View>
          ))}
          {row.length < effectiveColumns &&
            Array.from({ length: effectiveColumns - row.length }).map((_, spacerIndex) => (
              <View key={`spacer-${spacerIndex}`} style={styles.item} />
            ))}
        </View>
      ))}
    </View>
  );
}
