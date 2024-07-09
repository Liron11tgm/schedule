const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Функция для чтения данных из JSON-файла
function readJsonFile(filename) {
  try {
    const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Ошибка чтения файла ${filename}:`, err);
    return { reservation: {"person" : []} }; // Возвращаем пустой массив в случае ошибки
  }
}

// Загрузка данных из файлов
const rooms = readJsonFile('room.json');
const persons = readJsonFile('person.json');
let bookings = readJsonFile('bookings.json');

// Обработка запросов

// GET /api/v1/room
app.get('/api/v1/room', (req, res) => {
  res.json(rooms);
});

// GET /api/v1/room/[roomId]
app.get('/api/v1/room/:roomId', (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const roomBookings = bookings.reservation.filter(booking => booking.roomId === roomId);
  res.json(roomBookings.map(booking => booking.date));
});

// GET /api/v1/person
app.get('/api/v1/person', (req, res) => {
  res.json(persons);
});

// POST /api/v1/person/[personId]/room/[roomId]/date/[date]
app.post('/api/v1/person/:personId/room/:roomId/date/:date', (req, res) => {
  const personId = parseInt(req.params.personId);
  const roomId = parseInt(req.params.roomId);
  const date = req.params.date;

  // Проверяем, есть ли человек и комната
  const person = persons.person.find(p => p.id === personId);
  const room = rooms.room.find(r => r.id === roomId);

  if (!person || !room) {
    return res.status(404).json({ error: 'Человек или комната не найдены' });
  }

  // Проверяем, не забронирована ли комната на эту дату
  if (bookings.reservation.find(b => b.roomId === roomId && b.date === date)) {
    return res.status(400).json({ error: 'Комната уже забронирована на эту дату' });
  }

  // Добавляем бронь
  bookings.reservation.push({ userId: personId, roomId, date });

  // Сохраняем изменения в файл
  fs.writeFileSync(path.join(__dirname, 'bookings.json'), JSON.stringify(bookings, null, 2));

  res.status(201).json({ message: 'Бронь успешно создана' });
});

// POST /api/v1/room/[roomId]/date/[date]
app.post('/api/v1/room/:roomId/date/:date', (req, res) => {
  const roomId = parseInt(req.params.roomId);
  const date = req.params.date;

  // Проверяем, есть ли бронь
  bookings.reservation = bookings.reservation.filter(booking => !(booking.roomId === roomId && booking.date === date));

  // Сохраняем изменения в файл
  fs.writeFileSync(path.join(__dirname, 'bookings.json'), JSON.stringify(bookings, null, 2));

  res.status(204).send(); // Отправляем пустой ответ (204 No Content)
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});