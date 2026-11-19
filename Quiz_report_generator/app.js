// Готовая защитная механика. Не изменяйте эту функцию.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function selectAttempts(filter) {
  // TODO: верните все попытки, прошедшие или не прошедшие порог.
  // selectAttempts(filter) читает window.reportData.attempts: для all возвращает весь массив, 
  // для passed – попытки с passed: true, для failed – с passed: false;
  const attempts = window.reportData.attempts; // Достаем список всех участников

  if (filter === 'all') {
    return attempts; // отдаем весь список
  }
  
  if (filter === 'passed') {
    // Если выбрали Сдавших, оставляем тех, у кого passed = true
    return attempts.filter(участник => участник.passed === true);
  }
  
  if (filter === 'failed') {
    // Если выбрали Не сдавших, оставляем тех, у кого passed = false
    return attempts.filter(участник => участник.passed === false);
  }
  
  return []; // Если пришел какой-то непонятный фильтр, возвращаем пустой список
}

function renderAttempts(attempts) {
  // TODO: соберите строки списка через forEach и строковый аккумулятор.
  // Перед вставкой имени вызовите готовую escapeHtml().
  // renderAttempts(attempts) собирает HTML-строку через forEach() и строковый аккумулятор 
  // (переменную, в которой через += постепенно собирается HTML всех попыток), пропускает имя через escapeHtml() 
  // и заменяет #result-list через innerHTML. Содержимое #result-count можно менять через textContent или innerHTML; join() не нужен;
  let html = ''; // Создаем пустую строку
  // Проходимся по каждому участнику в списке
  attempts.forEach((attempt) => {
    // Добавляем к строке HTML для одной строчки
    html += `<li class="result-item"><span class="result-name">${escapeHtml(attempt.name)}</span> — ${attempt.score} из ${attempt.questionCount} (${attempt.percentage}%)</li>`;
  });

  // Находим список и вставляем туда наши строчки
  document.querySelector('#result-list').innerHTML = html;

  // Находим счетчик и пишем, сколько показано из скольки
  const totalAttempts = window.reportData.attempts.length;
  document.querySelector('#result-count').textContent = 
    `Показано: ${attempts.length} из ${totalAttempts}`;
}

function startFilter() {
  // TODO: найдите форму, select, счётчик и список через querySelector().
  // TODO: подпишитесь на submit через addEventListener().
  // В обработчике вызовите preventDefault(), прочитайте value,
  // выберите попытки и замените innerHTML счётчика и списка.
  // startFilter() находит форму, select, #result-count и #result-list через querySelector(),
  //  подписывается на submit, вызывает preventDefault(), читает value и запускает две свои функции. 
  // Результат заменяется без перезагрузки.
  // Находим элементы на странице
  const form = document.querySelector('#filter-form');
  const select = document.querySelector('#filter');

  // Ловим момент отправки формы
  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Останавливаем перезагрузку страницы

    const selectedValue = select.value; // Узнаем что выбрал пользователь (all, passed, failed)

    // Получаем нужных участников
    const filteredAttempts = selectAttempts(selectedValue);

    // возвращаем их 
    renderAttempts(filteredAttempts);
  });

startFilter() // Запускаем функцию (она уже есть в вашем файле)
}

startFilter()
