const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const pino = require('pino');

async function startFaresBot() {
    // 1. إنشاء مجلد الجلسة لو مش موجود
    if (!existsSync('./session_fares')) {
        mkdirSync('./session_fares');
    }

    // 2. فك شفرة الرمز اللي أنت بعته وتحويله لملف creds.json
    try {
        const sessionData = Buffer.from("H4sIAAAAAAAAA5VWyXLbSAz9l74alTTQu6pcNYpsx0u8b3GmfKDIlsyJRFEkZUdJ6d+n0LTjHGYyHulAstkNPADvAfwhqkXZxqO4FoMfom7Kx6yLfNut6ygG4sNqMomNAFFkXSYGf3owCBgUKARHQBrBBkAnwVlATWA9oNRAGEACogZEBZ7AByBlgHQANASkNKB2gAikCBAtBATeqgFD4O0o8X4Dol6NZ2X+G0iowCoIEtAToHHge4SWgMgDO6GQPKC1QHzVHlxIUH06ZSU/I4cggTSBM0CGrUnAQOkgkoGgQfv7DaPKyqasprv1Q5zHJpsdxfVZVjZvSyIiAQYNaDWQAtSYMFMAixAceAXEkJVPCAKD5FvejRAUEBrGzEgJHXgDhFwR7wA1kMGUP6IevKQ35ZHIgpZ9Vbg6SnPu+Ml4QOUAHaYMsFkPpLi+PQhUtg/IOCDpwJqEi5CPk7ZAAYjhcMAaQkhmXcpkW06rWBwUserKbv1mIiITheOVzB4CZDaqABgMYJAJRoJlFARwEjiZzqeLcYDBQWDQCAxZARrmiEsE1YCkU5BpK59yEPzb2GiBpAROJvOYzTHBtQIkz6XUqsdJBlBhWmW2EiHXHY2BYFhkxOXWHkhyYLzidEq/6WNkQQXw6pcknjUvQv76v+hIkg2zd0+9QLiAUjMdE5lsuqD0wC/5kTVL4GWCx/KnRBFSDNikskvZB4k2sRtT3Tk+JPW2VOo+M5oBSUCGwAa9Aa2BmKohCYWUSjzglDEDlUr0S4xM1GBZWODdLGiX2g4zgMiB72ukNRfZvqYz61bN77KW+gOrghWGvREWLTNHBSBUrFSO14a+iKmy2rEfYj4gGNW3SHKgiOuLgQNAliG3JqUScbQFJVlUVj03KcNtggvgnmmKgNZxO2PKcEERA7/1vo+ZMXBKmJYYEq8ZP29kwNhnGCmJwva92XKVvsb1QSEGuAHRxGnZdk3WlYuK15wGkRWPlzFvYpeIJ3bqq7VeXsjZ2dbXW1rhw/nkq3661Fem3qpO98rvuJqMR+9t2+htAaJuFnls21jsl223aNbHsW2zaWzF4M97EFX81vWUZm8KQUzKpu2uq1U9W2TFC99fXmZ5vlhV3eW6ykd8ExsxkK/LsevKatpyRVdV1uQP5WMcPWRdKwaTbNbGnwHGJhbPaz9P86kidlk5a8VAjI7L4+Ui39s9VHe19x8/Dnenw9F0KF69vRDoOS3dTF2s1v7xy8X1dM/q74/VyXk42z8p13uXq5uTk2XcWhyPrw7ofPsfjIiBWLbnO/Xyamt5fprf5MW1u8mbcDNby7++FBeL2SzLvt09LD7vr2Wu9UndZGOTFVfl7dZ4fLk3PjikejxSRX3+oTY7+dWietpFHE232VsRH8s8/uqsu9v/FIdmxx75i0+T6XJHjp5Ob/bvZr68uzxZ3Lwfvl+hxMMRfZJHt+p0vTduj65Hk/GW/EjHu5/zeLs7ng6/dPOHZVxPxvJzXgyftrfFBsQ8aaosxECQRCOlNs4ENaA/2ndPXI6srt9VsRMgqow3i/GCH2b9Ee98cN4ao7XiQ7z8ItjZ8xApE4HYCT9Oypj64LO1/3LaZ4M5JTfwi4nnxvovzcCkucsCwzRsiCcPz2yew9qnrxpu/zyzuHXZvl9IA5bHJKZZYTT3NRa906mXOMdrSdj8ecMK5cGLCMoASnm/2dyDqGdZN1k0czEQ7XycCRDNYsVcP6gmi99+yvGfgFGy0mdZ2w1fNXRVzmPbZfNaDNA5G5SXhCDm62FdX3ZZ9yI9MeTf4fWe2PwNEmulSE0KAAA=", 'base64');
        writeFileSync('./session_fares/creds.json', sessionData);
    } catch (e) {
        console.log("الرمز غير صحيح أو به خطأ");
    }

    const { state, saveCreds } = await useMultiFileAuthState('session_fares');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') console.log('البوت اشتغل فوراً بالهوية الجديدة يا فارس!');
        if (u.connection === 'close') startFaresBot(); // إعادة محاولة لو قفل
    });
}
startFaresBot();
