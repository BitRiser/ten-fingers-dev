// Practice texts cover different subjects and sentence rhythms. Control tests stay separate.
export const EXTRA_TEXTS={
 ru:{
  letters:[
   'Новая команда начинает работу с небольшого прототипа. Сначала разработчики описывают поведение программы, затем проверяют несколько простых сценариев. Такой подход помогает заметить ошибку раньше, чем она попадёт в большой проект.',
   'За окном медленно меняется погода. Утренний туман скрывает дальние дома, но к обеду над крышами появляется солнце. Я заканчиваю заметку, закрываю ноутбук и отправляюсь на короткую прогулку.',
   'Данные проходят через несколько этапов обработки. Программа читает исходный файл, проверяет формат записей и сохраняет результат. Если входная строка повреждена, пользователь получает понятное сообщение и может исправить её самостоятельно.',
   'В мастерской пахнет деревом и свежей краской. На широком столе лежат инструменты, рядом сохнет новая полка. Мастер внимательно проверяет каждое соединение, прежде чем собрать все части в одну конструкцию.',
   'Хорошая документация отвечает на конкретные вопросы. Она объясняет назначение функции, показывает небольшой пример и описывает ограничения. Несколько ясных предложений часто помогают коллеге больше, чем длинный список сложных терминов.',
   'Поезд движется вдоль берега. За стеклом чередуются поля, небольшие станции и лесные участки. Пассажир напротив читает книгу, а я записываю идеи для проекта, который давно хотел начать.',
   'Проверка изменений начинается с чтения задачи. Важно понять ожидаемое поведение, найти крайние случаи и сравнить результат с прежней версией. После этого команда обсуждает замечания и выбирает следующий шаг.',
   'На карте города появились новые велодорожки. Теперь путь до библиотеки проходит через парк и тихую улицу. Мы сравнили несколько маршрутов и выбрали тот, где меньше перекрёстков и больше деревьев.'
  ],
  shift:[
   'Анна работает над разделом "Настройки", а Дмитрий проверяет страницу "История". Перед встречей Елена собирает замечания команды. В пятницу Борис покажет новый прототип и расскажет, какие вопросы пока остаются открытыми.',
   'В понедельник Мария отправилась в Казань. Во вторник она встретилась с Олегом и посетила местную библиотеку. После поездки появился рассказ "Неделя у реки", который друзья прочитали за один вечер.',
   'Проект "Орбита" состоит из нескольких частей. Алиса отвечает за поиск, Максим создаёт редактор, а София готовит примеры. Команда договорилась: "Сначала делаем понятный интерфейс, затем добавляем дополнительные возможности".',
   'Сергей открыл документ "Первые шаги". На первой странице было написано: "Выберите упражнение и начинайте в удобном темпе". Наталья предложила дополнить инструкцию, чтобы Андрей и другие новички быстрее разобрались с управлением.',
   'Вера и Павел планируют поездку на Урал. Они изучают карту Перми, выбирают гостиницу и обсуждают прогулки. Ирина советует оставить свободный день, а Михаил обещает показать свой любимый маршрут.',
   'В разделе "Помощь" Лев описал работу редактора. Дарья проверила примеры, Константин исправил подписи кнопок. После этого Роман спросил: "Сможет ли новый пользователь выполнить задачу без дополнительных объяснений?"',
   'Школа открыла кружок "Юный исследователь". Виктор показывает простые опыты, Полина помогает вести записи, а Глеб собирает фотографии. На следующей встрече ребята представят свои наблюдения и зададут новые вопросы.',
   'Надежда назвала выставку "Свет и тени". В большом зале Александр разместил фотографии Москвы, а в соседнем Юлия показала зарисовки Петербурга. Каждый посетитель может оставить отзыв в книге "Ваши впечатления".'
  ],
  numbers:[
   'Проверка сборки: 24 задания, 3 ошибки, 21 успешный результат. Версия 2.8 готова к повторной проверке. Начало: 09:40, окончание: 10:15. Отчёт состоит из 4 разделов; исправления нужно отправить до 18:00.',
   'Маршрут 17 отправляется в 08:25 и прибывает в 09:10. Билет стоит 240 рублей, место: 12. На пересадку остаётся 35 минут. Обратный поезд: 19:45; номер заказа 5832, вагон 4.',
   'В папке 128 файлов: 96 изображений, 24 документа и 8 таблиц. Архив занимает 512 мегабайт. Копирование начинается в 14:30; скорость меняется от 18 до 26 мегабайт в секунду. После завершения проверь 3 случайных файла.',
   'Задача 641: обновить форму поиска. Ограничение строки: 80 символов; история хранит 50 запросов. Пустой ввод возвращает 0 результатов. Время ответа должно быть меньше 250 миллисекунд, а число повторов запроса - не больше 3.',
   'Список покупок: 4 яблока по 35 рублей, 2 пакета молока по 90 рублей и 1 хлеб за 65 рублей. Скидка: 10%. Магазин открыт с 07:00 до 23:00; доставка назначена на 16.10.',
   'Комната 305: длина 6 метров, ширина 4 метра. Внутри 8 столов и 16 стульев. Ремонт займёт 12 дней. План включает 3 этапа: подготовку, покраску и сборку мебели. Первая встреча: 11.10, 13:20.',
   'За неделю команда закрыла 42 задачи из 60. В очереди осталось 18: 7 исправлений, 6 улучшений и 5 проверок. Следующая версия: 3.2.1. Встреча состоится 22.10 в 11:00; на обсуждение выделено 45 минут.',
   'Эксперимент повторили 5 раз. Результаты: 12, 15, 14, 11 и 13 секунд. Среднее значение: 13 секунд. Новый вариант выполняет работу за 9 секунд. Для итогового отчёта понадобится ещё 10 измерений и 2 графика.'
  ],
  work:[
   'Привет! Я проверил изменения в поиске и оставил два замечания. Пожалуйста, уточни поведение пустого запроса и добавь пример для длинной строки. После исправления смогу повторно посмотреть задачу и подтвердить результат.',
   'Доброе утро! Сегодня начну с редактора документов, затем проверю сохранение настроек. Если появятся вопросы по новому формату, напишу в обсуждение задачи. К вечеру подготовлю короткий отчёт о готовых изменениях.',
   'Спасибо за подробное описание ошибки. Мне удалось повторить её на тестовом примере. Причина связана с обработкой пустого списка. Исправление уже готово; сейчас проверяю соседние сценарии, чтобы убедиться в устойчивости решения.',
   'Коллеги, новая инструкция готова к просмотру. В ней есть последовательность действий, примеры ввода и ответы на частые вопросы. Проверьте, пожалуйста, подписи элементов интерфейса и напишите, где объяснение кажется слишком длинным.',
   'Добрый день! Предлагаю перенести обсуждение на завтра утром. Сегодня нужно закончить проверку формы и подготовить данные для демонстрации. Материалы встречи сохранены в общей папке; список вопросов добавлю чуть позже.',
   'Я сравнил оба варианта реализации. Первый проще читать, второй быстрее обрабатывает большой список. Для текущей задачи предлагаю выбрать понятное решение и вернуться к оптимизации после измерения реальной нагрузки.',
   'Привет! В последней версии добавлены поиск по названию и сортировка по дате. Старые записи продолжают открываться без изменений. Попробуй, пожалуйста, несколько обычных действий и сообщи, если заметишь неожиданное поведение.',
   'Обновление готово. Мы сократили время загрузки, уточнили сообщения об ошибках и исправили переход между страницами. Следующий этап - проверить сценарии нового пользователя и убедиться, что основные действия легко найти.'
  ]
 },
 en:{
  letters:[
   'A small prototype helps the team explore a new idea. Developers describe the expected behavior before adding more features. They test a few simple cases, discuss the results, and keep the next step small enough to review carefully.',
   'Morning fog hides the distant buildings. By noon, sunlight reaches the desk and the street becomes busy again. I finish a short note, close the laptop, and take a walk through the park before the next meeting.',
   'The program reads a file and checks each record. Valid entries move to the next stage, while damaged rows receive a clear error message. A user can correct the original data and run the same process again.',
   'Wood and paint fill the workshop with a familiar smell. Tools lie on a wide table beside a newly built shelf. The maker checks every connection and measures the edges before putting all the pieces together.',
   'Useful documentation answers practical questions. It explains the purpose of a function, includes a small example, and describes the limits. A few clear sentences can save a teammate more time than a long page of complicated terms.',
   'The train follows the river through open fields and quiet villages. A passenger reads a book across the aisle. I watch the changing landscape and write down ideas for a project that I have wanted to start for months.',
   'A review begins with the original task. The reviewer checks the expected behavior, looks for edge cases, and compares the change with the earlier version. The team then discusses the comments and agrees on the next step.',
   'New bicycle paths connect the library with the park. The route now avoids a busy road and passes several quiet streets. We compare the options and choose the path with fewer crossings and more shade.'
  ],
  shift:[
   'Anna works on the Settings page while Daniel checks the History panel. Before the meeting, Emma collects the team comments. On Friday, Oliver will present the new prototype and explain which questions still need answers.',
   'Maria travelled to London on Monday. On Tuesday, she met Ben and visited the British Library. After the trip, she wrote a story called "A Week by the River" and shared it with Alex and Sophie.',
   'Project Orbit has several parts. Alice builds the Search page, Max creates the Editor, and Sofia prepares examples. The team agrees: "Make the main action clear before adding more options to the screen."',
   'Chris opened a document called "First Steps". The first page said: "Choose an exercise and begin at a comfortable pace." Julia suggested another example so that Sam and other new users could understand the controls.',
   'Vera and Paul are planning a trip to Edinburgh. They study the map, compare hotels, and discuss walks through the city. Irene recommends a free afternoon, and Michael offers to show them his favorite route.',
   'Leo wrote a guide for the Help section. Diana checked the examples, Kate improved the button labels, and Robert asked: "Can a new user finish this task without asking someone else for instructions?"',
   'The school opened a club called "Young Researchers". Victor demonstrates simple experiments, Paula helps record observations, and Grace takes photographs. At the next meeting, the group will share its findings and propose new questions.',
   'Nora named the exhibition "Light and Shadows". In the main hall, Andrew placed photographs of Paris. In the next room, Lucy displayed drawings of Rome. Visitors can leave a short message in the Guest Book.'
  ],
  numbers:[
   'Build report: 24 checks, 3 failures, and 21 successful results. Version 2.8 is ready for another review. Start: 09:40; finish: 10:15. The report has 4 sections. Please send the fixes before 18:00.',
   'Route 17 leaves at 08:25 and arrives at 09:10. The ticket costs $24, and your seat is 12. You have 35 minutes to change trains. Return: 19:45; booking 5832, carriage 4.',
   'The folder contains 128 files: 96 images, 24 documents, and 8 tables. The archive takes 512 MB. Copying starts at 14:30, with a speed between 18 and 26 MB per second. Check 3 files after completion.',
   'Task 641: update the search form. Maximum query: 80 characters; history: 50 entries. An empty query returns 0 results. Response time should stay below 250 ms, and a failed request may retry no more than 3 times.',
   'Shopping list: 4 apples at $0.35 each, 2 cartons of milk at $1.90, and 1 loaf of bread at $2.65. Discount: 10%. The shop opens from 07:00 to 23:00. Delivery date: 16.10.',
   'Room 305 is 6 meters long and 4 meters wide. It has 8 desks and 16 chairs. Repairs will take 12 days. The plan includes 3 stages: preparation, painting, and assembly. First meeting: 11.10 at 13:20.',
   'This week the team completed 42 of 60 tasks. There are 18 left: 7 fixes, 6 improvements, and 5 checks. Next release: 3.2.1. The meeting is on 22.10 at 11:00 and should take 45 minutes.',
   'We repeated the experiment 5 times. Results: 12, 15, 14, 11, and 13 seconds. Average: 13 seconds. The new version finishes in 9 seconds. The final report needs 10 more measurements and 2 charts.'
  ],
  work:[
   'Hi! I reviewed the search changes and left two comments. Please clarify the behavior of an empty query and add an example with a long string. After that, I can review the task again and confirm the result.',
   'Good morning! I will start with the document editor and then check how settings are saved. If I have questions about the new format, I will post them in the task discussion. A brief progress report will follow this evening.',
   'Thank you for the detailed bug report. I reproduced the issue with a small test case. The cause is an empty list in the input. The fix is ready, and I am checking nearby cases before sending it for review.',
   'The new instructions are ready to review. They include the sequence of actions, sample input, and answers to common questions. Please check the interface labels and point out any explanation that takes too long to read.',
   'Hello! Could we move the discussion to tomorrow morning? Today I need to finish checking the form and prepare the demo data. The meeting notes are in the shared folder. I will add the remaining questions later.',
   'I compared both implementations. The first is easier to read, while the second handles a large list faster. For this task, I suggest the clear solution. We can return to optimization after measuring the actual workload.',
   'Hi! The latest version adds search by name and sorting by date. Existing records still open as expected. Please try a few everyday actions and let me know if anything behaves in a surprising way.',
   'The update is ready. We reduced loading time, clarified error messages, and fixed page transitions. The next step is to test the first visit and check whether a new user can find the main actions easily.'
  ]
 }
};
