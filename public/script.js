$(() => {

    // Connect to Socket.io
    let socket = io();

    // Check for connection
    if (socket !== undefined) {
        console.log("Connected to Socket...");

        socket.on("status", (data) => {
            $("#status")
                .toggle()
                .text(data.message)

            setTimeout(() => {
                $("#status").toggle()
            }, 3000)
        })

        socket.on("output", (data) => {
            for (let i = 0; i < data.length; i++) {
                $("#messages").prepend(
                    $("<li>")
                    .attr("class", "list-group-item")
                    .append(
                        $("<span>")
                        .text("@" + data[i].name + ": ")
                        .attr("class", "font-weight-bold")
                    )
                    .append(
                        $("<span>")
                        .text(data[i].message)
                    )
                )
            }
        })

        $("#textarea").keyup((e) => {
            if (e.keyCode == 13) {
                console.log("Enter Pressed");
                socket.emit("input", {
                    name: $("#username").val(),
                    message: $("#textarea").val()
                })
            }
        })
    }
})