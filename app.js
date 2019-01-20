const express = require("express");
const path = require("path");
const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const socketio = require("socket.io")
const app = express();

// Socket.io server
const server = http.createServer(app);
const io = socketio(server);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

MongoClient.connect("mongodb://localhost:27017", (err, client) => {
    if (err) throw err;

    // MongoDB is connected
    console.log("MongoDB Connected...");

    // Connect to Socket.io
    io.on("connection", (socket) => {
        // Creating database with collections
        const chatdb = client.db("chatdb");
        const chat = chatdb.collection("chat");

        // Status function for reuse
        let sendStatus = (data) => {
            socket.emit("status", data);
        }

        // Get chat from mongo collection
        chat.find().limit(100)
            .sort({
                _id: 1
            })
            .toArray((err, result) => {
                if (err) throw err;

                // Emit the messages
                socket.emit("output", result);
            })

        // Handle input events
        socket.on("input", (data) => {
            let name = data.name;
            let message = data.message;

            if (name == "" || message == "") {
                // Send error status
                sendStatus({
                    message: "Please enter a name and a message",
                    clear: true
                });
            } else {
                chat.insert({
                    name: name,
                    message: message
                }, () => {
                    io.emit("output", [data]);

                    // Send status object
                    sendStatus({
                        message: "Message Send",
                        clear: true
                    });
                })
            }
        })

        // Handle clear button
        socket.on("clear", (data) => {
            chat.remove({

            }, () => {
                socket.emit("cleared")
            });
        })
    })
})

server.listen(5000, () => {
    console.log("Server Started on 5000");
})