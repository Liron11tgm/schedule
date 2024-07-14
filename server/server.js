const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');
const port = 3001;


function readJsonFile(filename) {
    try {
        const data = fs.readFileSync(path.join(__dirname, filename), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Ошибка чтения файла ${filename}:`, err);
        return [];
    }
}

const rooms = readJsonFile('rooms.json');
const persons = readJsonFile('persons.json');
let bookings = readJsonFile('bookings.json');


app.use(cors({
    origin: `http://localhost:3000`
}))


app.get('/api/v1/room', (req, res) => {
    res.json({"rooms": rooms});
});


app.get('/api/v1/room/:roomId', (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const roomBookings = bookings.filter(booking => booking.roomId === roomId);
    res.json(roomBookings.map(booking => ({
        personId: booking.userId,
        date: booking.date,
    })));
});


app.get('/api/v1/person', (req, res) => {
    res.json({"persons": persons});
});


app.post('/api/v1/person/:personId/room/:roomId/date/:date', (req, res) => {
    const personId = parseInt(req.params.personId);
    const roomId = parseInt(req.params.roomId);
    const date = req.params.date;

    const person = persons.find(p => p.id === personId);
    const room = rooms.find(r => r.id === roomId);

    if (!person || !room) {
        return res.status(404).json({ error: 'Человек или комната не найдены' });
    }

    if (bookings.find(b => b.roomId === roomId && b.date === date)) {
        return res.status(400).json({ error: 'Комната уже забронирована на эту дату' });
    }

    bookings.push({ userId: personId, roomId, date });

    fs.writeFileSync(path.join(__dirname, 'bookings.json'), JSON.stringify(bookings, null, 2));

    res.status(201).json({ message: 'Бронь успешно создана' });
});


app.post('/api/v1/room/:roomId/date/:date', (req, res) => {
    const roomId = parseInt(req.params.roomId);
    const date = req.params.date;

    bookings = bookings.filter(booking => !(booking.roomId === roomId && booking.date === date));

    fs.writeFileSync(path.join(__dirname, 'bookings.json'), JSON.stringify(bookings, null, 2));

    res.status(204).send();
});


app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
