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
            // المرة دي هنطبع الرابط ده في اللوجز
            console.log("-----------------------------------------");
            console.log("افتح الرابط ده من التاب عشان تشوف الـ QR:");
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
            console.log("-----------------------------------------");
        }
        if (connection === 'open') console.log('Connected!');
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        try {
            const res = await fetch(`https://aivv.vercel.app/gemini?query=${encodeURIComponent(m.message.conversation || "")}`);
            const data = await res.json();
            await sock.sendMessage(m.key.remoteJid, { text: data.result });
        } catch (e) {}
    });
}
startFaresBot();
