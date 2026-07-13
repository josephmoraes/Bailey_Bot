const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

async function iniciar() {

    const { state, saveCreds } = await useMultiFileAuthState("auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });

    sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {

        if (qr) {
            console.log("\nEscaneie o QR Code:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
             console.log("\n✅ WhatsApp conectado com sucesso!");

            const numero = "5582999941061"; // coloque aqui o número de teste

            await sock.sendMessage(
                numero + "@s.whatsapp.net",
                 {
                 text: "Olá! Essa é uma mensagem de teste do meu bot 🤖"
                }
             );

            console.log("Mensagem enviada!");
        }
        if (connection === "close") {

            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            console.log("\n❌ Conexão fechada.");

            if (shouldReconnect) {
                iniciar();
            }
        }

    });

    sock.ev.on("creds.update", saveCreds);
}

iniciar();