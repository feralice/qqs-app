const Module = require("module");
const path = require("path");
const orig = Module._resolveFilename;

global.React = require("react");
global.__DEV__ = true;

if (typeof window === "undefined") {
  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    Image: class {
      set src(v) {
        if (this.onload) setTimeout(() => this.onload(), 0);
      }
    },
  };
}

if (typeof document === "undefined") {
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {} }),
  };
}

const iconMockPath = path.resolve(__dirname, "mock-icons.cjs");
const secureStoreMockPath = path.resolve(__dirname, "mock-secure-store.cjs");

Module._resolveFilename = function(req, ...args) {
  if (req === "react-native") return orig.call(this, "react-native-web", ...args);
  if (req === "@expo/vector-icons" || req.startsWith("@expo/vector-icons/")) {
    return iconMockPath;
  }
  if (req === "expo-secure-store") {
    return secureStoreMockPath;
  }
  return orig.call(this, req, ...args);
};

// Mock FlatList in Node test environment to avoid infinite VirtualizedList scheduling timers
const ReactNativeWeb = require("react-native-web");
const React = require("react");

if (ReactNativeWeb.Modal) {
  function MockModal(props) {
    if (!props.visible) return null;
    return React.createElement(
      ReactNativeWeb.View,
      { accessibilityRole: "dialog" },
      props.children
    );
  }
  ReactNativeWeb.Modal = MockModal;
}

if (ReactNativeWeb.FlatList) {
  function MockFlatList(props) {
    const { data = [], renderItem, ListEmptyComponent, ListHeaderComponent, ListFooterComponent, contentContainerStyle } = props;
    const header = typeof ListHeaderComponent === "function" ? React.createElement(ListHeaderComponent) : ListHeaderComponent;
    const footer = typeof ListFooterComponent === "function" ? React.createElement(ListFooterComponent) : ListFooterComponent;
    const empty = typeof ListEmptyComponent === "function" ? React.createElement(ListEmptyComponent) : ListEmptyComponent;

    return React.createElement(
      ReactNativeWeb.View,
      { style: contentContainerStyle },
      header,
      data && data.length > 0
        ? data.map((item, index) =>
            React.createElement(
              ReactNativeWeb.View,
              { key: (item && item.id) ? item.id : index },
              renderItem ? renderItem({ item, index, separators: {} }) : null
            )
          )
        : empty,
      footer
    );
  }
  ReactNativeWeb.FlatList = MockFlatList;
}
