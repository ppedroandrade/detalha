import type { AppData } from "./types";

export async function exportToExcel(data: AppData) {
  const XLSX = await import("xlsx");

  const rows = data.items.map((item) => ({
    Ambiente:
      data.environments.find((environment) => environment.id === item.environmentId)
        ?.name ?? "",
    "Nome do item": item.name,
    Categoria: item.category,
    Marca: item.brand,
    Modelo: item.model,
    Código: item.productCode,
    Quantidade: item.quantity,
    Medidas: item.dimensions,
    Voltagem: item.voltage,
    Acabamento: item.finish,
    "Link do produto": item.productUrl,
    "Link do manual": item.manualUrl,
    Status: item.status,
    Observações: item.notes,
    "Pendência para marcenaria": item.carpentryPending,
    "Ponto elétrico": item.needsElectrical ? "Sim" : "Não",
    "Ponto hidráulico": item.needsPlumbing ? "Sim" : "Não",
    "Nicho/recorte": item.needsCutout ? "Sim" : "Não",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 10 }, { wch: 22 }, { wch: 12 }, { wch: 22 },
    { wch: 34 }, { wch: 34 }, { wch: 14 }, { wch: 38 }, { wch: 38 },
    { wch: 16 }, { wch: 18 }, { wch: 16 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Itens");
  XLSX.writeFile(workbook, `itens-apartamento-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
