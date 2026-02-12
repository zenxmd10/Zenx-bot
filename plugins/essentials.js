// 1. MENU
global.Module({ pattern: 'menu', desc: 'Show all commands' }, async (message, match, sock) => {
    let menuText = `╭───〔 *${global.BOT_NAME}* 〕───┈⊷\n`;
    menuText += `│ 👤 *User:* @${message.sender}\n│ 🚀 *Commands:* ${global.commands.length}\n╰──────────────────┈⊷\n\n`;
    global.commands.forEach((cmd, i) => { menuText += `*${i+1}.* ${global.PREFIX}${cmd.pattern}\n`; });
    await sock.sendMessage(message.jid, { 
        image: { url: 'https://i.imgur.com/8vD5hD8.jpeg' }, 
        caption: menuText, 
        mentions: [message.sender + '@s.whatsapp.net'] 
    });
});

// 2. ALIVE
global.Module({ pattern: 'alive', desc: 'Check status' }, async (message) => {
    await message.reply('I am alive and working! 🚀');
});

// 3. PING
global.Module({ pattern: 'ping', desc: 'Speed check' }, async (message) => {
    const start = Date.now();
    await message.reply(`*Latency:* ${Date.now() - start}ms`);
});

// 4. JID
global.Module({ pattern: 'jid', desc: 'Get Chat ID' }, async (message) => {
    await message.reply(message.jid);
});

// 5. KICK (Admin Only)
global.Module({ pattern: 'kick', desc: 'Remove user' }, async (message, match, sock) => {
    if (!message.isSudo) return;
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (!user) return message.reply('Aarkkenkilum reply cheyyu!');
    await sock.groupParticipantsUpdate(message.jid, [user], "remove");
    await message.reply('Removed! 🚮');
});

// 6. ADD
global.Module({ pattern: 'add', desc: 'Add user' }, async (message, match, sock) => {
    if (!message.isSudo || !match) return;
    await sock.groupParticipantsUpdate(message.jid, [match + "@s.whatsapp.net"], "add");
});

// 7. PROMOTE
global.Module({ pattern: 'promote', desc: 'Make admin' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (user) await sock.groupParticipantsUpdate(message.jid, [user], "promote");
});

// 8. DEMOTE
global.Module({ pattern: 'demote', desc: 'Remove admin' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (user) await sock.groupParticipantsUpdate(message.jid, [user], "demote");
});

// 9. TAGALL
global.Module({ pattern: 'tagall', desc: 'Tag everyone' }, async (message, match, sock) => {
    const metadata = await sock.groupMetadata(message.jid);
    const users = metadata.participants.map(u => u.id);
    await sock.sendMessage(message.jid, { text: `📢 *Attention Everyone!*\n${match || ''}`, mentions: users });
});

// 10. HIDETAG
global.Module({ pattern: 'htag', desc: 'Silent tag' }, async (message, match, sock) => {
    const metadata = await sock.groupMetadata(message.jid);
    await sock.sendMessage(message.jid, { text: match, mentions: metadata.participants.map(u => u.id) });
});

// 11. GROUP (Open/Close)
global.Module({ pattern: 'group', desc: 'Group settings' }, async (message, match, sock) => {
    if (match === 'open') await sock.groupSettingUpdate(message.jid, 'not_announcement');
    if (match === 'close') await sock.groupSettingUpdate(message.jid, 'announcement');
});

// 12. BLOCK
global.Module({ pattern: 'block', desc: 'Block user' }, async (message, match, sock) => {
    if (!message.isSudo) return;
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (user) await sock.updateBlockStatus(user, "block");
});

// 13. UNBLOCK
global.Module({ pattern: 'unblock', desc: 'Unblock user' }, async (message, match, sock) => {
    if (!message.isSudo) return;
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (user) await sock.updateBlockStatus(user, "unblock");
});

