const XLSX = require("xlsx");

const arquivo = XLSX.readFile("clientes.xlsx");

const primeiraAba = arquivo.Sheets[arquivo.SheetNames[0]];

const clientes = XLSX.utils.sheet_to_json(primeiraAba);

console.log(clientes);