const sourceJson = `{
  "event": {
    "title": "Ночь в музее",
    "date": "15 ноября, 18:30",
    "place": "Музей космонавтики, проспект Мира, 111",
    "description": "Вечерняя программа с выставкой и экскурсиями",
    "meeting": "Сбор: 18:30. Начало: 19:00."
  },
  "services": [
    { "id": "guide", "title": "  Экскурсия с гидом  ", "price": 500 },
    { "id": "audio", "title": "Аудиогид", "price": 350 },
    { "id": "catalog", "title": "Каталог выставки", "price": 250 }
  ]
}`;

//`sourceJson` разбирается через `JSON.parse()`
// в `try...catch`, результат называется `data`.
let data;

try {
  data = JSON.parse(sourceJson);
  // Находим элемент заголовка на странице и запоминаем его в переменную
  // Заголовок, дата, место и описание совпадают с исходными данными
  const titleElement = document.querySelector("#event-title");
  const dateElement = document.querySelector("#event-date");
  const placeElement = document.querySelector("#event-place");
  const descriptionElement = document.querySelector("#event-description");

  // Берем значение из наших данных и кладем внутрь этого элемента
  titleElement.textContent = data.event.title;
  dateElement.textContent = data.event.date;
  placeElement.textContent = data.event.place;
  descriptionElement.textContent = data.event.description;
} catch (error) {
  const formElement = document.querySelector("#service-form");
  const errorElement = document.querySelector("#data-error");
  errorElement.textContent = "Ошибка данных.";
  formElement.hidden = true; //форма прячется
  errorElement.hidden = false; //блок с ошибкой становится виден пользователю
}

/**- `buildReport(services, guideChecked, audioChecked,
 catalogChecked)` получает `data.services` 
 и три булевых значения выбора. Используйте `filter`
  для отбора услуг */
function buildReport(services, guideChecked, audioChecked, catalogChecked) {
  const selected = services.filter((service) => {
    if (service.id === "guide") return guideChecked;
    if (service.id === "audio") return audioChecked;
    if (service.id === "catalog") return catalogChecked;
    return false;
  });

  /**и `map` для создания нового 
  массива объектов. Внутри `map` извлеките `title` 
  и `price` одноуровневой деструктуризацией и 
  очистите `title` методом `trim()`.  */
  const items = selected.map((service) => {
    const { title, price } = service;
    return {
      title: title.trim(),
      price: price,
    };
  });

  /**Сумму цен   посчитайте через `reduce`. Исходные услуги не 
  меняются. */
  const total = items.reduce((sum, item) => sum + item.price, 0);

  /**- Отчёт содержит поля `count`, `total` и `items`. 
В каждом объекте массива `items` ровно два поля:
 `title` без пробелов по краям и `price`.
  Пустой выбор: `count: 0`, `total: 0`, 
  `items: []`. */
  return {
    count: items.length,
    total: total,
    items: items,
  };
}

/**"Кнопка «Показать программу» и блок программы имеют
 * id show-program и program; по клику блок виден,
 * его innerHTML равен data.event.meeting */
// Находим кнопку и блок программы
const programButton = document.querySelector("#show-program");
const programBlock = document.querySelector("#program");

// Вешаем обработчик события 'click'
programButton.addEventListener("click", function () {
  programBlock.hidden = false;
  programBlock.innerHTML = data.event.meeting;
});

// Находим форму
const formElement = document.querySelector("#service-form");

// вешаем обработчик на отправку формы
formElement.addEventListener("submit", function (event) {
  event.preventDefault(); // Останавливаем стандартную перезагрузку страницы

  // Читаем состояние чекбоксов (true или false)
  const isGuide = document.querySelector("#guide").checked;
  const isAudio = document.querySelector("#audio").checked;
  const isCatalog = document.querySelector("#catalog").checked;

  //  Вызываем нашу функцию расчета и получаем объект report
  const report = buildReport(data.services, isGuide, isAudio, isCatalog);

  // Находим элементы для вывода
  const resultElement = document.querySelector("#result");
  const reportJsonElement = document.querySelector("#report-json");
  const choiceErrorElement = document.querySelector("#choice-error");

  //Проверяем выбор
  if (report.count === 0) {
    // Ничего не выбрано: показываем ошибку, скрываем остальное
    choiceErrorElement.hidden = false;
    resultElement.hidden = true;
    reportJsonElement.hidden = true;
  } else {
    // Что-то выбрано: скрываем ошибку, показываем результат
    choiceErrorElement.hidden = true;
    resultElement.hidden = false;
    reportJsonElement.hidden = false;

    // Формируем HTML-строку с переносами <br>
    // Мы берем count и total из объекта report
    // а названия склеиваем через <br>
    resultElement.innerHTML = `Выбрано услуг: ${report.count}<br>Итого: ${report.total} руб.<br>${report.items.map((item) => item.title).join("<br>")}`;

    // 2. Превращаем объект report в красивую JSON-строку
    // и кладем в элемент
    reportJsonElement.textContent = JSON.stringify(report, null, 2);
  }
});
