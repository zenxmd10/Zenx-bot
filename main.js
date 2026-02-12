const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    delay 
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

// --- SETTINGS ---
global.BOT_NAME = 'ZENX-V1';
global.PREFIX = '.'; 
const PAIRING_NUMBER = '916235508514'; // Ivide ningalude number (with country code)
const SUDO = ['916235141427']; // Ivide admin number
const MODE = 'public'; 

global.commands = []; 
global.Module = (info, func) => {
    global.commands.push({ ...info, function: func });
};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        let phoneNumber = PAIRING_NUMBER.replace(/[^0-9]/g, '');
        await delay(5000);
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n⭐ YOUR PAIRING CODE: \x1b[32m${code}\x1b[0m\n`);
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log(`✅ ${global.BOT_NAME} Online!`);
            for (const num of SUDO) {
                await sock.sendMessage(num + '@s.whatsapp.net', { text: `*BOT_START* 🚀` });
            }
        } else if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot();
        }
    });

    // Plugin Loader
    const pluginsPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath);
    fs.readdirSync(pluginsPath).forEach(file => {
        if (file.endsWith('.js')) require(path.join(pluginsPath, file));
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        const jid = msg.key.remoteJid;
        const sender = (msg.key.participant || jid).replace(/[^0-9]/g, '');
        const isSudo = SUDO.some(num => num.replace(/[^0-9]/g, '') === sender) || msg.key.fromMe;
        if (MODE === 'private' && !isSudo) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (!text.startsWith(global.PREFIX)) return;

        const cmdName = text.slice(global.PREFIX.length).trim().split(' ')[0].toLowerCase();
        const match = text.slice((global.PREFIX + cmdName).length).trim();

        for (const cmd of global.commands) {
            if (cmd.pattern === cmdName) {
                const message = {
                    jid, isSudo, sender,
                    reply: async (t) => sock.sendMessage(jid, { text: t }),
                    original: msg
                };
                await cmd.function(message, match, sock);
            }
        }
    });
}
startBot();

