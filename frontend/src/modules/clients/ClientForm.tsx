import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { isValidCnpj, type CreateClientRequest } from "@qqs/contracts";

import { styles } from "./ClientForm.styles";

// Aceita vírgula decimal, como o técnico digita no teclado em português.
export function parseDecimal(value: string): number | undefined {
  const text = value.trim().replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(text)) return undefined;
  return Number(text);
}

type Field = "name" | "cnpj" | "address" | "latitude" | "longitude" | "radius";

function validate(values: Record<Field, string>): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const latitude = parseDecimal(values.latitude);
  const longitude = parseDecimal(values.longitude);
  const radius = Number(values.radius);
  if (!values.name.trim()) errors.name = "Informe a razão social";
  if (!isValidCnpj(values.cnpj)) errors.cnpj = "CNPJ inválido";
  if (!values.address.trim()) errors.address = "Informe o endereço";
  if (latitude === undefined || latitude < -90 || latitude > 90) errors.latitude = "Latitude deve estar entre -90 e 90";
  if (longitude === undefined || longitude < -180 || longitude > 180) {
    errors.longitude = "Longitude deve estar entre -180 e 180";
  }
  if (!/^\d+$/.test(values.radius.trim()) || radius <= 0) errors.radius = "Raio deve ser um número inteiro maior que zero";
  return errors;
}

export function ClientForm({
  submitting = false,
  error,
  onSubmit,
}: {
  submitting?: boolean;
  error?: string;
  onSubmit: (request: CreateClientRequest) => void | Promise<void>;
}) {
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    cnpj: "",
    address: "",
    latitude: "",
    longitude: "",
    radius: "200",
  });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [systems, setSystems] = useState<Array<{ name: string; type: string }>>([]);
  const [systemName, setSystemName] = useState("");
  const [systemType, setSystemType] = useState("");

  const set = (field: Field) => (text: string) => setValues((current) => ({ ...current, [field]: text }));

  function addSystem() {
    const name = systemName.trim();
    const type = systemType.trim();
    if (!name || !type || systems.some((system) => system.name === name)) return;
    setSystems((current) => [...current, { name, type }]);
    setSystemName("");
  }

  async function submit() {
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await onSubmit({
      name: values.name.trim(),
      cnpj: values.cnpj.trim(),
      address: values.address.trim(),
      latitude: parseDecimal(values.latitude)!,
      longitude: parseDecimal(values.longitude)!,
      radiusMeters: Number(values.radius),
      systems,
    });
  }

  const field = (key: Field, label: string, placeholder: string, keyboardType?: "numeric") => (
    <View style={styles.fieldGroup}>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        keyboardType={keyboardType}
        value={values[key]}
        onChangeText={set(key)}
        style={styles.input}
      />
      {errors[key] && <Text style={styles.fieldError}>{errors[key]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {field("name", "Razão social", "Razão social")}
      {field("cnpj", "CNPJ", "00.000.000/0000-00", "numeric")}
      {field("address", "Endereço", "Endereço completo")}
      {field("latitude", "Latitude", "-3,1019", "numeric")}
      {field("longitude", "Longitude", "-60,0250", "numeric")}
      {field("radius", "Raio permitido em metros", "200", "numeric")}

      <Text style={styles.sectionTitle}>Sistemas ({systems.length})</Text>
      {systems.map((system) => (
        <View key={system.name} style={styles.systemRow}>
          <Text style={styles.systemText}>
            {system.name} ({system.type})
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remover ${system.name}`}
            onPress={() => setSystems((current) => current.filter((item) => item.name !== system.name))}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remover</Text>
          </Pressable>
        </View>
      ))}
      <TextInput
        accessibilityLabel="Nome do sistema"
        placeholder="Ex.: Torre 1"
        value={systemName}
        onChangeText={setSystemName}
        style={styles.input}
      />
      <TextInput
        accessibilityLabel="Tipo do sistema"
        placeholder="Ex.: torre, caldeira"
        value={systemType}
        onChangeText={setSystemType}
        style={styles.input}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar sistema"
        onPress={addSystem}
        style={styles.addSystemButton}
      >
        <Text style={styles.addSystemButtonText}>+ Adicionar sistema</Text>
      </Pressable>

      {error && <Text style={styles.generalError}>{error}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Salvar empresa"
        disabled={submitting}
        onPress={submit}
        style={styles.submitButton}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? "Salvando..." : "Salvar empresa"}
        </Text>
      </Pressable>
    </View>
  );
}
