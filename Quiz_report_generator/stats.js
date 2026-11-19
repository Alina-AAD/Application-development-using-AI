const PASSING_PERCENTAGE = 67

function isArray(value) {
  return Array.isArray(value)
}

export function validateQuizData(data) {
  // TODO: проверьте корень, quizTitle, correctAnswers и attempts.
  // Для массивов вызывайте готовую функцию isArray(value).
  // У каждой попытки должны быть непустое имя и массив answers нужной длины.
  if (typeof data !== 'object' || data === null || isArray(data)) {
    return false;
  }

  // quizTitle — непустая строка
  if (typeof data.quizTitle !== 'string' || data.quizTitle.trim() === '') {
    return false;
  }

  // correctAnswers — непустой массив
  if (!isArray(data.correctAnswers) || data.correctAnswers.length === 0) {
    return false;
  }

  // attempts — непустой массив
  if (!isArray(data.attempts) || data.attempts.length === 0) {
    return false;
  }

  //  Проверяем попытку
  for (let i = 0; i < data.attempts.length; i++) {
    const attempt = data.attempts[i];
    
    // Попытка — объект (не null, не массив)
    if (typeof attempt !== 'object' || attempt === null || isArray(attempt)) {
      return false;
    }
    // name — непустая строка
    if (typeof attempt.name !== 'string' || attempt.name.trim() === '') {
      return false;
    }
    // answers — массив нужной длины
    if (!isArray(attempt.answers) || attempt.answers.length !== data.correctAnswers.length) {
      return false;
    }
  }

  return true; // Если все проверки прошли, возвращаем true
}

export function calculateAttempt(attempt, correctAnswers) {
  // TODO: посчитайте score, percentage и passed для одной попытки.
  // Процент округлите через Math.round(); порог хранится в PASSING_PERCENTAGE.
   let score = 0;

  // Проходимся по всем ответам участника
  for (let i = 0; i < correctAnswers.length; i++) {
    // Если ответ участника совпадает с правильным ответом по индексу увеличиваем счет
    if (attempt.answers[i] === correctAnswers[i]) {
      score += 1;
    }
  }

  // Считаем процент и округляем
  const percentage = Math.round((score / correctAnswers.length) * 100);
  
  // Проверяем, прошел ли он порог (PASSING_PERCENTAGE = 67)
  const passed = percentage >= PASSING_PERCENTAGE;

  // Возвращаем объект ровно с 4 полями
  return {
    name: attempt.name.trim(), // Обрезаем пробелы
    score: score,
    percentage: percentage,
    passed: passed,
  };
}

export function calculateReport(data) {
  // TODO: рассчитайте все попытки и сводку.
  // При равном score оставьте первого лучшего участника.
  // Рассчитываем результат для каждого участника
  const calculatedAttempts = data.attempts.map(attempt => 
    calculateAttempt(attempt, data.correctAnswers)
  );

  // Считаем сумму всех процентов и среднее значение
  let totalPercentage = 0;
  calculatedAttempts.forEach(attempt => {
    totalPercentage += attempt.percentage;
  });
  const averagePercentage = Math.round(totalPercentage / calculatedAttempts.length);

  // Считаем, сколько человек прошли порог
  const passedCount = calculatedAttempts.filter(attempt => attempt.passed).length;

  // Ищем лучшего участника (с максимальным score)
  let best = calculatedAttempts[0];
  calculatedAttempts.forEach(attempt => {
    // Если текущий участник набрал больше, чем наш "лучший", заменяем его
    // (при равенстве останется первый, так как мы используем строгое ">")
    if (attempt.score > best.score) {
      best = attempt;
    }
  });

  // 5. Возвращаем объект ровно с 8 полями
  return {
    quizTitle: data.quizTitle.trim(),
    questionCount: data.correctAnswers.length,
    participantCount: calculatedAttempts.length,
    averagePercentage: averagePercentage,
    passedCount: passedCount,
    threshold: PASSING_PERCENTAGE, // Берем из константы в начале файла
    best: best,
    attempts: calculatedAttempts,
  };
}