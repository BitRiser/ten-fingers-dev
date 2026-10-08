// Explain direct file opening before module loading, without inline scripts.
if(location.protocol==='file:'){
 const content=document.getElementById('content'),section=document.createElement('section');
 section.className='file-launch-help';
 const title=document.createElement('h1');title.textContent='Запусти тренажёр через локальный сервер';section.append(title);
 for(const text of ['В папке скачанного проекта открой start.command на Mac или start.bat на Windows. Нужен Python 3.','Или выполни в терминале: python3 start.py.','Открытие index.html напрямую блокирует модули и аудио. Интернет после скачивания не нужен.']){const p=document.createElement('p');p.textContent=text;section.append(p);}
 content.append(section);
}
