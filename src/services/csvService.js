// src/services/csvService.js
import Papa from "papaparse";

export async function fetchLeadsFromCsv() {
  const response = await fetch("/hasil_prediksi_test_sorted.csv");
  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,        // baris pertama: nama kolom
    dynamicTyping: true, // angka jadi number
    skipEmptyLines: true,
  });

  let data = results.data;

  // urutkan dari probability tertinggi ke terendah
  data = data.sort((a, b) => (b.probability || 0) - (a.probability || 0));

  return data;
}
