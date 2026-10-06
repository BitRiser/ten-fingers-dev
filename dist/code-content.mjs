// Authored, single-line material. It is displayed for typing, never executed.
export const CODE_TRACKS={
 javascript:{name:'JavaScript',file:'practice.js',mark:'JS',description:'Переменные, функции, массивы и async / await.',items:[
  ['Переменные','const name = "Ada"; console.log(name);'],
  ['Стрелочная функция','const add = (a, b) => a + b;'],
  ['Фильтрация массива','const active = users.filter(user => user.active);'],
  ['Настройки объекта','const config = { theme: "dark", language: "en" };'],
  ['Асинхронный запрос','const response = await fetch("/api/users"); const users = await response.json();'],
  ['Деструктуризация','const { id, name } = user; console.log(id, name);'],
  ['Условие','if (count > 0 && ready) { render(count); }'],
  ['Шаблонная строка','const message = `Hello, ${name}!`; console.log(message);']
 ]},
 typescript:{name:'TypeScript',file:'practice.ts',mark:'TS',description:'Типы, интерфейсы, generics и типизированные функции.',items:[
  ['Тип объекта','type User = { id: number; name: string };'],
  ['Интерфейс','interface Config { theme: string; retries: number; }'],
  ['Типизированный массив','const values: Array<number> = [1, 2, 3];'],
  ['Тип результата','const double = (value: number): number => value * 2;'],
  ['Необязательное поле','type Profile = { name: string; email?: string };'],
  ['Объединение типов','type Status = "idle" | "loading" | "success";'],
  ['Запись по ключу','const scores: Record<string, number> = { Ada: 95 };'],
  ['Проверка наличия','const name: string = user?.name ?? "Guest";']
 ]},
 python:{name:'Python',file:'practice.py',mark:'PY',description:'Списки, словари, comprehensions и f-строки.',items:[
  ['Сумма значений','total = sum(price for price in prices)'],
  ['Списковое включение','active = [user for user in users if user["active"]]'],
  ['Словарь настроек','config = {"theme": "dark", "language": "en"}'],
  ['Логическое условие','ready = count > 0 and enabled'],
  ['Преобразование строк','names = list(map(str.upper, names))'],
  ['Данные пользователя','result = {"id": user_id, "name": user_name}'],
  ['Форматирование','print(f"Hello, {name}!")'],
  ['Уникальные значения','unique = sorted(set(values))']
 ]},
 terminal:{name:'Terminal',file:'practice.sh',mark:'$_',description:'Git, npm, пути, флаги и команды. Они не выполняются.',items:[
  ['Состояние репозитория','git status --short'],
  ['Новая ветка','git switch -c feature/typing-trainer'],
  ['Запуск тестов','npm run test -- --watch'],
  ['Сохранение изменений','git add src/ && git commit -m "Improve typing practice"'],
  ['HTTP-запрос','curl -X GET "https://example.com/api/users?limit=10"'],
  ['Поиск в файлах','rg --files src/ | sort'],
  ['Локальная сборка','npm run build && npm run preview'],
  ['Просмотр различий','git diff --stat && git log --oneline -5']
 ]},
 symbols:{name:'Символы',file:'symbols.txt',mark:'{}',description:'Отдельная тренировка скобок, операторов и Shift. Это сочетания знаков.',items:[
  ['Скобки','() [] {} <> () [] {} <>'],
  ['Сравнение','= == === != !== >= <= = == ==='],
  ['Логические операторы','&& || ! && || ! && || !'],
  ['Обращение к данным','list[index] object.key object["key"] array[0]'],
  ['Цифры и знаки','0 1 2 3 4 5 6 7 8 9 _ - + = / *'],
  ['Пути и имена','src/main.ts ./package.json user_name config.theme'],
  ['Кавычки','"text" \'text\' `text` "name" \'name\' `name`'],
  ['Экранирование','\\ \\n \\t | || \\ | ||']
 ]}
};
export const CODE_VOLUMES={short:{name:'Короткий',count:1},medium:{name:'Средний',count:3},long:{name:'Длинный',count:6}};
export function codeExercise(track,index=0,volume='short'){
 const item=CODE_TRACKS[track];if(!item)throw new Error('Неизвестный набор кода.');
 if(!CODE_VOLUMES[volume])throw new Error('Неизвестный объём кода.');
 const selected=((index%item.items.length)+item.items.length)%item.items.length;
 const parts=Array.from({length:CODE_VOLUMES[volume].count},(_,i)=>item.items[(selected+i)%item.items.length]);
 const title=parts.length===1?parts[0][0]:`${item.name} · ${parts.length} ${parts.length===6?'примеров':'примера'}`,text=parts.map(([,text])=>text).join(' ');
 return{track,title,text,file:item.file,index:selected,volume,parts:parts.length,words:text.split(' ')};
}
const keywords=new Set('const let var function return if else for of in async await import export from type interface string number boolean public private class new and or not def True False None git npm curl rg'.split(' '));
export function codeTokenType(token){
 if(keywords.has(token))return 'keyword';
 if(/["'`]/.test(token))return 'string';
 if(/^\d/.test(token))return 'number';
 if(/^[=<>!&|+*/?:;()[\]{}\\-]+$/.test(token))return 'operator';
 return 'plain';
}
