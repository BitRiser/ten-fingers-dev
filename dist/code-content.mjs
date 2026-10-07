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
  "terminal": {
    "name": "Terminal",
    "file": "practice.sh",
    "mark": "$_",
    "description": "Git, npm, пути, флаги и команды. Они не выполняются.",
    "items": [
      [
        "Состояние репозитория",
        "git status --short\ngit diff --stat"
      ],
      [
        "Новая ветка",
        "git switch -c feature/typing-trainer\ngit status --short"
      ],
      [
        "Запуск тестов",
        "npm run test -- --watch"
      ],
      [
        "Сохранение изменений",
        "git add src/\ngit commit -m \"Improve typing practice\""
      ],
      [
        "HTTP-запрос",
        "curl -X GET \"https://example.com/api/users?limit=10\""
      ],
      [
        "Поиск в файлах",
        "rg --files src/ | sort"
      ],
      [
        "Локальная сборка",
        "npm run build\nnpm run preview"
      ],
      [
        "Просмотр различий",
        "git diff --stat\ngit log --oneline -5"
      ]
    ]
  },
  "symbols": {
    "name": "Символы",
    "file": "symbols.txt",
    "mark": "{}",
    "description": "Отдельная тренировка скобок, операторов и Shift. Это сочетания знаков.",
    "items": [
      [
        "Скобки",
        "() [] {} <>\n() [] {} <>"
      ],
      [
        "Сравнение",
        "= == === != !==\n>= <= = == ==="
      ],
      [
        "Логические операторы",
        "&& || !\n&& || !"
      ],
      [
        "Обращение к данным",
        "list[index] object.key\nobject[\"key\"] array[0]"
      ],
      [
        "Цифры и знаки",
        "0 1 2 3 4 5 6 7 8 9\n_ - + = / *"
      ],
      [
        "Пути и имена",
        "src/main.ts ./package.json\nuser_name config.theme"
      ],
      [
        "Кавычки",
        "\"text\" 'text' `text`\n\"name\" 'name' `name`"
      ],
      [
        "Экранирование",
        "\\ \\n \\t\n| || \\ | ||"
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
const keywords=new Set('const let var function return if else for of in async await import export from type interface string number boolean public private class new and or not def True False None git npm curl rg'.split(' '));
export function codeTokenType(token){
 if(keywords.has(token))return 'keyword';
 if(/["'`]/.test(token))return 'string';
 if(/^\d/.test(token))return 'number';
 if(/^[=<>!&|+*/?:;()[\]{}\\-]+$/.test(token))return 'operator';
 return 'plain';
}
