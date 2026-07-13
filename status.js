const fs = require("fs");

const arquivo = "status.json";


function carregarStatus() {

    if (!fs.existsSync(arquivo)) {
        return {};
    }

    return JSON.parse(
        fs.readFileSync(arquivo, "utf8")
    );
}


function salvarStatus(status) {

    fs.writeFileSync(
        arquivo,
        JSON.stringify(status, null, 2)
    );

}


function clienteEnviado(numero) {

    const status = carregarStatus();

    return status[numero]?.enviado === true;

}


function marcarComoEnviado(numero, nome) {

    const status = carregarStatus();

    status[numero] = {
        nome: nome,
        enviado: true,
        data: new Date().toLocaleString("pt-BR")
    };

    salvarStatus(status);
}


module.exports = {
    carregarStatus,
    salvarStatus,
    clienteEnviado,
    marcarComoEnviado
};