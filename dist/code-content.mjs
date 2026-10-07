// Authored code blocks. Displayed for typing, never executed.
export const CODE_TRACKS={
  "javascript": {
    "name": "JavaScript",
    "file": "practice.js",
    "mark": "JS",
    "description": "Переменные, функции, массивы и async / await.",
    "items": [
      [
        "Переменные",
        "const name = \"Ada\";\nconsole.log(name);"
      ],
      [
        "Стрелочная функция",
        "const add = (a, b) => {\n  return a + b;\n};"
      ],
      [
        "Фильтрация массива",
        "const active = users.filter(user => {\n  return user.active;\n});"
      ],
      [
        "Настройки объекта",
        "const config = {\n  theme: \"dark\",\n  language: \"en\"\n};"
      ],
      [
        "Асинхронный запрос",
        "const response = await fetch(\"/api/users\");\nconst users = await response.json();"
      ],
      [
        "Деструктуризация",
        "const { id, name } = user;\nconsole.log(id, name);"
      ],
      [
        "Условие",
        "if (count > 0 && ready) {\n  render(count);\n}"
      ],
      [
        "Шаблонная строка",
        "const message = `Hello, ${name}!`;\nconsole.log(message);"
      ]
    ]
  },
  "typescript": {
    "name": "TypeScript",
    "file": "practice.ts",
    "mark": "TS",
    "description": "Типы, интерфейсы, generics и типизированные функции.",
    "items": [
      [
        "Тип объекта",
        "type User = {\n  id: number;\n  name: string;\n};"
      ],
      [
        "Интерфейс",
        "interface Config {\n  theme: string;\n  retries: number;\n}"
      ],
      [
        "Типизированный массив",
        "const values: Array<number> = [\n  1, 2, 3\n];"
      ],
      [
        "Тип результата",
        "const double = (value: number): number => {\n  return value * 2;\n};"
      ],
      [
        "Необязательное поле",
        "type Profile = {\n  name: string;\n  email?: string;\n};"
      ],
      [
        "Объединение типов",
        "type Status =\n  | \"idle\"\n  | \"loading\"\n  | \"success\";"
      ],
      [
        "Запись по ключу",
        "const scores: Record<string, number> = {\n  Ada: 95\n};"
      ],
      [
        "Проверка наличия",
        "const name: string = user?.name ?? \"Guest\";\nconsole.log(name);"
      ]
    ]
  },
  "python": {
    "name": "Python",
    "file": "practice.py",
    "mark": "PY",
    "description": "Списки, словари, comprehensions и f-строки.",
    "items": [
      [
        "Сумма значений",
        "def total_price(prices):\n    total = sum(prices)\n    return total"
      ],
      [
        "Списковое включение",
        "active = [\n    user for user in users\n    if user[\"active\"]\n]"
      ],
      [
        "Словарь настроек",
        "config = {\n    \"theme\": \"dark\",\n    \"language\": \"en\"\n}"
      ],
      [
        "Логическое условие",
        "if count > 0 and enabled:\n    ready = True\nelse:\n    ready = False"
      ],
      [
        "Преобразование строк",
        "names = list(map(str.upper, names))\nprint(names)"
      ],
      [
        "Данные пользователя",
        "result = {\n    \"id\": user_id,\n    \"name\": user_name\n}"
      ],
      [
        "Форматирование",
        "def greet(name):\n    print(f\"Hello, {name}!\")"
      ],
      [
        "Уникальные значения",
        "unique = sorted(set(values))\nprint(unique)"
      ]
    ]
  },
  "c": {
    "name": "C",
    "file": "practice.c",
    "mark": "C",
    "description": "Функции, циклы, массивы, указатели и структуры.",
    "items": [
      [
        "Первая программа",
        "#include <stdio.h>\n\nint main(void) {\n  printf(\"Hello, world!\\n\");\n  return 0;\n}"
      ],
      [
        "Сумма массива",
        "int sum(const int *values, int count) {\n  int total = 0;\n  for (int i = 0; i < count; ++i) {\n    total += values[i];\n  }\n  return total;\n}"
      ],
      [
        "Указатели",
        "void swap(int *left, int *right) {\n  int temp = *left;\n  *left = *right;\n  *right = temp;\n}"
      ],
      [
        "Структура",
        "typedef struct {\n  int id;\n  char name[32];\n} User;\n\nUser user = {1, \"Ada\"};"
      ],
      [
        "Условие",
        "int maximum(int a, int b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}"
      ],
      [
        "Работа со строкой",
        "#include <string.h>\n\nint is_empty(const char *text) {\n  return strlen(text) == 0;\n}"
      ],
      [
        "Цикл while",
        "int factorial(int n) {\n  int result = 1;\n  while (n > 1) {\n    result *= n--;\n  }\n  return result;\n}"
      ],
      [
        "Размер массива",
        "#include <stddef.h>\n\nsize_t item_count(void) {\n  int items[] = {2, 4, 8, 16};\n  return sizeof(items) / sizeof(items[0]);\n}"
      ]
    ]
  },
  "cpp": {
    "name": "C++",
    "file": "practice.cpp",
    "mark": "C++",
    "description": "Потоки, STL, классы, шаблоны и современный C++.",
    "items": [
      [
        "Первая программа",
        "#include <iostream>\n\nint main() {\n  std::cout << \"Hello, world!\" << std::endl;\n  return 0;\n}"
      ],
      [
        "Вектор и цикл",
        "#include <vector>\n\nint total(const std::vector<int>& values) {\n  int result = 0;\n  for (const auto value : values) {\n    result += value;\n  }\n  return result;\n}"
      ],
      [
        "Строки",
        "#include <string>\n\nstd::string greet(const std::string& name) {\n  return \"Hello, \" + name + \"!\";\n}"
      ],
      [
        "Шаблон функции",
        "template <typename T>\nT maximum(T left, T right) {\n  return left > right ? left : right;\n}"
      ],
      [
        "Класс",
        "class Counter {\n private:\n  int value = 0;\n\n public:\n  void increment() { ++value; }\n  int get() const { return value; }\n};"
      ],
      [
        "Алгоритмы",
        "#include <algorithm>\n#include <vector>\n\nvoid sort_values(std::vector<int>& values) {\n  std::sort(values.begin(), values.end());\n}"
      ],
      [
        "Словарь",
        "#include <map>\n#include <string>\n\nstd::map<std::string, int> scores = {\n  {\"Ada\", 95},\n  {\"Linus\", 98}\n};"
      ],
      [
        "Лямбда",
        "#include <algorithm>\n#include <vector>\n\nvoid double_values(std::vector<int>& values) {\n  std::for_each(values.begin(), values.end(), [](int& n) {\n    n *= 2;\n  });\n}"
      ]
    ]
  }
};
export const CODE_VOLUMES={short:{name:'Короткий',count:1},medium:{name:'Средний',count:3},long:{name:'Длинный',count:6}};
export function codeLines(text){
 let next=0;
 const lines=text.split('\n').map((source,index)=>{
  const indent=source.match(/^ */)[0].length,words=source.trim().match(/\S+/g)||[],start=next;next+=words.length;
  return{number:index+1,indent,start,end:next,words};
 });
 return {lines,words:lines.flatMap(line=>line.words)};
}
export function codeExercise(track,index=0,volume='short'){
 const item=CODE_TRACKS[track];if(!item)throw new Error('Неизвестный набор кода.');
 if(!CODE_VOLUMES[volume])throw new Error('Неизвестный объём кода.');
 const selected=((index%item.items.length)+item.items.length)%item.items.length;
 const parts=Array.from({length:CODE_VOLUMES[volume].count},(_,i)=>item.items[(selected+i)%item.items.length]);
 const title=parts.length===1?parts[0][0]:`${item.name} · ${parts.length} ${parts.length===6?'примеров':'примера'}`,text=parts.map(([,text])=>text).join('\n\n');
 return{track,title,text,file:item.file,index:selected,volume,parts:parts.length,...codeLines(text)};
}
const keywords=new Set('const let var function return if else for of in async await import export from type interface string number boolean public private class new and or not def True False None int void char float double unsigned signed size_t bool auto struct typedef sizeof while do switch case break continue static enum typename template include #include const; return; std::cout std::endl'.split(' '));
export function codeTokenType(token){
 if(keywords.has(token))return 'keyword';
 if(/["'`]/.test(token))return 'string';
 if(/^\d/.test(token))return 'number';
 if(/^[=<>!&|+*/?:;()[\]{}\\-]+$/.test(token))return 'operator';
 return 'plain';
}
