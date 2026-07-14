const {
    default: makeWASocket,
    useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const LIMITE_ENVIO = 1;

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
const qrcode = require("qrcode-terminal");


const {
    clienteEnviado,
    marcarComoEnviado
} = require("./status");


function formatarNumero(numero) {

    numero = String(numero);

    numero = numero.replace(/\D/g, "");


    if (numero.length === 8) {
        numero = "9" + numero;
    }


    if (numero.length === 10) {
        numero = numero.substring(0,2) + "9" + numero.substring(2);
    }


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



    sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {


        if (qr) {

            console.log("\n📱 Escaneie o QR Code:\n");

            qrcode.generate(qr, { small: true });

        }



        if (connection === "connecting") {

            console.log("🔄 Conectando...");

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

                const numero = formatarNumero(cliente.numero);

                const saudacao =
                    cliente.nome && String(cliente.nome).trim()
                        ? `Olá, ${cliente.nome.trim()}! Tudo bem?`
                        : "Olá! Tudo bem?";

                const mensagens = [
                    [
                        saudacao,
                        "",
                        "Aqui é o Noberto da Refricom.",
                        "Passando para saber como você está e me colocar à disposição caso precise de algum produto ou orçamento.",
                        "",
                        "Estamos à disposição! 😊"
                    ].join("\n"),

                    [
                        saudacao,
                        "",
                        "Aqui é o Noberto da Refricom.",
                        "Faz um tempo que não conversamos e gostaria de saber se vocês estão precisando de algum produto ou orçamento.",
                        "",
                        "Conte conosco sempre que precisar! 😊"
                    ].join("\n"),

                    [
                        saudacao,
                        "",
                        "Aqui é o Noberto da Refricom.",
                        "Estou entrando em contato para reforçar que continuamos à disposição para atender qualquer necessidade em refrigeração ou para fazer um orçamento.",
                        "",
                        "Será um prazer atendê-lo! 😊"
                    ].join("\n"),

                    [
                        saudacao,
                        "",
                        "Aqui é o Noberto da Refricom.",
                        "Espero que esteja tudo bem com vocês. Passando para lembrar que, caso precisem de produtos ou de um orçamento, estamos prontos para ajudar.",
                        "",
                        "Fico no aguardo. Um grande abraço! 😊"
                    ].join("\n")
                ];

                // Escolhe uma mensagem aleatoriamente
                const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];

                if (clienteEnviado(numero)) {


                    console.log("⏭️ Já enviado:", cliente.nome);

                    continue;

                }





                console.log("Enviando para:", cliente.nome, numero);





                await sock.sendMessage(
                    numero + "@s.whatsapp.net",
                    {
                        text: mensagem
                    }
                );

                console.log("✅ Mensagem enviada para:", cliente.nome || "(sem nome)");

                // Continua usando o status.json
                marcarComoEnviado(numero, cliente.nome || "");

                // Atualiza a planilha
                cliente["Data de envio"] = new Date().toLocaleString("pt-BR");

                enviadosNaRodada++;




                await esperar(60, 120);



            }

            const workbook = XLSX.readFile("clientes.xlsx");

            const worksheet = XLSX.utils.json_to_sheet(clientes);

            workbook.Sheets[workbook.SheetNames[0]] = worksheet;

            XLSX.writeFile(workbook, "clientes.xlsx");

            console.log("✅ Finalizado");

        }





        if (connection === "close") {

             const shouldReconnect = true;

            console.log("❌ Conexão fechada");
            console.log(lastDisconnect?.error);

             if (shouldReconnect) {
                console.log("🔄 Reiniciando conexão...");
                 iniciar();
         }

}



    });



}



iniciar().catch(err => {

    console.log("Erro no bot:", err);

});