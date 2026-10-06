import {LANGUAGES} from './data.mjs';
import {chooseTarget,median} from './learning.mjs';

export function personalPlan({model,progress,lang}){
 const minutes=[3,5,10].includes(model.minutes)?model.minutes:5;
 const target=chooseTarget(model,lang),observed=target.observations>0||target.reason.startsWith('В диагностике');
 const focus=observed?(target.type==='text'?({numbers:'Цифры и знаки',shift:'Заглавные и Shift',letters:'Связный текст'}[target.key]||'Рабочий текст'):`${target.type==='pair'?'Переход':'Буква'} «${target.key.toUpperCase()}»`):'Спокойный набор без ошибок';
 const recent=model.activities.slice(-5),accuracy=median(recent.map(r=>r.accuracy));
 const goal=model.goal,known=LANGUAGES[lang].alphabet.slice(0,progress.unlocked).toUpperCase();
 const workFocus=observed?{coach:'phase-target',title:focus,reason:target.reason}:{run:'shift',title:'Заглавные и Shift',reason:'Потренируй регистр и сочетания обеих рук перед рабочими фрагментами.'};
 let tasks;
 if(goal==='beginner')tasks=[{coach:'lesson',title:'Следующий урок клавиш',reason:'Начни с ближайшего непройденного шага. На знакомстве с клавишами скорость не ограничена.'},{view:'practice',title:'Закрепление знакомых букв',reason:`Слова из открытых букв: ${known.split('').join(' · ')}. Сначала точность, потом скорость.`},{coach:'lesson',title:'Повтор и закрепление',reason:'Вернись в курс: для освоения шага нужны две последовательные уверенные попытки.'}];
 else if(goal==='retrain')tasks=[{coach:'phase-warmup',title:'Положение рук и ритм',reason:'Печатай медленно, глядя на экран. Возвращай пальцы на домашний ряд после каждого нажатия.'},{coach:'phase-target',title:focus,reason:observed?target.reason:'Соберём первые наблюдения и увидим, какие буквы требуют внимания.'},{coach:'phase-transfer',title:'Новые слова без подсказки взгляда',reason:'Перенеси привычку смотреть на экран в новый текст. Подсказки рук можно оставить включёнными.'}];
 else if(goal==='work')tasks=[workFocus,{run:'numbers',title:'Цифры и специальные знаки',reason:'Даты, время, номера и пунктуация — отдельная часть рабочего набора.'},{run:'work',title:'Рабочий фрагмент',reason:'Соедини буквы, регистр и знаки в новом связном тексте.'}];
 else tasks=[{coach:'phase-target',title:focus,reason:observed?target.reason:'Начнём с короткого текста. По ошибкам тренажёр выберет буквы и переходы для следующих занятий.'},{coach:'phase-warmup',title:'Точность в ровном темпе',reason:'Уменьши скорость, если появляются опечатки. Ориентир — 95% точности и выше.'},{coach:'phase-transfer',title:'Проверка в новом контексте',reason:'Набери новый текст: проверим, сохраняется ли точность за пределами знакомых слов.'}];
 const durations=minutes===3?[1,1,1]:minutes===5?[1,3,1]:[2,6,2];
 return {minutes,title:{beginner:'С нуля — к уверенным клавишам',retrain:'Перестраиваем привычку печатать',accuracy:'Сначала точность, затем скорость',work:'Уверенный набор в работе'}[goal]||'Сначала точность, затем скорость',basis:observed?target.reason:recent.length?`Учитываем недавние занятия этого профиля (${recent.length})${accuracy!=null?': медианная точность '+Math.round(accuracy)+'%.':'.'} Для вывода об отдельных клавишах пока мало данных.`:'Это стартовый маршрут по твоей цели. После занятий он уточнится по ошибкам и медленным переходам.',hasObservations:observed,tasks:tasks.map((task,i)=>({...task,minutes:durations[i]}))};
}
