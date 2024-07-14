import React, { useState, useEffect } from "react";

import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import * as api from "./api";



const localizer = momentLocalizer(moment);


function Modal({ title, isOpen, onClose, children }) {
  return isOpen &&
    (<div className="fixed z-10 inset-0 overflow-y-auto block" >
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity block"
      >
      <div className="z20 flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
      </div>
    </div>);
}

function Dropdown({ rooms, onChange, selectedRoomId, isLoading }) {
    return (
        <select value={selectedRoomId ?? ""} onChange={onChange} disabled={isLoading}>
        <option value="">Choose classroom</option>
        {!rooms ? null : rooms.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
        ))}
        </select>
    );
};

function BookingModal({ persons, callback, onCancel }) {
    const onSubmit = (e) => {
        e.preventDefault();
        const personId = e.target.selectedPerson.value;
        callback(personId);
    };

    return (
        <form onSubmit={onSubmit}>
            <p>Book a classroom</p>
            <select id="selectedPerson">
                <option value="">Choose teacher</option>
                {persons.map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                ))}
            </select>
            <button className="btn" type="submit">Book</button>
            <button className="btn" onClick={onCancel}>Cancel</button>
        </form>
    );
}

function App() {
    const [showDelete, setShowDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedRoomId, setSelectedRoomId] = useState("");

    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [rooms, setRooms] = useState([]);
    const [persons, setPersons] = useState([]);

    const [bookingCallback, setBookingCallback] = useState([]);

    useEffect(() => {
        api.getRooms().then((rooms_) => {
            setRooms(rooms_);
            api.getPersons().then((persons_) => {
                setPersons(persons_);
                setIsLoading(false);
            });
        });
    }, []);

    const updateBookings = () => {
        if (!selectedRoomId) return;

        api.getBookings(selectedRoomId).then((bookings) => {
            const calendarEvents = bookings.map(({date, personId}) => ({
                start: moment(date, "DD.MM.YYYY").toDate(),
                end: moment(date, "DD.MM.YYYY").add(1, "day").toDate(),
                title: persons.find((p) => p.id == +personId).name,
                data: {
                    roomId: selectedRoomId,
                    personId: personId,
                    date: date,
                }
            }));
            setEvents(calendarEvents);
        });

    };
    useEffect(updateBookings, [selectedRoomId]);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowDelete(true);
    };

    const handleSelectSlot = (event) => {
        if (!selectedRoomId) return;
        const date = moment(event.start).format("DD.MM.YYYY");

        setBookingCallback([(personId) => {
            setBookingCallback([]);
            api.createBooking(personId, selectedRoomId, date);
            updateBookings();
        }]);
    };

    const handleDelete = () => {
        setShowDelete(false);
        api.deleteBooking(selectedEvent.data.roomId, selectedEvent.data.date);
        updateBookings();
    };

    return (
        <div className="bg-white border rounded-md m-4 p-2">
            <div className="">
                {isLoading
                ? (<p>Classroom info loading...</p>)
                : (<Dropdown 
                    rooms={rooms}
                    onChange={(e) => { setSelectedRoomId(e.target.value); }}
                    selectedRoomId={selectedRoomId}
                    isLoading={isLoading} 
                />)}
                <div className="bg-white cal">
                    <Calendar
                        events={events}
                        localizer={localizer}
                        startAccessor="start"
                        endAccessor="end"
                        onSelectEvent={handleEventClick}
                        onSelectSlot={handleSelectSlot}
                        style={{"height": "500px", "backgroundColor": "#1D7373"}}
                        selectable
                    />
                </div>
            </div>

            <Modal title="Delete booking"
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
            >
                <div>
                    <p>you sure you want to delete booking?</p>
                    <button className="btn" onClick={handleDelete}>Yes</button>
                    <button className="btn" onClick={() => setShowDelete(false)}>No</button>
                </div>
            </Modal>

            <Modal title="Create booking"
                isOpen={bookingCallback.length != 0}
                onClose={() => setBookingCallback([])}
            >
                <BookingModal
                    persons={persons}
                    callback={bookingCallback[0]}
                    onCancel={() => setBookingCallback([])}
                />
            </Modal>
        </div>
    );
}

export default App;
