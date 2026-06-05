"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Download,
  Database,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedContent, setMergedContent] = useState("");
  const [preview, setPreview] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  async function processFiles(selectedFiles: File[]) {
    setFiles(selectedFiles);

    let records: string[] = [];

    for (const file of selectedFiles) {
      const text = await file.text();

      const lines = text
        .split(/\r?\n/)
        .filter(Boolean);

      // Quitar encabezado de cada archivo
      records.push(...lines.slice(1));
    }

    const merged = records.join("\n");

    setMergedContent(merged);
    setPreview(records.slice(0, 100));
  }

  function handleDrop(
    e: React.DragEvent<HTMLDivElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    const droppedFiles = Array.from(
      e.dataTransfer.files
    );

    processFiles(droppedFiles);
  }

  function handleSelectFiles(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    processFiles(selectedFiles);
  }

  function downloadINF() {
    const blob = new Blob(
      [mergedContent],
      { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "UNIFICADO.INF";

    a.click();

    URL.revokeObjectURL(url);
  }

  function exportExcel() {
    if (!mergedContent) return;

    const headers = [
      "OC",
      "DPTO",
      "F.INICIO",
      "F.CANC",
      "TIENDA",
      "CODIGO",
      "SKU",
      "MODELO",
      "COLOR",
      "TALLA",
      "CANTIDAD",
      "COSTO",
    ];

  const rows = mergedContent
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => {
    const cols: any[] = line.split(",");

    // TIENDA (columna 5 visualmente, índice 4)
    if (cols.length > 4 && cols[4]) {
      const partes = cols[4].split("-");
      cols[4] = partes[partes.length - 1];
    }

 // TALLA
    if (cols.length > 9 && cols[9]) {
      const talla = cols[9].trim().toUpperCase();

      switch (talla) {
        case "CH":
          cols[9] = "1 CH";
          break;

        case "M":
          cols[9] = "2 M";
          break;

        case "G":
          cols[9] = "3 G";
          break;

        case "EG":
          cols[9] = "4 EG";
          break;
      }
    }




   // Columnas numéricas
    if (cols[0]) cols[0] = Number(cols[0]); // OC
    if (cols[1]) cols[1] = Number(cols[1]); // DPTO
    if (cols[2]) cols[2] = Number(cols[2]);  // F.INICIO
     if (cols[3]) cols[3] = Number(cols[3]); // F.CANC

      // TIENDA 
      if (cols[4]) {
      const partes = cols[4].split("-");
      cols[4] = Number(partes[partes.length - 1]);
    }

    if (cols[5]) cols[5] = Number(cols[5]); // CODIGO
     if (cols[6]) cols[6] = Number(cols[6]); // SKU
     

    if (cols[10]) cols[10] = Number(cols[10]); // CANTIDAD
    if (cols[11]) cols[11] = Number(cols[11]); // COSTO

    return cols;
  });




    const data = [
      headers,
      ...rows,
    ];

    const worksheet =
      XLSX.utils.aoa_to_sheet(data);



      // Forzar formato numérico
const numericColumns = [
  "A", // OC
  "B", // DPTO
  "C", // F.INICIO
  "D", // F.CANC
  "E", // TIENDA
  "F", // CODIGO
  "G", // SKU
  "K", // CANTIDAD
  "L", // COSTO
];

numericColumns.forEach((col) => {
  for (let row = 2; row <= data.length; row++) {
    const cell = worksheet[`${col}${row}`];

    if (cell) {
      cell.t = "n";
    }
  }
});


    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventario"
    );

    XLSX.writeFile(
      workbook,
      "UNIFICADO.xlsx"
    );
  }

  const totalRecords =
    mergedContent
      .split(/\r?\n/)
      .filter(Boolean).length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">

      <div className="max-w-7xl mx-auto p-8">

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-6xl font-bold">
            Unificador de archivos INF kike

          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Unifica archivos INF y exporta a Excel.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mt-10">

          <div className="lg:col-span-2">

            <div
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={handleDrop}
              className={`
                h-96
                border-2
                border-dashed
                rounded-3xl
                flex
                flex-col
                justify-center
                items-center
                transition-all
                duration-300
                ${
                  dragActive
                    ? "border-blue-500 bg-blue-500/10 scale-105"
                    : "border-slate-700"
                }
              `}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
              >
                <Upload size={90} />
              </motion.div>

              <h2 className="text-3xl font-bold mt-6">
                {dragActive
                  ? "Suelta los archivos aquí"
                  : "Arrastra archivos .INF"}
              </h2>

              <p className="text-slate-400 mt-3">
                o selecciónalos manualmente
              </p>

              <label
                className="
                  mt-6
                  px-6
                  py-3
                  bg-blue-600
                  hover:bg-blue-700
                  rounded-xl
                  cursor-pointer
                  transition
                "
              >
                Seleccionar archivos

                <input
                  type="file"
                  multiple
                  accept=".INF,.inf"
                  className="hidden"
                  onChange={handleSelectFiles}
                />
              </label>

            </div>

          </div>

          <div className="space-y-5">

            <div className="bg-slate-900 rounded-3xl p-6">
              <FileText size={30} />

              <p className="text-slate-400 mt-3">
                Archivos
              </p>

              <h3 className="text-5xl font-bold">
                {files.length}
              </h3>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6">
              <Database size={30} />

              <p className="text-slate-400 mt-3">
                Registros
              </p>

              <h3 className="text-5xl font-bold">
                {totalRecords}
              </h3>
            </div>

          </div>

        </div>

        {files.length > 0 && (

          <div className="mt-10 bg-slate-900 rounded-3xl p-6">

            <h2 className="text-2xl font-bold mb-6">
              Archivos cargados
            </h2>

            <div className="grid md:grid-cols-2 gap-3">

              {files.map((file, index) => (
                <div
                  key={index}
                  className="
                    bg-slate-800
                    rounded-2xl
                    p-4
                    flex
                    items-center
                    gap-3
                  "
                >
                  <FileText />

                  <div>
                    <p className="font-medium">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}

            </div>

            <div className="flex gap-4 mt-8">

              <button
                onClick={downloadINF}
                className="
                  bg-blue-600
                  hover:bg-blue-700
                  px-8
                  py-4
                  rounded-2xl
                  flex
                  items-center
                  gap-3
                "
              >
                <Download size={22} />
                Descargar INF
              </button>

              <button
                onClick={exportExcel}
                className="
                  bg-green-600
                  hover:bg-green-700
                  px-8
                  py-4
                  rounded-2xl
                  flex
                  items-center
                  gap-3
                "
              >
                <FileSpreadsheet size={22} />
                Exportar Excel
              </button>

            </div>

            <div className="mt-10">

              <h2 className="text-2xl font-bold mb-4">
                Vista previa
              </h2>

              <div
                className="
                  bg-slate-950
                  rounded-2xl
                  p-4
                  max-h-96
                  overflow-auto
                  text-sm
                "
              >
                {preview.map((line, index) => (
                  <div
                    key={index}
                    className="
                      border-b
                      border-slate-800
                      py-2
                      break-all
                    "
                  >
                    {line}
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}