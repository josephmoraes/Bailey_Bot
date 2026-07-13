const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const LIMITE_ENVIO = 10; // quantidade máxima por execução

function esperar(min, max) {

    const tempo = Math.floor(
        Math.random() * (max - min + 1) + min
    );

    console.log(`⏳ Aguardando ${tempo} segundos...`);

    return new Promise(resolve =>
        setTimeout(resolve, tempo * 1000)
    );
}

const P = require("pino");
const XLSX = require("xlsx");

const {
    clienteEnviado,
    marcarComoEnviado
} = require("./status");

function formatarNumero(numero) {

    numero = String(numero);

    numero = numero.replace(/\D/g, "");

    // adiciona DDD e 9 se necessário
    if (numero.length === 8) {
        numero = "9" + numero;
    }

    // se tiver DDD + número (10 dígitos)
    if (numero.length === 10) {
        numero = numero.substring(0,2) + "9" + numero.substring(2);
    }

    // adiciona Brasil
    if (!numero.startsWith("55")) {
        numero = "55" + numero;
    }

    return numero;
}


function carregarClientes() {

    const arquivo = XLSX.readFile("clientes.xlsx");

    const aba = arquivo.Sheets[arquivo.SheetNames[0]];

    return XLSX.utils.sheet_to_json(aba);
}


async function iniciar() {

    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });


    sock.ev.on("creds.update", saveCreds);


    sock.ev.on("connection.update", async ({ connection, qr }) => {

        if (qr) {
            console.log("Escaneie o QR Code novamente");
        }


        if (connection === "open") {

            console.log("✅ WhatsApp conectado");


            const clientes = carregarClientes();


            let enviadosNaRodada = 0;


            for (const cliente of clientes) {

                 if (enviadosNaRodada >= LIMITE_ENVIO) {

                    console.log("🚫 Limite de envio atingido.");
                     break;

                }

`Olá, ${cliente.nome}! Tudo bem?

Aqui é da Refricom. Passando para saber como você está e me colocar à disposição caso precise de algum produto ou orçamento.

Estamos à disposição! 😊`;


                if (clienteEnviado(numero)) {

                    console.log("⏭️ Já enviado:", cliente.nome);
                    continue;

                }


                console.log("Enviando para:", cliente.nome, numero);


                const resultado = await sock.sendMessage(
                    numero + "@s.whatsapp.net",
                    {
                      text: mensagem
                    }
                );


                console.log("✅ Mensagem enviada para:", cliente.nome);


                // salva no histórico
                marcarComoEnviado(numero, cliente.nome);

                enviadosNaRodada++;

                await esperar(15, 40);

                // pausa de 5 segundos
                await new Promise(resolve =>
                    setTimeout(resolve, 5000)
                );
            }


            console.log("✅ Finalizado");
        }

    });
}


iniciar();