import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { Text } from "react-native";
import { create, act } from "react-test-renderer";

import { AppShell } from "../../shared/ui/AppShell";
import { LoginScreen } from "./LoginScreen";
import { styles as loginStyles } from "./LoginScreen.styles";
import { RegisterScreen } from "./RegisterScreen";
import { AuthProvider } from "./AuthContext";

test("AppShell wraps content inside responsive Screen component", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <AuthProvider>
        <AppShell>
          <Text>Conteúdo Protegido</Text>
        </AppShell>
      </AuthProvider>
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Conteúdo Protegido/);
  assert.match(output, /QQS App/);
});

test("LoginScreen renders with responsive Screen and login form", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Entrar/);
  assert.match(output, /E-mail/);
  assert.match(output, /Senha/);
});

test("RegisterScreen renders form fields with extracted styles and Screen container", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <AuthProvider>
        <RegisterScreen />
      </AuthProvider>
    );
  });
  const output = JSON.stringify(tree!.toJSON());
  assert.match(output, /Criar conta/);
  assert.match(output, /Nome/);
  assert.match(output, /E-mail/);
  assert.match(output, /Senha/);
});

test("LoginScreen exposes the sign-up link as a button to screen readers", () => {
  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
  });
  const [signUpLink] = tree!.root.findAll((node) => node.props.style === loginStyles.switchLink);
  assert.equal(signUpLink.props.accessibilityRole, "button");
});
