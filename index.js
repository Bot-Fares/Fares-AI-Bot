const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startFaresBot() {
    // اسم جلسة جديد تماماً لضمان عدم وجود ملفات قديمة مخفية
    const { state, saveCreds } = await useMultiFileAuthState('session_github_test');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = "201500457593"; // رقمك المسجل
        console.log("جاري طلب الكود.. انتظر 15 ثانية...");
        await delay(15000); 
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("\n*****************************************");
            console.log("يا فارس.. كود الربط الخاص بك هو: " + code);
            console.log("*****************************************\n");
        } catch (e) {
            console.log("فشل طلب الكود، جرب إعادة التشغيل بعد دقائق.");
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => { 
        if (u.connection === 'open') console.log('تم الاتصال بنجاح من GitHub!'); 
    });
}
startFaresBot();
