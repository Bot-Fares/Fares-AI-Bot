const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startFaresBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_fares');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }) 
    });

    if (!sock.authState.creds.registered) {
        // تم إضافة رقمك هنا يا فارس
        const phoneNumber = "201500457593"; 
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("=========================================");
                console.log("الكود المطلوب هو: " + code);
                console.log("=========================================");
            } catch (error) {
                console.log("خطأ في طلب الكود، جرب تعمل ريستارت للسيرفر");
            }
        }, 5000);
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'open') console.log('مبروك يا فارس البوت شغال دلوقتي!'); 
    });
}
startFaresBot();
