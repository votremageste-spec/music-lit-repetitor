const { Telegraf, Markup } = require('telegraf');

// Токен бота из переменных окружения
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// URL Mini App (будет после деплоя на Vercel)
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-vercel-app.vercel.app';

if (!BOT_TOKEN) {
  console.error('Ошибка: TELEGRAM_BOT_TOKEN не задан!');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Команда /start
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || 'друг';
  
  await ctx.replyWithHTML(
    `🎵 <b>Добро пожаловать в репетитор по музыкальной литературе, ${userName}!</b>\n\n` +
    `Я помогу вам подготовиться к выпускному экзамену по русской музыкальной литературе в ДМШ/ДШИ.\n\n` +
    `📚 Что вас ждёт:\n` +
    `• 29 композиторов с биографиями и разборами произведений\n` +
    `• 25 экзаменационных билетов с полными ответами\n` +
    `• Тесты для самопроверки\n` +
    `• Аудиовикторина для тренировки слуха\n` +
    `• ИИ-ассистент для ответов на вопросы\n\n` +
    `👇 <b>Нажмите на кнопку ниже, чтобы открыть приложение</b>`,
    {
      reply_markup: {
        inline_keyboard: [
          [ { text: '🚀 ОТКРЫТЬ РЕПЕТИТОРА', web_app: { url: MINI_APP_URL } } ],
          [ { text: '❓ Помощь', callback_data: 'help' } ]
        ]
      }
    }
  );
});

// Обработчик кнопки "Помощь"
bot.action('help', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithHTML(
    `<b>📖 Как пользоваться репетитором</b>\n\n` +
    `1️⃣ Выберите программу обучения (ФГТ или ДООП)\n` +
    `2️⃣ Выберите вашу специализацию\n` +
    `3️⃣ Изучайте композиторов и экзаменационные билеты\n` +
    `4️⃣ Проходите тесты для самопроверки\n` +
    `5️⃣ Тренируйте слух с аудиовикториной\n\n` +
    `Если у вас есть вопрос по музыкальной литературе, напишите его в чат — я отвечу!\n\n` +
    `🍀 Удачи на экзамене!`,
    {
      reply_markup: {
        inline_keyboard: [
          [ { text: '🎵 Открыть приложение', web_app: { url: MINI_APP_URL } } ]
        ]
      }
    }
  );
});

// Обработка текстовых сообщений (ИИ-ассистент через Groq)
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  // Игнорируем команды
  if (userMessage.startsWith('/')) return;
  
  // Отправляем индикатор набора текста
  await ctx.sendChatAction('typing');
  
  try {
    // Здесь будет запрос к Groq API
    // Пока используем простой ответ-заглушку
    // После подключения GROQ_API_KEY раскомментируйте код ниже
    
    /*
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'Ты — эксперт по русской музыкальной литературе для ДМШ и ДШИ. Отвечай кратко, ясно, по делу. Если вопрос не по теме, вежливо скажи, что отвечаешь только на вопросы по музыкальной литературе.' },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const answer = response.data.choices[0].message.content;
    await ctx.reply(answer);
    */
    
    // Временный ответ (убрать после подключения Groq)
    await ctx.reply(
      `📚 *Вопрос:* ${userMessage}\n\n` +
      `🤖 *Ответ:* Я пока учусь отвечать на вопросы. Скоро эта функция заработает в полную силу!\n\n` +
      `А пока рекомендую изучить экзаменационные билеты в приложении.`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Ошибка при обращении к Groq:', error);
    await ctx.reply('😔 Извините, произошла ошибка. Попробуйте задать вопрос позже.');
  }
});

// Команда /help
bot.help(async (ctx) => {
  await ctx.reply(
    `🎵 *Команды бота:*\n\n` +
    `/start — начать работу\n` +
    `/help — показать это сообщение\n` +
    `/about — о проекте\n\n` +
    `📱 Нажмите на кнопку \"Открыть репетитора\" и начните подготовку к экзамену!`,
    { parse_mode: 'Markdown' }
  );
});

// Команда /about
bot.command('about', async (ctx) => {
  await ctx.reply(
    `🎓 *О проекте*\n\n` +
    `Этот репетитор создан для подготовки к выпускному экзамену по русской музыкальной литературе в ДМШ и ДШИ.\n\n` +
    `Программы: ФГТ (предпрофессиональная) и ДООП (общеразвивающая).\n\n` +
    `Материалы составлены на основе программы ДШИ «Лицей искусств» им. В.Н. Сафонова (Тольятти).\n\n` +
    `🍀 Успешной подготовки!`,
    { parse_mode: 'Markdown' }
  );
});

// Запуск бота
bot.launch()
  .then(() => {
    console.log('✅ Бот успешно запущен!');
    console.log(`📱 Mini App URL: ${MINI_APP_URL}`);
  })
  .catch((err) => {
    console.error('❌ Ошибка при запуске бота:', err);
  });

// Обработка остановки
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
