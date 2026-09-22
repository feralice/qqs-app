import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "../../shared/ui/components/Button";
import { TextField } from "../../shared/ui/components/TextField";
import { useAuth } from "./AuthContext";
import { styles } from "./LoginScreen.styles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function registerErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("already registered")) {
    return "Esse e-mail já tem uma conta.";
  }
  if (message.includes("valid email")) {
    return "Digite um e-mail válido.";
  }
  if (message.includes("6 characters")) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }
  return "Não consegui falar com o servidor. Verifique sua conexão.";
}

export function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextNameError = name.trim() ? undefined : "Digite seu nome.";
    const nextEmailError = EMAIL_PATTERN.test(email.trim()) ? undefined : "Digite um e-mail válido.";
    const nextPasswordError = password.length >= 6 ? undefined : "A senha deve ter pelo menos 6 caracteres.";
    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextNameError && !nextEmailError && !nextPasswordError;
  }

  async function handleSubmit() {
    setFormError(undefined);
    if (!validate()) return;

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (error) {
      console.error("[RegisterScreen] Erro de cadastro:", error);
      setFormError(registerErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Text style={styles.brand}>QQS App</Text>
          <Text style={styles.tagline}>Criar conta de técnico</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          {formError && <Text style={styles.error}>{formError}</Text>}
          <TextField
            label="Nome"
            value={name}
            onChangeText={(value) => {
              setName(value);
              if (nameError) setNameError(undefined);
            }}
            placeholder="Seu nome completo"
            error={nameError}
          />
          <TextField
            label="E-mail"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) setEmailError(undefined);
            }}
            placeholder="seuemail@empresa.com"
            error={emailError}
          />
          <TextField
            label="Senha"
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (passwordError) setPasswordError(undefined);
            }}
            placeholder="Pelo menos 6 caracteres"
            error={passwordError}
          />
          <Button
            label="Criar conta"
            loading={loading}
            disabled={!name || !email || !password}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
          <Pressable onPress={() => router.back()} style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={styles.tagline}>Já tenho conta, entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
