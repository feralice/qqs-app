export type Column<T> = { header: string; value: (row: T) => string | number | boolean | undefined };

// O caso de uso escolhe colunas e valores; o formato do arquivo é detalhe de infraestrutura.
export type TabularExporter = {
  readonly contentType: string;
  readonly extension: string;
  export<T>(rows: T[], columns: Column<T>[]): string;
};
