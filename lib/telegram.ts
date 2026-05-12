const escapeHTML = (str: string) => 
    str.replace(/[&<>]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
    }[tag] || tag));

export const sendRouteToTelegram = async (data: {
    routeName: string;
    driverName: string;
    staffNames: string[];
    type: 'entry' | 'exit';
    overtime_type: 'normal' | 'saturday' | 'sunday';
    time: string;
    shift: 'AM' | 'PM';
  }) => {
    const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  
    const rName = escapeHTML(data.routeName);
    const dName = escapeHTML(data.driverName);
    const staffList = data.staffNames.length > 0 
        ? data.staffNames.map((name, i) => `${i + 1}. 👤 ${escapeHTML(name)}`).join('\n')
        : "No passengers assigned.";
    
    const typeEmoji = data.type === 'entry' ? '📥' : '📤';
    const dayTypeTag = data.overtime_type !== 'normal' 
      ? `⚠️ <b>WEEKEND OT: ${data.overtime_type.toUpperCase()}</b>` 
      : '📅 Standard Weekday';
  
    // High-end formatting using Telegram MarkdownV2 or HTML
    const message = `
      ${typeEmoji} <b>LOGISTICS INTEL: ${data.type.toUpperCase()} ROUTE</b>
──────────────────
      <b>⏰ Schedule:</b> ${data.time} (${data.shift} Shift)
      <b>📆 Status:</b> ${dayTypeTag}
      <b>📍 Pickup:</b> ${rName}
      <b>🚛 Operator:</b> ${dName}
      ──────────────────
      <b>📋 Passenger Manifest:</b>
      ${staffList}
      ──────────────────
      <i>Automated Fleet Broadcast</i>
      `;
  
    try {
      const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Telegram Notification Failed:", error);
      return false;
    }
  };