import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "../../shared/ui/components/Button";
import { TextField } from "../../shared/ui/components/TextField";
import { Screen } from "../../shared/ui/layout";
import { useAuth } from "./AuthContext";
import { styles } from "./LoginScreen.styles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loginErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("credentials")) {
    return "E-mail ou senha inválidos.";
  }
  if (message.includes("too many")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  }
  return "Não consegui falar com o servidor. Verifique sua conexão.";
}

export function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextEmailError = EMAIL_PATTERN.test(email.trim()) ? undefined : "Digite um e-mail válido.";
    const nextPasswordError = password.length >= 6 ? undefined : "A senha deve ter pelo menos 6 caracteres.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    return !nextEmailError && !nextPasswordError;
  }

  async function handleSubmit() {
    setFormError(undefined);
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      console.error("[LoginScreen] Erro de login:", error);
      setFormError(loginErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Screen scroll keyboard contentContainerStyle={styles.screen}>
        <View style={styles.logoWrap}>
          <Text style={styles.brand}>QQS App</Text>
          <Text style={styles.tagline}>Visitas técnicas</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>
          {formError && <Text style={styles.error}>{formError}</Text>}
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
            placeholder="Digite sua senha"
            error={passwordError}
          />
          <Button
            label="Entrar"
            loading={loading}
            disabled={!email || !password}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/register")}
            style={styles.switchLink}
          >
            <Text style={styles.tagline}>Não tem conta? Cadastre-se</Text>
          </Pressable>
        </View>
      </Screen>
    </View>
  );
}
