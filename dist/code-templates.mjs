// Authored fragments: five different structures per tier, ten identifier sets.
export const CODE_TEMPLATES={
  "javascript": [
    {
      "title": "Настройки",
      "titles": {
        "short": "Настройки",
        "medium": "Отбор элементов",
        "long": "Цикл с накоплением"
      },
      "short": "const {{record}} = {\n  enabled: true,\n  limit: 10\n};",
      "medium": "const {{items}} = [2, 4, 8];\nconst {{result}} = {{items}}.filter({{value}} => {{value}} > 3);\nconsole.log({{result}});",
      "long": "function {{sum}}({{items}}) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Массив",
      "titles": {
        "short": "Массив",
        "medium": "Проверка значения",
        "long": "Класс состояния"
      },
      "short": "const {{items}} = [2, 4, 8, 16];\nconsole.log({{items}}.length);",
      "medium": "function {{describe}}({{value}}) {\n  if ({{value}} == null) return \"not set\";\n  return String({{value}}).trim();\n}",
      "long": "class {{describe}} {\n  constructor({{value}} = 0) {\n    this.value = {{value}};\n  }\n  reset() {\n    this.value = 0;\n    return this.value;\n  }\n}"
    },
    {
      "title": "Короткая функция",
      "titles": {
        "short": "Короткая функция",
        "medium": "Асинхронный ответ",
        "long": "Обработка ошибки"
      },
      "short": "const {{describe}} = ({{value}}) => {\n  return String({{value}});\n};",
      "medium": "async function {{find}}({{text}}) {\n  const {{result}} = await fetch({{text}});\n  return await {{result}}.json();\n}",
      "long": "async function {{find}}({{text}}) {\n  try {\n    const {{result}} = await fetch({{text}});\n    return await {{result}}.json();\n  } catch {\n    return null;\n  }\n}"
    },
    {
      "title": "Деструктуризация",
      "titles": {
        "short": "Деструктуризация",
        "medium": "Уникальные значения",
        "long": "Частота слов"
      },
      "short": "const { value: {{value}} } = { value: 42 };",
      "medium": "const {{items}} = [2, 2, 4, 8];\nconst {{result}} = [...new Set({{items}})];\nconsole.log({{result}});",
      "long": "function {{frequency}}({{words}}) {\n  const {{result}} = {};\n  for (const {{word}} of {{words}}) {\n    {{result}}[{{word}}] = ({{result}}[{{word}}] ?? 0) + 1;\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Шаблон строки",
      "titles": {
        "short": "Шаблон строки",
        "medium": "Сортировка",
        "long": "Преобразование записей"
      },
      "short": "const {{word}} = \"ready\";\nconst {{text}} = `Status: ${{{word}}}`;",
      "medium": "const {{items}} = [8, 2, 4];\nconst {{result}} = {{items}}.toSorted((a, b) => a - b);",
      "long": "const {{items}} = [2, 4, 8];\nconst {{result}} = {{items}}.map(({{value}}, {{index}}) => ({\n  id: {{index}},\n  value: {{value}},\n  active: {{value}} > 3\n}));\nconsole.table({{result}});"
    }
  ],
  "typescript": [
    {
      "title": "Тип записи",
      "titles": {
        "short": "Тип записи",
        "medium": "Функция с типом результата",
        "long": "Типизированный цикл"
      },
      "short": "type {{record}} = {\n  value: number;\n  active: boolean;\n};",
      "medium": "function {{describe}}({{value}}: number = 0): string {\n  const {{text}} = String({{value}});\n  return {{text}};\n}",
      "long": "function {{sum}}({{items}}: number[]) {\n  let {{result}} = 0;\n  for (const {{value}} of {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Типизированный массив",
      "titles": {
        "short": "Типизированный массив",
        "medium": "Массив только для чтения",
        "long": "Интерфейс и объект"
      },
      "short": "const {{items}}: number[] = [2, 4, 8];\nconsole.log({{items}});",
      "medium": "const {{items}}: readonly number[] = [2, 4, 8];\nconst {{result}} = {{items}}.map({{value}} => {{value}} * 2);",
      "long": "interface {{record}} {\n  id: number;\n  label: string;\n  enabled: boolean;\n}\nconst {{data}}: {{record}} = {\n  id: 1,\n  label: \"ready\",\n  enabled: true\n};"
    },
    {
      "title": "Объединение типов",
      "titles": {
        "short": "Объединение типов",
        "medium": "Тип словаря",
        "long": "Обобщённая функция"
      },
      "short": "type {{key}} = \"ready\" | \"busy\" | \"done\";\nlet {{value}}: {{key}};",
      "medium": "type {{record}} = Record<string,number>;\nconst {{data}}: {{record}} = {\n  build: 1,\n  test: 2\n};",
      "long": "function {{find}}<T>({{items}}: T[]): T | undefined {\n  if ({{items}}.length === 0) {\n    return undefined;\n  }\n  const [{{value}}] = {{items}};\n  return {{value}};\n}"
    },
    {
      "title": "Необязательное поле",
      "titles": {
        "short": "Необязательное поле",
        "medium": "Пара значений",
        "long": "Объединение состояний"
      },
      "short": "interface {{record}} {\n  id: number;\n  label?: string;\n}",
      "medium": "type {{record}} = [string, number];\nconst {{data}}: {{record}} = [\"ready\", 42];\nconst [{{text}}, {{value}}] = {{data}};",
      "long": "type {{record}} =\n  | { ok: true; value: number }\n  | { ok: false; error: string };\nlet {{data}}: {{record}};\nconsole.log(\"ready\");"
    },
    {
      "title": "Обобщённый тип",
      "titles": {
        "short": "Обобщённый тип",
        "medium": "Сужение типа",
        "long": "Неизменяемое обновление"
      },
      "short": "type {{record}}<T> = {\n  data: T;\n  error?: string;\n};",
      "medium": "function {{describe}}({{value}}: string | null) {\n  if ({{value}} === null) return \"empty\";\n  return {{value}}.trim();\n}",
      "long": "interface {{record}} {\n  id: number;\n  label: string;\n}\nfunction {{describe}}({{data}}: {{record}}, {{text}}: string): {{record}} {\n  return {\n    ...{{data}},\n    label: {{text}}.trim()\n  };\n}"
    }
  ],
  "python": [
    {
      "title": "Список",
      "titles": {
        "short": "Список",
        "medium": "Включение списка",
        "long": "Накопление суммы"
      },
      "short": "{{items}} = [2, 4, 8]\n{{result}} = sum({{items}})\nprint({{result}})",
      "medium": "{{items}} = [2, 4, 8]\n{{result}} = [{{value}} * 2 for {{value}} in {{items}}]\nprint({{result}})",
      "long": "def {{sum}}({{items}}):\n    {{result}} = 0\n    for {{value}} in {{items}}:\n        if {{value}} is not None:\n            {{result}} += {{value}}\n    return {{result}}\n\nprint({{sum}}([4, 8]))"
    },
    {
      "title": "Словарь",
      "titles": {
        "short": "Словарь",
        "medium": "Уникальные слова",
        "long": "Условие в списке"
      },
      "short": "{{record}} = {\n    \"enabled\": True,\n    \"limit\": 10\n}\nprint({{record}}[\"limit\"])",
      "medium": "{{words}} = [\"build\", \"test\", \"build\"]\n{{result}} = sorted(set({{words}}))\nfor {{word}} in {{result}}:\n    print({{word}})",
      "long": "def {{select}}({{items}}, {{limit}}):\n    {{result}} = []\n    for {{value}} in {{items}}:\n        if {{value}} >= {{limit}}:\n            {{result}}.append({{value}})\n    return sorted({{result}})\n\nprint({{select}}([4, 8], 6))"
    },
    {
      "title": "Распаковка",
      "titles": {
        "short": "Распаковка",
        "medium": "Нумерация",
        "long": "Обработка исключения"
      },
      "short": "{{items}} = (2, 4)\n{{low}}, {{high}} = {{items}}\nprint({{low}}, {{high}})",
      "medium": "{{words}} = [\"build\", \"test\", \"run\"]\nfor {{index}}, {{word}} in enumerate({{words}}, start=1):\n    print({{index}}, {{word}})",
      "long": "def {{describe}}({{text}}):\n    try:\n        {{value}} = int({{text}})\n    except ValueError:\n        return None\n    else:\n        return {{value}} * 2\n\n{{result}} = {{describe}}(\"42\")\nprint({{result}})"
    },
    {
      "title": "Форматирование строки",
      "titles": {
        "short": "Форматирование строки",
        "medium": "Проверка аргумента",
        "long": "Генератор словаря"
      },
      "short": "{{value}} = 42\n{{text}} = f\"Result: {{{value}}}\"\nprint({{text}})",
      "medium": "def {{describe}}({{value}}):\n    if {{value}} is None:\n        return \"empty\"\n    {{text}} = str({{value}})\n    return {{text}}.strip()",
      "long": "{{words}} = [\"build\", \"test\", \"run\"]\n{{result}} = {\n    {{word}}: len({{word}})\n    for {{word}} in {{words}}\n    if {{word}}\n}\nfor {{key}}, {{value}} in {{result}}.items():\n    print({{key}}, {{value}})"
    },
    {
      "title": "Простая функция",
      "titles": {
        "short": "Простая функция",
        "medium": "Срез списка",
        "long": "Класс с методом"
      },
      "short": "def {{describe}}({{value}}):\n    return str({{value}}).strip()\n\n{{text}} = {{describe}}(42)\nprint({{text}})",
      "medium": "{{items}} = [2, 4, 8, 16]\n{{result}} = {{items}}[:2]\n{{output}} = {{items}}[::-1]\nprint({{result}}, {{output}})",
      "long": "class {{record}}:\n    def __init__(self, {{value}}):\n        self.value = {{value}}\n\n    def reset(self):\n        self.value = 0\n        return self.value\n\n{{data}} = {{record}}(42)\nprint({{data}}.reset())"
    }
  ],
  "c": [
    {
      "title": "Массив чисел",
      "titles": {
        "short": "Массив чисел",
        "medium": "Размер массива",
        "long": "Ограничение диапазона"
      },
      "short": "int {{items}}[] = {\n  2, 4, 8\n};",
      "medium": "#include <stddef.h>\nint {{items}}[] = {2, 4, 8};\nsize_t {{count}} = sizeof {{items}} / sizeof {{items}}[0];",
      "long": "int {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{value}} < {{low}}) {\n    return {{low}};\n  }\n  return {{value}} > {{high}} ? {{high}} : {{value}};\n}"
    },
    {
      "title": "Структура",
      "titles": {
        "short": "Структура",
        "medium": "Проверка порога",
        "long": "Счётчик цикла"
      },
      "short": "struct {{record}} {\n  int id;\n  double value;\n};",
      "medium": "int {{select}}(int {{value}}, int {{limit}}) {\n  if ({{value}} >= {{limit}}) {\n    return {{value}};\n  }\n  return 0;\n}",
      "long": "int {{sum}}(int {{limit}}) {\n  int {{result}} = 0;\n  for (int {{index}} = 0; {{index}} < {{limit}}; ++{{index}}) {\n    {{result}} += {{index}};\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Перечисление",
      "titles": {
        "short": "Перечисление",
        "medium": "Тернарное выражение",
        "long": "Проверка указателя"
      },
      "short": "enum {{key}} {\n  {{low}} = 0,\n  {{value}},\n  {{high}}\n};",
      "medium": "int {{find}}(int {{value}}, int {{limit}}) {\n  return {{value}} == {{limit}} ? {{value}} : -1;\n}",
      "long": "int {{frequency}}(const char *{{text}}) {\n  if (!{{text}}) return 0;\n  int {{count}} = 0;\n  while ({{text}}[{{count}}] != '\\0') {\n    ++{{count}};\n  }\n  return {{count}};\n}"
    },
    {
      "title": "Простая функция",
      "titles": {
        "short": "Простая функция",
        "medium": "Обмен через указатели",
        "long": "Выбор ветки"
      },
      "short": "int {{describe}}(void) {\n  return 42;\n}\nint {{value}} = 0;",
      "medium": "void {{normalize}}(int *{{low}}, int *{{high}}) {\n  int {{value}} = *{{low}};\n  *{{low}} = *{{high}};\n  *{{high}} = {{value}};\n}",
      "long": "int {{describe}}(int {{value}}) {\n  switch ({{value}}) {\n    case 0:\n      return 10;\n    case 1:\n      return 20;\n    default:\n      return -1;\n  }\n}"
    },
    {
      "title": "Псевдоним типа",
      "titles": {
        "short": "Псевдоним типа",
        "medium": "Инициализация структуры",
        "long": "Массив структур"
      },
      "short": "typedef unsigned long {{count}};\n{{count}} {{value}} = 0;",
      "medium": "struct {{record}} {\n  int id;\n  double value;\n};\nstruct {{record}} {{data}} = {1, 2.5};",
      "long": "struct {{record}} {\n  int id;\n  double value;\n};\nstruct {{record}} {{items}}[] = {\n  {1, 2.5},\n  {2, 4.5},\n  {3, 8.5}\n};\nint {{count}} = 3;"
    }
  ],
  "cpp": [
    {
      "title": "Вектор",
      "titles": {
        "short": "Вектор",
        "medium": "Пара значений",
        "long": "Сумма элементов"
      },
      "short": "#include <vector>\nstd::vector<int> {{items}} = {\n  2, 4, 8\n};",
      "medium": "#include <utility>\nstd::pair<int,int> {{record}} = {2, 4};\nconst auto [{{low}}, {{high}}] = {{record}};",
      "long": "#include <vector>\nint {{sum}}(const std::vector<int>& {{items}}) {\n  int {{result}} = 0;\n  for (const auto {{value}} : {{items}}) {\n    {{result}} += {{value}};\n  }\n  return {{result}};\n}"
    },
    {
      "title": "Структура",
      "titles": {
        "short": "Структура",
        "medium": "Лямбда",
        "long": "Проверка границ"
      },
      "short": "struct {{record}} {\n  int id = 0;\n  double value = 0.0;\n};",
      "medium": "auto {{select}} = [](int {{value}}, int {{limit}}) {\n  return {{value}} >= {{limit}};\n};\nbool {{found}} = {{select}}(4, 2);",
      "long": "#include <algorithm>\nint {{within}}(int {{value}}, int {{low}}, int {{high}}) {\n  if ({{low}} > {{high}}) return {{value}};\n  return std::clamp({{value}}, {{low}}, {{high}});\n}"
    },
    {
      "title": "Строгое перечисление",
      "titles": {
        "short": "Строгое перечисление",
        "medium": "Шаблон функции",
        "long": "Подсчёт символов"
      },
      "short": "enum class {{key}} {\n  {{low}},\n  {{value}},\n  {{high}}\n};",
      "medium": "template <typename T>\nT {{sum}}(T {{low}}, T {{high}}) {\n  return {{low}} + {{high}};\n}",
      "long": "#include <algorithm>\n#include <string>\nint {{frequency}}(const std::string& {{text}}, char {{key}}) {\n  const auto {{result}} = std::count({{text}}.begin(), {{text}}.end(), {{key}});\n  return static_cast<int>({{result}});\n}"
    },
    {
      "title": "Вывод строки",
      "titles": {
        "short": "Вывод строки",
        "medium": "Умный указатель",
        "long": "Поиск в коллекции"
      },
      "short": "#include <iostream>\nvoid {{describe}}() {\n  std::cout << \"ready\\n\";\n}",
      "medium": "#include <memory>\nstruct {{record}} {\n  int value = 42;\n};\nauto {{data}} = std::make_unique<{{record}}>();",
      "long": "#include <algorithm>\n#include <vector>\nbool {{find}}(const std::vector<int>& {{items}}, int {{limit}}) {\n  const auto {{found}} = std::find({{items}}.begin(), {{items}}.end(), {{limit}});\n  return {{found}} != {{items}}.end();\n}"
    },
    {
      "title": "Константное выражение",
      "titles": {
        "short": "Константное выражение",
        "medium": "Сортировка вектора",
        "long": "Класс с состоянием"
      },
      "short": "constexpr int {{sum}}(int {{value}}) {\n  return {{value}} * 2;\n}",
      "medium": "#include <algorithm>\n#include <vector>\nvoid {{normalize}}(std::vector<int>& {{items}}) {\n  std::sort({{items}}.begin(), {{items}}.end());\n  {{items}}.shrink_to_fit();\n  return;\n}",
      "long": "class {{record}} {\n public:\n  int value = 0;\n  void add(int {{value}}) {\n    value += {{value}};\n  }\n  void reset() {\n    value = 0;\n  }\n};"
    }
  ]
};
