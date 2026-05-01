const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startFaresBot() {
    // غيرنا الاسم لـ "session_v3" عشان نهرب من أي ملفات قديمة
    const { state, saveCreds } = await useMultiFileAuthState('session_v3');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = "201500457593"; // رقمك يا فارس
        await delay(15000); // زودنا الوقت لـ 15 ثانية عشان السيرفر يلحق يقوم
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("=========================================");
            console.log("الكود الفريش هو: " + code);
            console.log("=========================================");
        } catch (error) {
            console.log("لو ظهر خطأ هنا.. يبقى الواتساب محظور مؤقتاً، استنى 5 دقائق وجرب Redeploy");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'open') console.log('مبروك يا فارس.. البوت أخيراً أونلاين!'); 
    });
}
startFaresBot();
