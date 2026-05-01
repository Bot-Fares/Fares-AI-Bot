const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');
const qrcode = require('qrcode-terminal');

async function startFaresBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_fares');
    const sock = makeWASocket({ 
        auth: state, 
        printQRInTerminal: false, // لغينا القديمة وهنطبعها يدوي
        logger: require('pino')({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    // الطريقة الجديدة والمضمونة لإظهار الـ QR
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("--- امسح الكود ده دلوقتي يا فارس ---");
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startFaresBot();
        } else if (connection === 'open') {
            console.log('البوت اشتغل بنجاح يا بطل! (Connected)');
        }
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
                console.log("Gemini Error");
            }
        }
    });
}

startFaresBot();
