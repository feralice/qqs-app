import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { ControlParameter, Product, ProgramProductInput, SystemProgram, UpdateSystemProgramRequest } from "@qqs/contracts";

import { ApiError } from "../../shared/http/api-error";
import { parseDecimal } from "../clients/ClientForm";
import type { ProductApi } from "./product-api";
import { styles } from "./ProgramScreen.styles";

type ParameterDraft = { key: string; name: string; unit: string; min: string; max: string };
type ProductDraft = { productId: string; productName: string; unit: string; dailyDose: string; maintenanceDose: string };
type SystemDraft = {
  systemId: string;
  systemName: string;
  parameters: ParameterDraft[];
  products: ProductDraft[];
  errors: string[];
  saving: boolean;
  saved: boolean;
};

let nextParameterKey = 0;
const newParameterKey = () => `parameter-${nextParameterKey++}`;

const formatNumber = (value?: number) => (value === undefined ? "" : String(value).replace(".", ","));

function toDraft(system: SystemProgram): SystemDraft {
  return {
    systemId: system.systemId,
    systemName: system.systemName,
    parameters: system.parameters.map((parameter) => ({
      key: newParameterKey(),
      name: parameter.name,
      unit: parameter.unit ?? "",
      min: formatNumber(parameter.min),
      max: formatNumber(parameter.max),
    })),
    products: system.products.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      unit: product.unit,
      dailyDose: formatNumber(product.dailyDose),
      maintenanceDose: formatNumber(product.maintenanceDose),
    })),
    errors: [],
    saving: false,
    saved: false,
  };
}

// Mesmas regras do domínio no backend; aqui só para avisar o diretor antes de enviar.
function buildRequest(draft: SystemDraft): { request?: UpdateSystemProgramRequest; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const optional = (text: string) => (text.trim() ? parseDecimal(text) ?? Number.NaN : undefined);

  const parameters = draft.parameters.map((parameter, index): ControlParameter => {
    const name = parameter.name.trim();
    const label = name || `Parâmetro ${index + 1}`;
    const min = optional(parameter.min);
    const max = optional(parameter.max);
    if (!name) errors.push(`${label}: informe o nome`);
    else if (seen.has(name.toLowerCase())) errors.push(`${label}: parâmetro repetido`);
    seen.add(name.toLowerCase());
    if (Number.isNaN(min) || Number.isNaN(max)) errors.push(`${label}: valor inválido`);
    else if (min === undefined && max === undefined) errors.push(`${label}: informe o mínimo ou o máximo`);
    else if (min !== undefined && max !== undefined && min > max) errors.push(`${label}: mínimo maior que o máximo`);
    const unit = parameter.unit.trim();
    return { name, ...(unit ? { unit } : {}), ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}) };
  });

  const products = draft.products.map((product): ProgramProductInput => {
    const dailyDose = optional(product.dailyDose);
    const maintenanceDose = optional(product.maintenanceDose);
    if (dailyDose === undefined) errors.push(`${product.productName}: informe a dosagem diária`);
    else if (!(dailyDose > 0)) errors.push(`${product.productName}: dosagem diária inválida`);
    if (maintenanceDose !== undefined && !(maintenanceDose > 0)) {
      errors.push(`${product.productName}: dosagem de manutenção inválida`);
    }
    return {
      productId: product.productId,
      dailyDose: dailyDose ?? 0,
      ...(maintenanceDose !== undefined ? { maintenanceDose } : {}),
    };
  });

  return errors.length > 0 ? { errors } : { request: { parameters, products }, errors };
}

function serverMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) return "Produto inativo ou inexistente no catálogo.";
  if (error instanceof ApiError && error.status === 409) return "Parâmetro ou produto repetido neste sistema.";
  if (error instanceof ApiError && error.status === 400) return "Dados inválidos. Confira os campos.";
  return "Não foi possível salvar. Verifique a conexão.";
}

export function ProgramScreen({ api, clientId, clientName }: { api: ProductApi; clientId: string; clientName?: string }) {
  const [systems, setSystems] = useState<SystemDraft[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState(false);
  const savingSystems = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getClientProgram(clientId), api.listProducts()])
      .then(([program, products]) => {
        if (cancelled) return;
        setSystems(program.systems.map(toDraft));
        setCatalog(products.filter((product) => product.active));
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [api, clientId]);

  const update = (systemId: string, change: (draft: SystemDraft) => Partial<SystemDraft>) =>
    setSystems((current) =>
      current.map((draft) => (draft.systemId === systemId ? { ...draft, saved: false, ...change(draft) } : draft)),
    );

  const editParameter = (systemId: string, index: number, field: Exclude<keyof ParameterDraft, "key">) => (text: string) =>
    update(systemId, (draft) => ({
      parameters: draft.parameters.map((parameter, i) => (i === index ? { ...parameter, [field]: text } : parameter)),
    }));

  const editProduct = (systemId: string, productId: string, field: "dailyDose" | "maintenanceDose") => (text: string) =>
    update(systemId, (draft) => ({
      products: draft.products.map((product) => (product.productId === productId ? { ...product, [field]: text } : product)),
    }));

  async function save(draft: SystemDraft) {
    const { request, errors } = buildRequest(draft);
    if (!request) {
      update(draft.systemId, () => ({ errors }));
      return;
    }
    if (savingSystems.current.has(draft.systemId)) return;
    savingSystems.current.add(draft.systemId);
    update(draft.systemId, () => ({ errors: [], saving: true }));
    try {
      const saved = await api.saveSystemProgram(clientId, draft.systemId, request);
      update(draft.systemId, () => ({ ...toDraft(saved), saved: true }));
    } catch (error) {
      update(draft.systemId, () => ({ errors: [serverMessage(error)], saving: false }));
    } finally {
      savingSystems.current.delete(draft.systemId);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Programa de tratamento</Text>
      {clientName && <Text style={styles.subtitle}>{clientName}</Text>}
      {loadError && <Text style={styles.error}>Não foi possível carregar o programa.</Text>}
      {!loadError && systems.length === 0 && (
        <Text style={styles.muted}>Cadastre sistemas na empresa para montar o programa.</Text>
      )}

      {systems.map((draft) => {
        const where = `em ${draft.systemName}`;
        const available = catalog.filter((product) => !draft.products.some((entry) => entry.productId === product.id));
        return (
          <View key={draft.systemId} style={styles.systemCard}>
            <Text style={styles.systemName}>{draft.systemName}</Text>

            <Text style={styles.sectionTitle}>Parâmetros e faixa de controle</Text>
            {draft.parameters.map((parameter, index) => {
              const position = `do parâmetro ${index + 1} ${where}`;
              return (
                <View key={parameter.key} style={styles.entry}>
                  <View style={styles.row}>
                    <TextInput
                      accessibilityLabel={`Nome ${position}`}
                      placeholder="Ex.: pH"
                      value={parameter.name}
                      onChangeText={editParameter(draft.systemId, index, "name")}
                      editable={!draft.saving}
                    style={styles.input}
                    />
                    <TextInput
                      accessibilityLabel={`Unidade ${position}`}
                      placeholder="Unidade (ppm)"
                      value={parameter.unit}
                      onChangeText={editParameter(draft.systemId, index, "unit")}
                      editable={!draft.saving}
                    style={styles.input}
                    />
                  </View>
                  <View style={styles.row}>
                    <TextInput
                      accessibilityLabel={`Mínimo ${position}`}
                      placeholder="Mínimo"
                      keyboardType="numeric"
                      value={parameter.min}
                      onChangeText={editParameter(draft.systemId, index, "min")}
                      editable={!draft.saving}
                    style={styles.input}
                    />
                    <TextInput
                      accessibilityLabel={`Máximo ${position}`}
                      placeholder="Máximo"
                      keyboardType="numeric"
                      value={parameter.max}
                      onChangeText={editParameter(draft.systemId, index, "max")}
                      editable={!draft.saving}
                    style={styles.input}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remover parâmetro ${index + 1} ${where}`}
                    onPress={() =>
                      update(draft.systemId, (current) => ({ parameters: current.parameters.filter((_, i) => i !== index) }))
                    }
                    style={styles.linkButton}
                  >
                    <Text style={styles.removeText}>Remover parâmetro</Text>
                  </Pressable>
                </View>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Adicionar parâmetro ${where}`}
              onPress={() =>
                update(draft.systemId, (current) => ({
                  parameters: [...current.parameters, { key: newParameterKey(), name: "", unit: "", min: "", max: "" }],
                }))
              }
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>+ Adicionar parâmetro</Text>
            </Pressable>

            <Text style={styles.sectionTitle}>Produtos e dosagem por dia</Text>
            {draft.products.map((product) => (
              <View key={product.productId} style={styles.entry}>
                <Text style={styles.entryTitle}>{`${product.productName} (${product.unit}/dia)`}</Text>
                <View style={styles.row}>
                  <TextInput
                    accessibilityLabel={`Dosagem diária de ${product.productName} ${where}`}
                    placeholder="Dosagem diária"
                    keyboardType="numeric"
                    value={product.dailyDose}
                    onChangeText={editProduct(draft.systemId, product.productId, "dailyDose")}
                    editable={!draft.saving}
                    style={styles.input}
                  />
                  <TextInput
                    accessibilityLabel={`Dosagem de manutenção de ${product.productName} ${where}`}
                    placeholder="Manutenção"
                    keyboardType="numeric"
                    value={product.maintenanceDose}
                    onChangeText={editProduct(draft.systemId, product.productId, "maintenanceDose")}
                    editable={!draft.saving}
                    style={styles.input}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${product.productName} de ${draft.systemName}`}
                  onPress={() =>
                    update(draft.systemId, (current) => ({
                      products: current.products.filter((entry) => entry.productId !== product.productId),
                    }))
                  }
                  style={styles.linkButton}
                >
                  <Text style={styles.removeText}>Remover produto</Text>
                </Pressable>
              </View>
            ))}
            {available.length > 0 && (
              <View style={styles.row}>
                {available.map((product) => (
                  <Pressable
                    key={product.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Adicionar ${product.name} ${where}`}
                    onPress={() =>
                      update(draft.systemId, (current) => ({
                        products: [
                          ...current.products,
                          { productId: product.id, productName: product.name, unit: product.unit, dailyDose: "", maintenanceDose: "" },
                        ],
                      }))
                    }
                    style={styles.chip}
                  >
                    <Text style={styles.chipText}>{`+ ${product.name}`}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {draft.errors.map((error) => (
              <Text key={error} style={styles.error}>
                {error}
              </Text>
            ))}
            {draft.saved && <Text style={styles.success}>Programa salvo.</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Salvar programa de ${draft.systemName}`}
              disabled={draft.saving}
              onPress={() => save(draft)}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>{draft.saving ? "Salvando..." : "Salvar programa"}</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
