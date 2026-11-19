import { readFile, unlink, writeFile } from 'node:fs/promises'

// TODO после занятия про npm и модули: добавьте в package.json поле "type": "module",
// затем добавьте импорт: import { calculateReport, validateQuizData } from './stats.js'

import { calculateReport, validateQuizData } from './stats.js'

const outputPath = './report.html'

// Готовая защитная механика. Не изменяйте эту функцию.
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

// Готовая защитная механика. Не изменяйте эту функцию.
function serializeForScript(value) {
  return JSON.stringify(value)
    .replaceAll('&', '\\u0026')
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

function createAttemptMarkup(attempt) {
  const status = attempt.passed ? 'Порог пройден' : 'Порог не пройден'

  return `
          <li class="result-item">
            <span class="result-name">${escapeHtml(attempt.name)}</span>
            <span>${attempt.score} из ${attempt.questionCount} (${attempt.percentage}%) — ${status}</span>
          </li>`
}

// Каркас отчёта готов: он не оценивается и не требует новых браузерных API.
function createReportHtml(report) {
  const attemptsForBrowser = []
  let attemptsMarkup = ''

  report.attempts.forEach((attempt) => {
    const attemptForBrowser = {
      name: attempt.name,
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      questionCount: report.questionCount,
    }

    attemptsForBrowser.push(attemptForBrowser)
    attemptsMarkup += createAttemptMarkup(attemptForBrowser)
  })

  const reportData = {
    questionCount: report.questionCount,
    attempts: attemptsForBrowser,
  }

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(report.quizTitle)} — отчёт</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <main class="report">
    <h1>${escapeHtml(report.quizTitle)}</h1>

    <section class="summary" aria-labelledby="summary-title">
      <h2 id="summary-title">Сводка</h2>
      <div class="summary-grid">
        <p class="summary-card">Участников<br><strong>${report.participantCount}</strong></p>
        <p class="summary-card">Средний результат<br><strong>${report.averagePercentage}%</strong></p>
        <p class="summary-card">Лучший результат<br><strong>${escapeHtml(report.best.name)} — ${report.best.score} из ${report.questionCount} (${report.best.percentage}%)</strong></p>
        <p class="summary-card">Порог пройден<br><strong>${report.passedCount} из ${report.participantCount}</strong></p>
      </div>
    </section>

    <section class="results" aria-labelledby="results-title">
      <h2 id="results-title">Результаты участников</h2>
      <form id="filter-form">
        <label for="filter">Показать</label>
        <select id="filter" name="filter">
          <option value="all">Все</option>
          <option value="passed">Порог пройден</option>
          <option value="failed">Порог не пройден</option>
        </select>
        <button type="submit">Применить</button>
      </form>
      <p id="result-count">Показано: ${report.participantCount} из ${report.participantCount}</p>
      <ul id="result-list" class="result-list">${attemptsMarkup}
      </ul>
    </section>
  </main>

  <script>window.reportData = ${serializeForScript(reportData)}</script>
  <script src="./app.js"></script>
</body>
</html>
`
}

function printSummary(report) {
  // TODO: напечатайте пять строк контрольной сводки без отладочного вывода.
  console.log(`Участников: ${report.participantCount}`)
  console.log(`Средний результат: ${report.averagePercentage}%`)
  console.log(`Лучший результат: ${report.best.name} — ${report.best.score} из ${report.questionCount} (${report.best.percentage}%)`)
  console.log(`Порог пройден: ${report.passedCount} из ${report.participantCount}`)
  console.log(`Отчёт: report.html`)
}

// Готовая защитная механика. Вызовите её до чтения входного файла.
async function removePreviousReport() {
  try {
    await unlink(outputPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

// Готовая служебная функция для ожидаемых ошибок.
function fail(message) {
  console.log(message)
  process.exitCode = 1
}

async function main() {
  // TODO: получите путь из process.argv[2].
  // TODO: удалите старый отчёт, затем прочитайте файл через await и 'utf8'.
  // TODO: отдельно обработайте ENOENT, ошибку JSON.parse() и неверную структуру.
  // TODO: рассчитайте данные, создайте HTML и запишите report.html через await.
  // TODO: напечатайте сводку только после успешной записи.
  const inputPath = process.argv[2] //Получаем путь

  await removePreviousReport() // Удаляем старый отчет

  let fileContent
  try {
    fileContent = await readFile(inputPath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail(`Ошибка чтения файла: ENOENT`)
    } else {
      fail(`Ошибка чтения файла: ${error.message}`)
    }
    return
  }

  let data
  try {
    // Парсим JSON
    data = JSON.parse(fileContent)
  } catch (error) {
    fail('Ошибка данных')
    return
  }

  // Проверяем структуру
  if (!validateQuizData(data)) {
    fail('Ошибка структуры данных')
    return
  }

  // Считаем отчёт
  const report = calculateReport(data)

  // Создаем HTML
  const html = createReportHtml(report)

  // Записываем файл
  await writeFile(outputPath, html, 'utf8')

  // Выводим сводку
  printSummary(report)
}

main()
