import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram: any;
  }
}

interface Composer {
  id: string;
  name: string;
  years: string;
  shortBio: string;
  mainWorks: string;
  examNotes: string;
}

interface Ticket {
  ticketNumber: number;
  questions: string[];
  fullAnswer1: string;
  fullAnswer2: string;
  audioFragment: string;
}

interface Test {
  id: string;
  composer: string;
  questions: TestQuestion[];
}

interface TestQuestion {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

type Tab = 'main' | 'composers' | 'composerDetail' | 'tickets' | 'ticketDetail' | 'tests' | 'testDetail' | 'audio' | 'progress';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('main');
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [testAnswers, setTestAnswers] = useState<{ [key: number]: number }>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [composers, setComposers] = useState<Composer[]>([]);
  const [tickets, setTickets] = useState<{ doop: Ticket[]; fgt: Ticket[] }>({ doop: [], fgt: [] });
  const [program, setProgram] = useState<'DOOP' | 'FGT' | null>(null);
  const [specialization, setSpecialization] = useState<'instrumentalist' | 'vocalist' | null>(null);

  // Загрузка данных
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    setUser(tg.initDataUnsafe?.user);

    // Загрузка композиторов
    fetch('/data/composers.json')
      .then(res => res.json())
      .then(data => setComposers(data.composers))
      .catch(err => console.error('Ошибка загрузки композиторов:', err));

    // Загрузка билетов
    fetch('/data/tickets.json')
      .then(res => res.json())
      .then(data => setTickets(data))
      .catch(err => console.error('Ошибка загрузки билетов:', err));
  }, []);

  const handleProgramSelect = (selected: 'DOOP' | 'FGT') => {
    setProgram(selected);
  };

  const handleSpecializationSelect = (selected: 'instrumentalist' | 'vocalist') => {
    setSpecialization(selected);
  };

  const filteredComposers = composers.filter(c => 
    program ? c.programs.includes(program) : true
  );

  const filteredTickets = program === 'DOOP' ? tickets.doop : tickets.fgt;

  const handleTestAnswer = (questionIndex: number, answerIndex: number) => {
    setTestAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleTestSubmit = () => {
    setTestSubmitted(true);
  };

  const calculateTestScore = () => {
    if (!selectedTest) return 0;
    let correct = 0;
    selectedTest.questions.forEach((q, idx) => {
      if (testAnswers[idx] === q.correct) correct++;
    });
    return correct;
  };

  // Главный экран выбора программы
  if (!program) {
    return (
      <div className="app">
        <div className="header">
          <h1>🎵 Музлит-репетитор</h1>
          <p className="subtitle">Подготовка к экзамену по русской музыкальной литературе</p>
        </div>
        <div className="content">
          <div className="card program-card" onClick={() => handleProgramSelect('FGT')}>
            <div className="program-icon">🎓</div>
            <h3>ФГТ / ДПОП</h3>
            <p>Предпрофессиональная программа</p>
            <p className="program-desc">5 лет обучения, углублённо, экзамен + реферат</p>
          </div>
          <div className="card program-card" onClick={() => handleProgramSelect('DOOP')}>
            <div className="program-icon">🎨</div>
            <h3>ДООП / ОРП</h3>
            <p>Общеразвивающая программа</p>
            <p className="program-desc">4 года обучения, обзорно, экзамен</p>
          </div>
        </div>
        <div className="footer">
          <p>ДШИ «Лицей искусств» им. В.Н. Сафонова, Тольятти</p>
        </div>
      </div>
    );
  }

  // Главное меню
  if (currentTab === 'main') {
    return (
      <div className="app">
        <div className="header">
          <h1>🎵 Музлит-репетитор</h1>
          <p className="subtitle">{program === 'FGT' ? 'Предпрофессиональная программа' : 'Общеразвивающая программа'}</p>
        </div>
        <div className="content">
          <div className="menu-grid">
            <div className="menu-card" onClick={() => setCurrentTab('composers')}>
              <div className="menu-icon">📚</div>
              <h3>Композиторы</h3>
              <p>29 композиторов с биографиями и разборами</p>
            </div>
            <div className="menu-card" onClick={() => setCurrentTab('tickets')}>
              <div className="menu-icon">📝</div>
              <h3>Экзаменационные билеты</h3>
              <p>{program === 'DOOP' ? '10' : '15'} билетов с полными ответами</p>
            </div>
            <div className="menu-card" onClick={() => setCurrentTab('tests')}>
              <div className="menu-icon">✍️</div>
              <h3>Тесты</h3>
              <p>Проверьте свои знания</p>
            </div>
            <div className="menu-card" onClick={() => setCurrentTab('audio')}>
              <div className="menu-icon">🎧</div>
              <h3>Аудиовикторина</h3>
              <p>Тренируйте музыкальный слух</p>
            </div>
            <div className="menu-card" onClick={() => setCurrentTab('progress')}>
              <div className="menu-icon">📊</div>
              <h3>Мой прогресс</h3>
              <p>Отслеживайте успехи</p>
            </div>
          </div>
          <button className="btn-back" onClick={() => { setProgram(null); setSpecialization(null); }}>
            ← Изменить программу
          </button>
        </div>
      </div>
    );
  }

  // Список композиторов
  if (currentTab === 'composers') {
    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('main')}>←</button>
          <h1>Композиторы</h1>
        </div>
        <div className="content">
          {filteredComposers.map(composer => (
            <div key={composer.id} className="composer-card" onClick={() => {
              setSelectedComposer(composer);
              setCurrentTab('composerDetail');
            }}>
              <h3>{composer.name}</h3>
              <p className="composer-years">{composer.years}</p>
              <p className="composer-bio-preview">{composer.shortBio.substring(0, 100)}...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Детальная карточка композитора
  if (currentTab === 'composerDetail' && selectedComposer) {
    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('composers')}>←</button>
          <h1>{selectedComposer.name}</h1>
        </div>
        <div className="content">
          <div className="composer-detail">
            <p className="composer-years-full">{selectedComposer.years}</p>
            <div className="composer-section">
              <h3>📖 Биография</h3>
              <p>{selectedComposer.shortBio}</p>
            </div>
            <div className="composer-section">
              <h3>🎵 Главные произведения</h3>
              <p>{selectedComposer.mainWorks}</p>
            </div>
            <div className="composer-section">
              <h3>🎓 Что нужно знать на экзамене</h3>
              <p>{selectedComposer.examNotes}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Список билетов
  if (currentTab === 'tickets') {
    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('main')}>←</button>
          <h1>Экзаменационные билеты</h1>
        </div>
        <div className="content">
          {filteredTickets.map(ticket => (
            <div key={ticket.ticketNumber} className="ticket-card" onClick={() => {
              setSelectedTicket(ticket);
              setCurrentTab('ticketDetail');
            }}>
              <h3>Билет №{ticket.ticketNumber}</h3>
              <p className="ticket-question-preview">{ticket.questions[0].substring(0, 80)}...</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Детальный билет с ответами
  if (currentTab === 'ticketDetail' && selectedTicket) {
    const [showAnswer1, setShowAnswer1] = useState(false);
    const [showAnswer2, setShowAnswer2] = useState(false);

    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('tickets')}>←</button>
          <h1>Билет №{selectedTicket.ticketNumber}</h1>
        </div>
        <div className="content">
          <div className="ticket-detail">
            <div className="question-block">
              <h3>Вопрос 1</h3>
              <p>{selectedTicket.questions[0]}</p>
              <button className="btn-answer" onClick={() => setShowAnswer1(!showAnswer1)}>
                {showAnswer1 ? 'Скрыть ответ' : 'Показать ответ'}
              </button>
              {showAnswer1 && (
                <div className="answer-block">
                  <p>{selectedTicket.fullAnswer1}</p>
                </div>
              )}
            </div>
            <div className="question-block">
              <h3>Вопрос 2</h3>
              <p>{selectedTicket.questions[1]}</p>
              <button className="btn-answer" onClick={() => setShowAnswer2(!showAnswer2)}>
                {showAnswer2 ? 'Скрыть ответ' : 'Показать ответ'}
              </button>
              {showAnswer2 && (
                <div className="answer-block">
                  <p>{selectedTicket.fullAnswer2}</p>
                </div>
              )}
            </div>
            <div className="audio-block">
              <h3>🎧 Аудиовикторина</h3>
              <p>Фрагмент: {selectedTicket.audioFragment}</p>
              <p className="audio-note">Аудиофайлы будут добавлены позже</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Список тестов
  if (currentTab === 'tests') {
    // Заглушка тестов (позже загрузим из JSON)
    const testsList = [
      { id: 'glinka_test', composer: 'М.И. Глинка' },
      { id: 'tchaikovsky_test', composer: 'П.И. Чайковский' },
      { id: 'musorgsky_test', composer: 'М.П. Мусоргский' },
      { id: 'borodin_test', composer: 'А.П. Бородин' },
      { id: 'rimsky_korsakov_test', composer: 'Н.А. Римский-Корсаков' },
      { id: 'rachmaninov_test', composer: 'С.В. Рахманинов' },
      { id: 'prokofiev_test', composer: 'С.С. Прокофьев' },
      { id: 'shostakovich_test', composer: 'Д.Д. Шостакович' },
    ];

    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('main')}>←</button>
          <h1>Тесты</h1>
        </div>
        <div className="content">
          {testsList.map(test => (
            <div key={test.id} className="test-card">
              <h3>{test.composer}</h3>
              <button className="btn-start" onClick={() => {
                // Загрузка теста из JSON и переход
                fetch(`/data/tests.json`)
                  .then(res => res.json())
                  .then(data => {
                    const found = data.tests.find((t: any) => t.id === test.id);
                    if (found) {
                      setSelectedTest(found);
                      setTestAnswers({});
                      setTestSubmitted(false);
                      setCurrentTab('testDetail');
                    }
                  });
              }}>Пройти тест →</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Детальный тест
  if (currentTab === 'testDetail' && selectedTest) {
    const score = calculateTestScore();
    const total = selectedTest.questions.length;

    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('tests')}>←</button>
          <h1>Тест: {selectedTest.composer}</h1>
        </div>
        <div className="content">
          {!testSubmitted ? (
            <>
              {selectedTest.questions.map((q, idx) => (
                <div key={idx} className="test-question">
                  <p className="question-text">{idx + 1}. {q.text}</p>
                  <div className="options">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className="option">
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={optIdx}
                          onChange={() => handleTestAnswer(idx, optIdx)}
                          checked={testAnswers[idx] === optIdx}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn-submit" onClick={handleTestSubmit}>Проверить ответы</button>
            </>
          ) : (
            <>
              <div className="result-score">
                <h2>Результат: {score} из {total}</h2>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(score / total) * 100}%` }}></div>
                </div>
              </div>
              {selectedTest.questions.map((q, idx) => {
                const isCorrect = testAnswers[idx] === q.correct;
                return (
                  <div key={idx} className={`test-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <p><strong>{idx + 1}. {q.text}</strong></p>
                    <p>Ваш ответ: {q.options[testAnswers[idx] ?? 0]}</p>
                    {!isCorrect && <p>Правильный ответ: {q.options[q.correct]}</p>}
                    <p className="explanation">{q.explanation}</p>
                  </div>
                );
              })}
              <button className="btn-retry" onClick={() => {
                setTestAnswers({});
                setTestSubmitted(false);
              }}>Пройти заново</button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Заглушка для аудиовикторины
  if (currentTab === 'audio') {
    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('main')}>←</button>
          <h1>Аудиовикторина</h1>
        </div>
        <div className="content">
          <div className="coming-soon">
            <div className="emoji-big">🎧</div>
            <h2>Скоро</h2>
            <p>Аудиовикторина с фрагментами произведений будет добавлена в следующем обновлении.</p>
            <p>Пока вы можете изучать экзаменационные билеты и проходить тесты!</p>
          </div>
        </div>
      </div>
    );
  }

  // Заглушка для прогресса
  if (currentTab === 'progress') {
    return (
      <div className="app">
        <div className="header">
          <button className="btn-icon" onClick={() => setCurrentTab('main')}>←</button>
          <h1>Мой прогресс</h1>
        </div>
        <div className="content">
          <div className="coming-soon">
            <div className="emoji-big">📊</div>
            <h2>Статистика появится позже</h2>
            <p>Здесь будет отображаться ваш прогресс: пройденные тесты, изученные билеты и композиторы.</p>
            <p>Продолжайте заниматься — всё запоминается!</p>
          </div>
        </div>
      </div>
    );
  }

  return <div className="app">Загрузка...</div>;
}

export default App;