const XLSX = require("xlsx");

function formatarNumero(numero) {

    // pega somente o primeiro número caso tenha "|"
    numero = numero.split("|")[0];

    // remove tudo que não é número
    numero = numero.replace(/\D/g, "");

    // se já começa com 55, mantém
    if (!numero.startsWith("55")) {

        // adiciona Brasil
        numero = "55" + numero;
    }

    return numero;
}


const arquivo = XLSX.readFile("clientes.xlsx");

const aba = arquivo.Sheets[arquivo.SheetNames[0]];

const clientes = XLSX.utils.sheet_to_json(aba);


clientes.forEach(cliente => {

    console.log(
        cliente["Nome da Empresa"],
        "→",
        formatarNumero(cliente.numero)
    );

});