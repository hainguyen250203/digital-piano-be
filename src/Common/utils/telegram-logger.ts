import axios from 'axios';

export interface TelegramOption {
  botToken: string
  chatId: string
}

export async function TelegramLogger({ message, context, stack, timestamp = new Date().toISOString(), telegramOption }: { message: string; context?: any; stack?: any; timestamp?: string; telegramOption: TelegramOption }) {
  try {
    await axios.post(`https://api.telegram.org/bot${telegramOption.botToken}/sendMessage`, {
      chat_id: telegramOption.chatId,
      text: `*🚨 ERROR ALERT!* [${timestamp}]\n\n` + `*Message:* ${message}\n\n` + (stack ? `*Stack Trace:*\n\`\`\`sh\n${stack}\n\`\`\`\n\n` : '') + (context ? `*Context:*\n\`\`\`json\n${JSON.stringify(context, null, 2)}\n\`\`\`` : ''),
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Telegram notification failed:', error.message);
  }
}
