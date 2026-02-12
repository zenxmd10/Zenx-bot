// 1. MENU
global.Module({ pattern: 'menu', desc: 'Bot Commands' }, async (message, match, sock) => {
    let menuText = `╭───〔 *${global.BOT_NAME}* 〕───┈⊷\n│ 👤 *User:* @${message.sender}\n│ 🚀 *Prefix:* ${global.PREFIX}\n╰──────────────────┈⊷\n\n`;
    global.commands.forEach((cmd, i) => { menuText += `*${i+1}.* ${global.PREFIX}${cmd.pattern}\n`; });
    await sock.sendMessage(message.jid, { 
        image: { url: 'https://i.ibb.co/Q3hT22VK/temp.jpg' }, 
        caption: menuText, 
        mentions: [message.sender + '@s.whatsapp.net'] 
    });
});

// Other Essential Commands
global.Module({ pattern: 'alive', desc: 'Status' }, async (message) => message.reply('Online! 🚀'));
global.Module({ pattern: 'ping', desc: 'Speed' }, async (message) => message.reply(`Speed: ${Date.now() - message.original.messageTimestamp * 1000}ms`));
global.Module({ pattern: 'jid', desc: 'ID' }, async (message) => message.reply(message.jid));

// Group Commands
global.Module({ pattern: 'kick', desc: 'Remove' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (message.isSudo && user) await sock.groupParticipantsUpdate(message.jid, [user], "remove");
});
global.Module({ pattern: 'add', desc: 'Add' }, async (message, match, sock) => {
    if (message.isSudo && match) await sock.groupParticipantsUpdate(message.jid, [match + "@s.whatsapp.net"], "add");
});
global.Module({ pattern: 'promote', desc: 'Admin' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (message.isSudo && user) await sock.groupParticipantsUpdate(message.jid, [user], "promote");
});
global.Module({ pattern: 'demote', desc: 'Unadmin' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (message.isSudo && user) await sock.groupParticipantsUpdate(message.jid, [user], "demote");
});
global.Module({ pattern: 'tagall', desc: 'Tag' }, async (message, match, sock) => {
    const meta = await sock.groupMetadata(message.jid);
    await sock.sendMessage(message.jid, { text: `📢 *TagAll*\n${match || ''}`, mentions: meta.participants.map(u => u.id) });
});
global.Module({ pattern: 'htag', desc: 'HideTag' }, async (message, match, sock) => {
    const meta = await sock.groupMetadata(message.jid);
    await sock.sendMessage(message.jid, { text: match, mentions: meta.participants.map(u => u.id) });
});
global.Module({ pattern: 'group', desc: 'Settings' }, async (message, match, sock) => {
    if (!message.isSudo) return;
    await sock.groupSettingUpdate(message.jid, match === 'open' ? 'not_announcement' : 'announcement');
});
global.Module({ pattern: 'block', desc: 'Block' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (message.isSudo && user) await sock.updateBlockStatus(user, "block");
});
global.Module({ pattern: 'unblock', desc: 'Unblock' }, async (message, match, sock) => {
    const user = message.original.message.extendedTextMessage?.contextInfo?.participant;
    if (message.isSudo && user) await sock.updateBlockStatus(user, "unblock");
});
