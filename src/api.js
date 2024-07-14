const API_URL = "http://localhost:3001/api/v1"; 


export async function deleteBooking(roomId, date) {
    try {
        const response = await fetch(`${API_URL}/room/${roomId}/date/${date}`, {
            method: "POST",
        });
        return response.ok;
    } catch (error) {
        console.error("Room booking deleting error:", error);
        return false;
    }
};

export async function createBooking(personId, roomId, date) {
    try {
        const response = await fetch(`${API_URL}/person/${personId}/room/${roomId}/date/${date}`, {
            method: "POST",
        });
        return response.ok;
    } catch (error) {
        console.error("Booking info loading error", error);
        return false;
    }
};

export async function getBookings(roomId) {
    try {
        const response = await fetch(`${API_URL}/room/${roomId}`);
        return await response.json();
    } catch (error) {
        console.error("Shedule info loading error:", error);
        return [];
    }
};

export async function getPersons() {
    try {
        const response = await fetch(`${API_URL}/person`);
        return (await response.json()).persons;
    } catch (error) {
        console.error("Persons info loading error", error);
        return [];
    }
};

export async function getRooms() {
    try {
        const response = await fetch(`${API_URL}/room`);
        return (await response.json()).rooms;
    } catch (error) {
        console.error("Classrom info loading error:", error);
        return [];
    }
};

