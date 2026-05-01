const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');

async function startFaresBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_fares');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false,
        logger: require('pino')({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log("-----------------------------------------");
            console.log("افتح الرابط ده عشان تشوف الكود:");
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
            console.log("-----------------------------------------");
        }
        if (connection === 'open') console.log('Connected!');
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        const jid = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

        if (text && !jid.endsWith('@g.us')) {
            try {
                const res = await fetch(`https://aivv.vercel.app/gemini?query=${encodeURIComponent(text)}`);
                const data = await res.json();
                await sock.sendMessage(jid, { text: data.result });
            } catch (e) {
                console.log("Error logic");
            }
        }
    });
}
startFaresBot();
