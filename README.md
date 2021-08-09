# dictionary

Небольшое приложение, помогающее учить (запоминать) иностранные слова. Пользователи составляют свои
словари. При запуске (клик по кнопке "начать") приложение показывает слова, предлагая вспомнить их
перевод.

Можно определиться, насколько хорошо вы запомнили слово. От этого зависит, когда приложение покажет
вам его в следующий раз. Если нажать "отлично", слово будет удалено из словаря.

Данные хранятся в браузере, в базе IndexedDB. Просто хотелось сделать приложение без дополнительных
библиотек, только Vue.

Рабочее приложение можно посмотреть на сайте https://remember-words-dictionary.vercel.app/

Или скачать на компьютер. Для запуска нужна установленная Node.

### Клонировать репозиторий

удобным вам способом, например, командой:

```
git clone https://github.com/Denesterio/remember-words-dictionary.git
```

### Войти в папку проекта, установить зависимости

```
npm install
```

### Запустить локальный сервер

```
npm run serve
```

### Lints and fixes files

```
npm run lint
```
