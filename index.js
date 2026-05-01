const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startFaresBot() {
    // استخدام فولدر جديد للجلسة عشان نضمن مفيش تعارض
    const { state, saveCreds } = await useMultiFileAuthState('session_fares_new');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = "201500457593"; 
        // استنى 10 ثواني عشان السيرفر يستقر
        await delay(10000); 
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("=========================================");
            console.log("الكود المطلوب هو: " + code);
            console.log("=========================================");
        } catch (error) {
            console.log("حدث خطأ، تأكد من مسح أي جلسة قديمة");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'open') console.log('تم الربط بنجاح يا بطل!'); 
    });
}
startFaresBot();
