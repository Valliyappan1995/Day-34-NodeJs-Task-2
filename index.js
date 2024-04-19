const express = require("express");

const PORT = 3000;
const app = express();

app.use(express.json());
//rooms collection
let rooms = [
  {
    name: "Standard",
    seats: "200",
    price: "2000",
    amenities: ["wifi", "non-ac", "screen with projector"],
    roomID: "101",
    bookedDetails: [
      {
        customerName: "Saran",
        bookingID: "1",
        bookedDate: "2023-11-20",
        startTime: "08:30",
        endTime: "11:30",
        status: "confirmed",
        roomID: "101",
      },
    ],
  },
  {
    name: "Elite",
    seats: "350",
    price: "3000",
    amenities: ["wifi", "ac", "screen with projector"],
    roomID: "102",
    bookedDetails: [
      {
        customerName: "Dinesh",
        bookingID: "2",
        bookedDate: "2023-11-25",
        startTime: "15:30",
        endTime: "17:30",
        status: "confirmed",
        roomID: "102",
      },
    ],
  },
  {
    name: "Premium",
    seats: "450",
    price: "4000",
    amenities: ["wifi", "ac", "screen with projector"],
    roomID: "103",
    bookedDetails: [
      {
        customerName: "Sajeev",
        bookingID: "3",
        bookedDate: "2023-12-25",
        startTime: "20:30",
        endTime: "22:30",
        status: "Payment_Pending",
        roomID: "103",
      },
    ],
  },
  {
    name: "Deluxe",
    seats: "550",
    price: "5000",
    amenities: ["wifi", "ac", "entertainment(Tv/music)"],
    roomID: "104",
    bookedDetails: [
      {
        customerName: "Keerthika",
        bookingID: "4",
        bookedDate: "2024-01-02",
        startTime: "20:30",
        endTime: "22:30",
        status: "Payment_Pending",
        roomID: "104",
      },
    ],
  },
  {
    name: "Family Room",
    seats: "600",
    price: "3000",
    amenities: ["free wi-fi", "non-ac", "entertainment(Tv/music"],
    roomID: "105",
  },
  {
    name: "Queen",
    seats: "400",
    price: "3500",
    amenities: [
      "free wi-fi",
      "non-ac",
      "double bed room",
      "entertainment(Tv/music",
    ],
    roomID: "106",
  },
];

app.get("/", (req, res) => {
  res.send({
    message: "Server Running!",
  });
});
app.get("/rooms/all", (req, res) => {
  const roomsList = rooms.map(({ bookedDetails, ...rooms }) => rooms);
  res.status(200).json({ RoomsList: roomsList });
});
//create a Room
app.post("/createRoom", (req, res) => {
  const { name, seats, price, amenities, roomID, bookedDetails } = req.body;
  rooms.push([
    {
      name,
      seats,
      price,
      amenities,
      roomID,
      bookedDetails,
    },
  ]);
  res.send("Room Created");
});
//booking room
app.post("/bookRoom", (req, res) => {
  let {
    customerName,
    bookingID,
    bookedDate,
    startTime,
    endTime,
    status,
    roomID,
  } = req.body;

  let startTS = Date.parse(startTime);
  let endTS = Date.parse(endTime);

  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].roomID === roomID) {
      let isBooked = rooms[i].bookedDetails.some((booking) => {
        let startBookedTS = Date.parse(booking.startTime);
        let endBookedTS = Date.parse(booking.endTime);

        return (
          (startTS >= startBookedTS && startTS < endBookedTS) ||
          (endTS > startBookedTS && endTS <= endBookedTS) ||
          (startTS <= startBookedTS && endTS >= endBookedTS)
        );
      });

      if (!isBooked) {
        let tobeBooked = {
          customerName,
          bookingID,
          bookedDate,
          startTime,
          endTime,
          status,
          roomID,
        };
        rooms[i].bookedDetails.push(tobeBooked);
        return res.status(200).send({ message: "Booking confirmed", rooms });
      } else {
        return res.status(400).send({
          message: "Already booked Room,Please Select Different Time slot",
        });
      }
    }
  }

  return res.status(404).send({ message: "Room not found" });
});

//list all rooms with booked data
app.get("/listRooms", (req, res) => {
  const roomsWithBookings = rooms.filter((room) => room.bookedDetails);
  res.send(roomsWithBookings);
});

//list all customers with booked data(room name included)
app.get("/listCustomers", (req, res) => {
  const customers = {};

  rooms.forEach((room) => {
    if (room.bookedDetails) {
      room.bookedDetails.forEach((booking) => {
        const { customerName, bookingID, startTime, endTime, status, roomID } =
          booking;
        const roomName = room.name;

        if (!customers[customerName]) {
          customers[customerName] = [];
        }
        customers[customerName].push({
          roomName,
          customerName,
          bookingID,
          startTime,
          endTime,
          status,
          roomID,
        });
      });
    }
  });
  res.send(customers);
});

// list how many times a customer has booked the room with the required details
app.get("/customerBookings", (req, res) => {
  let customerBookings = {};

  rooms.forEach((room) => {
    if (room.bookedDetails) {
      room.bookedDetails.forEach((booking) => {
        const { customerName, bookingID, startTime, endTime, status, roomID } =
          booking;
        const booking_ID = booking.bookingID;
        const bookingDate = booking.bookedDate;
        const roomName = room.name;

        if (!customerBookings[customerName]) {
          customerBookings[customerName] = {
            bookings: [],
            count: 0,
          };
        }

        customerBookings[customerName].bookings.push({
          roomName,
          customerName,
          startTime,
          endTime,
          bookingID,
          bookingDate,
          status,
        });
        customerBookings[customerName].count++;
      });
    }
  });

  res.send(customerBookings);
});
app.listen(PORT, () => console.log("Server Started"));
