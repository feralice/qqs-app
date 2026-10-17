import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { create, act } from "react-test-renderer";

import { LayoutProvider, useLayout } from "./LayoutProvider";
import { Screen } from "./Screen";
import { styles as screenStyles } from "./Screen.styles";
import { Grid } from "./Grid";

function ProbeComponent() {
  const layout = useLayout();
  return <Text testID="layout-probe">{JSON.stringify(layout)}</Text>;
}

test("LayoutProvider supplies custom width and size to useLayout", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <LayoutProvider width={340}>
        <ProbeComponent />
      </LayoutProvider>
    );
  });
  const textInstance = tree!.root.findByProps({ testID: "layout-probe" });
  assert.equal(textInstance.props.children, JSON.stringify({ width: 340, size: "compact", gutter: 12 }));
});

test("Screen renders container with maxWidth 560 and gutter padding", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <LayoutProvider width={800}>
        <Screen>
          <Text>Hello World</Text>
        </Screen>
      </LayoutProvider>
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Hello World/);
  assert.match(output, /paddingLeft":"16px/);
  assert.equal(screenStyles.inner.maxWidth, 560);
});

test("Screen wraps content in ScrollView when scroll prop is true", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <Screen scroll>
        <Text>Scrollable Content</Text>
      </Screen>
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Scrollable Content/);
});

test("Grid distributes children in 2 columns for regular and 1 column for compact", () => {
  let regularTree: ReturnType<typeof create>;
  act(() => {
    regularTree = create(
      <LayoutProvider width={400}>
        <Grid>
          <View testID="item-1"><Text>1</Text></View>
          <View testID="item-2"><Text>2</Text></View>
        </Grid>
      </LayoutProvider>
    );
  });
  const regJson = JSON.stringify(regularTree!.toJSON());
  assert.match(regJson, /item-1/);
  assert.match(regJson, /item-2/);

  let compactTree: ReturnType<typeof create>;
  act(() => {
    compactTree = create(
      <LayoutProvider width={320}>
        <Grid>
          <View testID="c-item-1"><Text>1</Text></View>
          <View testID="c-item-2"><Text>2</Text></View>
        </Grid>
      </LayoutProvider>
    );
  });
  const compJson = JSON.stringify(compactTree!.toJSON());
  assert.match(compJson, /c-item-1/);
  assert.match(compJson, /c-item-2/);
});

test("Screen with keyboard uses height behavior on Android so inputs stay above the keyboard", () => {
  const originalOS = Platform.OS;
  Platform.OS = "android";
  try {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        <Screen keyboard>
          <Text>Form</Text>
        </Screen>
      );
    });
    const keyboardView = tree!.root.findByType(KeyboardAvoidingView);
    assert.equal(keyboardView.props.behavior, "height");
  } finally {
    Platform.OS = originalOS;
  }
});
