import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Product, ProductUnit } from "@qqs/contracts";

import { Badge } from "../../shared/ui/components/Badge";
import { ApiError } from "../../shared/http/api-error";
import type { ProductApi } from "./product-api";
import { styles } from "./ProductsScreen.styles";

const UNITS: ProductUnit[] = ["L", "kg"];

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return "Já existe um produto com esse nome.";
  if (error instanceof ApiError && error.status === 400) return "Dados inválidos. Confira os campos.";
  return "Não foi possível salvar. Verifique a conexão.";
}

export function ProductsScreen({ api }: { api: ProductApi }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<ProductUnit>("L");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [toggleError, setToggleError] = useState<string>();

  const load = useCallback(async () => {
    try {
      setProducts(await api.listProducts({ includeInactive: true }));
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  async function create() {
    if (!name.trim()) {
      setFormError("Informe o nome do produto.");
      return;
    }
    setSaving(true);
    setFormError(undefined);
    try {
      await api.createProduct({ name: name.trim(), ...(description.trim() ? { description: description.trim() } : {}), unit });
      setName("");
      setDescription("");
      setUnit("L");
      await load();
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: Product) {
    setToggleError(undefined);
    try {
      const updated = await api.updateProduct(product.id, { active: !product.active });
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
    } catch {
      setToggleError(`Não foi possível alterar ${product.name}. Verifique a conexão.`);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Produtos</Text>

      <View style={styles.form}>
        <TextInput
          accessibilityLabel="Nome do produto"
          placeholder="Ex.: QQS INP"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          accessibilityLabel="Função do produto"
          placeholder="Ex.: Inibidor de corrosão"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />
        <View style={styles.unitRow}>
          {UNITS.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityLabel={`Unidade ${option}`}
              accessibilityState={{ selected: unit === option }}
              onPress={() => setUnit(option)}
              style={[styles.unitOption, unit === option && styles.unitOptionSelected]}
            >
              <Text style={[styles.unitText, unit === option && styles.unitTextSelected]}>
                {option === "L" ? "Litros (L)" : "Quilos (kg)"}
              </Text>
            </Pressable>
          ))}
        </View>
        {formError && <Text style={styles.error}>{formError}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar produto"
          disabled={saving}
          onPress={create}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>{saving ? "Salvando..." : "Cadastrar produto"}</Text>
        </Pressable>
      </View>

      {loadError && <Text style={styles.error}>Não foi possível carregar os produtos.</Text>}
      {toggleError && <Text style={styles.error}>{toggleError}</Text>}

      {products.map((product) => (
        <View key={product.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.name}>{product.name}</Text>
            <Badge label={product.active ? "Ativo" : "Inativo"} variant={product.active ? "success" : "neutral"} />
          </View>
          {product.description && <Text style={styles.muted}>{product.description}</Text>}
          <Text style={styles.muted}>{`Unidade: ${product.unit}`}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${product.active ? "Inativar" : "Reativar"} ${product.name}`}
            onPress={() => toggleActive(product)}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>{product.active ? "Inativar produto" : "Reativar produto"}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
