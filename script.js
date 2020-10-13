document.addEventListener('DOMContentLoaded', () => {

    //Firebase setup
    var firebaseConfig = {
        apiKey: "AIzaSyDXdQQ8c8NwQaxubxrhcTU_fw-wqTel0eQ",
        authDomain: "internetuno-5cb30.firebaseapp.com",
        databaseURL: "https://internetuno-5cb30.firebaseio.com",
        projectId: "internetuno-5cb30",
        storageBucket: "internetuno-5cb30.appspot.com",
        messagingSenderId: "790203471698",
        appId: "1:790203471698:web:f3bdb38e1f6bbde2584c8b"
    };
    firebase.initializeApp(firebaseConfig);

    //Local firebase reference setup
    readyDB = firebase.database().ref("games");
    myDB = firebase.database().ref("games");
    cardsDB = firebase.database().ref("games");
    gameDB = firebase.database().ref("games");
    myGamesDB = firebase.database().ref("games").child("gameObjects");


    //Initial button values
    $("#end").attr("disabled", true);
    $("#start").attr("disabled", true);
    $("#create").attr("disabled", false);
    $("#join").attr("disabled", false);
    $("#draw").attr("disabled", true);
    $("#blue").attr("disabled", true);
    $("#yellow").attr("disabled", true);
    $("#red").attr("disabled", true);
    $("#green").attr("disabled", true);
    $("#left").attr("disabled", true);
    $("#first").attr("disabled", true);
    $("#second").attr("disabled", true);
    $("#third").attr("disabled", true);
    $("#fourth").attr("disabled", true);
    $("#fifth").attr("disabled", true);
    $("#right").attr("disabled", true);

    //Initial local values
    gamename = "";
    created = "";
    maxplayers = 10;
    status = ""
    username = ""
    ready = true;
    cards = [];
    drawcounter = 1;
    topCard = {};
    playerorder = [0];
    currentplayer = 0;
    ending = false;
    numplayers = 1;
    gamegoing = false;
    extradraw = false;
    playerIndex = 0;
    leftIndex = 0;
    waiting = true;
    joined = false;
    winner = "";
    isWinner = false;

    //Constant defintions
    cardButtons = ["first", "second", "third", "fourth", "fifth"];
    buttonDefaults = ["First card", "Second card", "Third card", "Fourth card", "Fifth card"];
    playerDisplays = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"];
    playerDefaults = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8", "Player 9"];
    colors = ["blue", "green", "red", "yellow"];


    //Function to create deck. Returns array of cards
    createDeck = function () {
        vals = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "drawtwo", "skip", "reverse"];
        colors = ["blue", "red", "green", "yellow"];
        fullDeck = [];

        for (i = 0; i < colors.length; i++) {
            fullDeck.push({ "type": "zero", "color": colors[i] });
            for (j = 0; j < vals.length; j++) {
                fullDeck.push({ "type": vals[j], "color": colors[i] });
                fullDeck.push({ "type": vals[j], "color": colors[i] });
            }
        }
        for (j = 0; j < 4; j++) {
            fullDeck.push({ "type": "drawfour", "color": "wild", "tempColor": "wild" });
            fullDeck.push({ "type": "wild", "color": "wild", "tempColor": "wild" });
        }

        for (i = 0; i < fullDeck.length; i++) {
            r = i + Math.floor(Math.random() * (fullDeck.length - i))
            temp = fullDeck[r];
            fullDeck[r] = fullDeck[i];
            fullDeck[i] = temp;
        }
        return fullDeck;
    }

    //Function to shuffle deck. Takes in array of cards and returns array of cards
    shuffleDeck = function (deck) {
        for (i = 0; i < deck.length; i++) {
            r = i + Math.floor(Math.random() * (deck.length - i))
            temp = deck[r];
            deck[r] = deck[i];
            deck[i] = temp;
        }
        return deck;
    }

    //Initial creation
    createDeck();

    //"create" button
    document.getElementById("create").addEventListener("click", function () {
        myGamesDB.child("games").orderByKey().once("value", (aGameSnap) => {
            aGameSnap.forEach(function (snapshot) {
                if (snapshot.child("ending").val() === true) {
                    snapshot.ref.remove();
                }
            })
        })
        //Collecting basic user info
        username = document.getElementById('name').value;
        gamename = document.getElementById('game').value;
        //Checking basic user info
        if (username === "") {
            alert("You can't create or join a game until you've entered a username");
        } else if (gamename === "") {
            alert("You can't create or join a game until you've entered the game's name.")
        } else {
            myGamesDB.child("games").orderByKey().once("value", (aGameSnap) => {
                //Look for copies of this game name
                found = false;
                aGameSnap.forEach(function (snapshot) {
                    if (snapshot.child("gamename").val() === gamename) {
                        found = true;
                    }
                })
                if (found) {
                    console.log("check");
                    alert(`The game name ${gamename} has already been taken. Try a different game.`);
                } else { // Create new game
                    //Initialize game variables
                    console.log("test");
                    created = Date.now();
                    maxplayers = 10;
                    status = "Waiting for more players";
                    deck = createDeck();
                    discarddeck = [deck.shift()]
                    if (discarddeck[0]["color"] === "wild") {
                        discarddeck[0]["tempColor"] = colors[Math.floor(Math.random() * 4)];
                    }
                    games = myGamesDB.child("games");

                    //Create game
                    newGame = games.push();
                    newGame.set({
                        gamename: gamename,
                        created: created,
                        maxplayers: maxplayers,
                        status: status,
                        players: [{
                            "username": username,
                            "ready": true,
                            "index": playerIndex,
                            "cards": [{
                                "color": "First",
                                "type": "card"
                            }]
                        }],
                        drawdeck: deck,
                        drawcounter: drawcounter,
                        discarddeck: discarddeck,
                        playerorder: playerorder,
                        currentplayer: currentplayer,
                        ending: false,
                        numplayers: numplayers,
                        gamegoing: gamegoing,
                        extradraw: extradraw,
                        isWinner: isWinner,
                        winner: winner
                    });

                    players = [{
                        "username": username,
                        "ready": true,
                        "index": playerIndex,
                        "cards": [{
                            "color": "First",
                            "type": "card"
                        }]
                    }]

                    //Redirect databases
                    gameDB = newGame;
                    myDB = newGame.child("players").child("0");
                    cardsDB = myDB.child("cards");
                    readyDB = myDB.child("ready");

                    //Set button states
                    $("#create").attr("disabled", true);
                    $("#join").attr("disabled", true);
                    $("#start").attr("disabled", false);
                    $("#end").attr("disabled", false);

                    waiting = false;
                    joined = true;

                    //Set ready listener: reset ready
                    readyDB.on("value", readyFunction);

                    //Set gamegoing listener: update gamegoing
                    gameDB.child("gamegoing").on("value", gamegoingFunction)

                    //Set card listener: update cards and update()
                    cardsDB.on("value", cardsFunction);

                    //Set discard listener: Update players, extradraw, drawcounter, playerorder, currentplayer, and topCard, then udpate()
                    gameDB.child("discarddeck").on("value", discarddeckFunction);

                    //Set ending listener: update ending and all vars, then update()
                    gameDB.child("ending").on("value", endingFunction);

                    //Set draw listener: update players, then update()
                    gameDB.child("drawdeck").on("value", drawdeckFunction);
                }
            })
        }
    })

    //"join" button
    document.getElementById("join").addEventListener("click", function () {
        //Collecting basic user info
        username = document.getElementById('name').value;
        gamename = document.getElementById('game').value;
        //Checking basic user info
        if (username === "") {
            alert("You can't create or join a game until you've entered a username");
        } else if (gamename === "") {
            alert("You can't create or join a game until you've entered the game's name.")
        } else { //Checking if game exists to join
            foundGame = false;
            myGamesDB.once("value", (aGameSnap) => {
                aGameSnap.child("games").forEach(function (snapshot) {
                    if (snapshot.child("gamename").val() === gamename) {
                        foundGame = true;
                        // If game isn't going, check for repetition of user name.
                        if (snapshot.child("gamegoing").val() === false) {
                            repeated = false;
                            snapshot.child("players").forEach(function (s2) {
                                if (s2.child("username").val() === username && s2.child("ready") === true) {
                                    repeated = true;
                                }
                            })
                            if (repeated) {
                                alert("This name is already taken in this game. Pick a different name or game.")
                            } else { //If game isn't going and the user name isn't repeated, join game.
                                players = Object.values(snapshot.child("players"));
                                if (players.length < snapshot.child("maxplayers").val()) {
                                    //Set gameDB
                                    gameDB = myGamesDB.child("games").child(snapshot.key)
                                    //Update players
                                    players = Object.values(snapshot.child("players").val());
                                    players.push({
                                        "username": username,
                                        "ready": true,
                                        "index": players.length,
                                        "cards": [{
                                            "color": "First",
                                            "type": "card"
                                        }]
                                    })
                                    gameDB.child("players").set(players);
                                    //Update playerorder
                                    playerIndex = players.length - 1;
                                    playerorder = Object.values(snapshot.child("playerorder").val());
                                    playerorder.push(playerIndex);
                                    snapshot.ref.child("playerorder").set(playerorder);
                                    //Set myDB, cardsDB, & readyDB
                                    myDB = gameDB.child("players").child(playerIndex.toString());
                                    cardsDB = myDB.child("cards");
                                    readyDB = myDB.child("ready");

                                    //Set button states
                                    $("#create").attr("disabled", true);
                                    $("#join").attr("disabled", true);
                                    $("#start").attr("disabled", false);
                                    $("#end").attr("disabled", false);
                                    waiting = false;
                                    joined = true;

                                    //Set ready listener: reset ready
                                    readyDB.on("value", readyFunction);

                                    //Set gamegoing listener: update gamegoing
                                    gameDB.child("gamegoing").on("value", gamegoingFunction)

                                    //Set cards listener: update cards and update()
                                    cardsDB.on("value", cardsFunction);

                                    //Set ending listner: update ending and all vars, then update()
                                    gameDB.child("ending").on("value", endingFunction);

                                    //Set discarddeck listener: update players, extradraw, drawcounter, playerorder, currentplayer, and topCard, then update()
                                    gameDB.child("discarddeck").on("value", discarddeckFunction);

                                    //Set drawdeck listener: update players, then update()
                                    gameDB.child("drawdeck").on("value", drawdeckFunction);
                                } else {
                                    alert(`Couldn't join game ${gamename} because they already have the maximum number of players`);
                                }
                            }
                        } else { //If the game is going
                            foundPlayer = false;
                            PlayerActive = false;
                            counter = 0;
                            snapshot.child("players").forEach(function (s2) {
                                if (s2.child("username").val() === username) { //If found player
                                    foundPlayer = true;
                                    if (s2.child("ready").val() === false) { // If player isn't ready, join game as player
                                        // Set gameDB, myDB, cardsDB, and readyDB
                                        gameDB = myGamesDB.child("games").child(snapshot.key)
                                        myDB = gameDB.child("players").child(counter.toString());
                                        cardsDB = myDB.child("cards");
                                        readyDB = myDB.child("ready");

                                        //Update game variables to see game
                                        status = snapshot.child("status").val();
                                        cards = Object.values(s2.child("cards").val());
                                        snapshot.child("drawcounter").val();
                                        discarddeck = Object.values(snapshot.child("drawdeck").val());
                                        topCard = discarddeck[discarddeck.length - 1];
                                        playerorder = Object.values(snapshot.child("playerorder").val());
                                        currentplayer = snapshot.child("currentplayer").val();
                                        ending = snapshot.child("ending").val();
                                        numplayers = snapshot.child("numplayers").val();
                                        gamegoing = snapshot.child("gamegoing").val();
                                        extradraw = snapshot.child("extradraw").val();
                                        drawcounter = snapshot.child("drawcounter").val();
                                        playerIndex = s2.child("index").val();
                                        players = Object.values(snapshot.child("players").val());


                                        // Reset ready
                                        readyDB.set(true);

                                        //Set button states
                                        $("#create").attr("disabled", true);
                                        $("#join").attr("disabled", true);
                                        $("#start").attr("disabled", false);
                                        $("#end").attr("disabled", false);
                                        waiting = false;
                                        joined = true;

                                        //set ready listener: reset ready
                                        readyDB.on("value", readyFunction);

                                        //Set gamegoing listener: update gamegoing
                                        gameDB.child("gamegoing").on("value", gamegoingFunction)

                                        //set cards listener: update cards and update()
                                        cardsDB.on("value", cardsFunction);

                                        //Set ending listner: update ending and all vars, then update()
                                        gameDB.child("ending").on("value", endingFunction);

                                        //set discarddeck listener: update players, extradraw, drawcounter, playercounter, playerorder, currentplayer, topCard, and update()
                                        gameDB.child("discarddeck").on("value", discarddeckFunction);

                                        //set drawdeck listener: update players and update()
                                        gameDB.child("drawdeck").on("value", drawdeckFunction);
                                    } else {
                                        playerActive = true;
                                    }
                                }
                                counter++;
                            })
                            if (!foundPlayer) {
                                alert("This game has already started, and your username is not in it.\n Please choose a different game, or enter your correct username.");
                            } else if (playerActive) {
                                alert("This username is already active in this continuing game.");
                            }
                        }
                    }
                })
            })
            if (!foundGame) {
                alert(`The game id ${gamename} could not be found.\nAre you sure you entered it correctly?`)
            }
        }
    })

    //"start" button
    document.getElementById("start").addEventListener("click", function () {

        //turn off start button
        $("#start").attr("disabled", true);

        //Flip gamegoing to true
        gameDB.child("gamegoing").set(true);

        //Distribute 7 cards to each person
        gameDB.orderByKey().once("value", (aGameSnap) => {
            deck = aGameSnap.child("drawdeck").val();
            aGameSnap.child("players").forEach(function (snapshot) {
                hand = []
                for (i = 0; i < 7; i++) {
                    hand.push(deck.shift());
                }
                gameDB.child("drawdeck").set(deck);
                snapshot.ref.child("cards").set(hand);
            })
        })
    })

    document.getElementById("end").addEventListener("click", function () {
        gameDB.child("gamegoing").set(false);
        gameDB.child("ending").set(true);
    })

    update = function () {

        if (joined) {
            if (!isWinner) {
                document.getElementById("gamename").innerHTML = gamename;
                console.log("b1");
                console.log(cards);
                console.log(gamegoing);
                //Set left and right buttons
                if (leftIndex == 0) {
                    $("#left").attr("disabled", true);
                } else {
                    $("#left").attr("disabled", false);
                }
                if (leftIndex >= cards.length - 5) {
                    $("#right").attr("disabled", true);
                } else {
                    $("#right").attr("disabled", false);
                }

                //Set card buttons
                for (i = 0; i < 5; i++) {
                    if ((leftIndex + i) < cards.length && cards[leftIndex + i]["color"] != "First") {
                        document.getElementById(cardButtons[i]).innerHTML = cardToText(cards[leftIndex + i])
                    } else {
                        console.log("here");
                        document.getElementById(cardButtons[i]).innerHTML = buttonDefaults[i];
                        $("#" + cardButtons[i]).attr("disabled", true);
                    }
                    if (currentplayer === playerIndex && !(topCard["color"] === "wild" && topCard["tempColor"] === "wild") && (leftIndex + i) < cards.length) {
                        $("#" + cardButtons[i]).attr("disabled", false);
                    } else {
                        $("#" + cardButtons[i]).attr("disabled", true);
                        console.log("here2");
                        console.log("here");
                    }
                }

                //Turn off draw button when choosing color for wild card
                if (currentplayer === playerIndex && !(topCard["color"] === "wild" && topCard["tempColor"] === "wild")) {
                    $("#draw").attr("disabled", false);
                } else {
                    $("#draw").attr("disabled", true);
                }

                //If no game has been joined, turn off buttons
                if (cardsDB === firebase.database().ref("games")) {
                    console.log("b11");
                    for (i = 0; i < 5; i++) {
                        $("#" + cardButtons[i]).attr("disabled", true);
                        $("#" + cardButtons[i]).innerHTML = buttonDefaults[i];
                    }
                    for (i = 0; i < 9; i++) {
                        $("#p" + (i + 1)).innerHTML = playerDefaults[i];
                    }
                    $("#blue").attr("disabled", true);
                    $("#draw").attr("disabled", true);
                    $("#red").attr("disabled", true);
                    $("#yellow").attr("disabled", true);
                    $("#green").attr("disabled", true);
                    $("#create").attr("disabled", false);
                    $("#join").attr("disabled", false);
                    $("#start").attr("disabled", true);
                    $("#end").attr("disabled", true);
                } else {
                    console.log("b12");
                    //Display other player names
                    index = 0;
                    for (i = 0; i < players.length; i++) {
                        if (players[i]["username"] != username) {
                            document.getElementById(playerDisplays[index]).innerHTML = players[i]["username"] + ": " + Object.values(players[i]["cards"]).length + " cards"
                            index++;
                        }
                    }
                    for (index; index < 9; index++) {
                        document.getElementById(playerDisplays[index]).innerHTML = playerDefaults[index];
                    }
                    document.getElementById("count").innerHTML = "Card Count: " + cards.length;
                    //Display top card of discard pile
                    if (topCard["color"] === "wild") {
                        if (topCard["tempColor"] === "wild") {
                            document.getElementById("discard").innerHTML = "Discard Pile: " + cardToText(topCard) + " - waiting for color choice";
                        } else {
                            document.getElementById("discard").innerHTML = "Discard Pile: " + cardToText(topCard) + " - " + topCard["tempColor"];
                        }
                    } else {
                        document.getElementById("discard").innerHTML = "Discard Pile: " + cardToText(topCard);
                        $("#blue").attr("disabled", true);
                        $("#green").attr("disabled", true);
                        $("#yellow").attr("disabled", true);
                        $("#red").attr("disabled", true);
                    }

                    if (!gamegoing) {
                        for (i = 0; i < 5; i++) {
                            $("#" + cardButtons[i]).attr("disabled", true);
                        }
                        for (i = 0; i < 9; i++) {
                            $("#p" + (i + 1)).innerHTML = playerDefaults[i];
                        }
                        $("#blue").attr("disabled", true);
                        $("#draw").attr("disabled", true);
                        $("#red").attr("disabled", true);
                        $("#yellow").attr("disabled", true);
                        $("#green").attr("disabled", true);
                        $("#create").attr("disabled", true);
                        $("#join").attr("disabled", true);
                        $("#start").attr("disabled", false);
                        $("#end").attr("disabled", false);
                        document.getElementById("discard").innerHTML = "Discard Pile"
                        document.getElementById("count").innerHTML = "Card count"
                    }
                }
            } else {
                for (i = 0; i < 5; i++) {
                    document.getElementById(cardButtons[i]).attr("disabled", true);
                    document.getElementById(cardButtons[i]).innerHTML = buttonDefaults[i];
                }
                document.getElementById("gamename").innerHTML = "Congratulations to " + winner + "! " + winner + " has won!"
            }
        } else {
            document.getElementById("gamename").innerHTML = "Game Name";
            $("#create").attr("disabled", false);
            $("#join").attr("disabled", false);
            $("#start").attr("disabled", true);
            $("#end").attr("disabled", true);
            $("#draw").attr("disabled", true);
            $("#blue").attr("disabled", true);
            $("#red").attr("disabled", true);
            $("#yellow").attr("disabled", true);
            $("#green").attr("disabled", true);
            $("#left").attr("disabled", true);
            $("#right").attr("disabled", true);
            for (i = 0; i < 9; i++) {
                document.getElementById(playerDisplays[i]).innerHTML = playerDefaults[i];
            }
            for (i = 0; i < 5; i++) {
                $("#" + cardButtons[i]).attr("disabled", true);
                $("#" + cardButtons[i]).innerHTML = buttonDefaults[i]
            }
        }
    }

    cardToText = function (card) {
        if (card["type"] === "wild") {
            return "wild";
        } else {
            return card["color"] + " " + card["type"];
        }
    }

    document.getElementById("right").addEventListener("click", function () {
        leftIndex += 5;
        update();
    })

    document.getElementById("left").addEventListener("click", function () {
        leftIndex -= 5;
        update();
    })

    document.getElementById("first").addEventListener("click", function () {
        index = leftIndex;
        card = cards[index];
        if (cardToCardMatch(topCard, card)) {
            cards.splice(index, 1);
            cardsDB.set(cards);
            if (card["type"] === "drawtwo") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 2;
                } else {
                    drawcounter += 2;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "drawfour") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 4;
                } else {
                    drawcounter += 4;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "reverse") {
                playerorder.reverse();
                gameDB.child("playerorder").set(playerorder);
            }
            gameDB.orderByKey().once("value", (aGameSnap) => {
                discard = Object.values(aGameSnap.child("discarddeck").val());
                discard.push(card);
                gameDB.child("discarddeck").set(discard);
            });
            if (card["type"] === "skip") {
                currentplayer = incrementPlayer();
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            } else if (card["color"] === "wild") {
                $("#blue").attr("disabled", false);
                $("#red").attr("disabled", false);
                $("#yellow").attr("disabled", false);
                $("#green").attr("disabled", false);
                $("#first").attr("disabled", true);
                $("#second").attr("disabled", true);
                $("#third").attr("disabled", true);
                $("#fourth").attr("disabled", true);
                $("#fifth").attr("disabled", true);
            } else {
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            }
        } else {
            alert("You can't play this card");
        }
    })

    document.getElementById("second").addEventListener("click", function () {
        index = leftIndex + 1;
        card = cards[index];
        if (cardToCardMatch(topCard, card)) {
            cards.splice(index, 1);
            cardsDB.set(cards);
            if (card["type"] === "drawtwo") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 2;
                } else {
                    drawcounter += 2;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "drawfour") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 4;
                } else {
                    drawcounter += 4;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "reverse") {
                playerorder.reverse();
                gameDB.child("playerorder").set(playerorder);
            }
            gameDB.orderByKey().once("value", (aGameSnap) => {
                discard = Object.values(aGameSnap.child("discarddeck").val());
                discard.push(card);
                gameDB.child("discarddeck").set(discard);
            });
            if (card["type"] === "skip") {
                currentplayer = incrementPlayer();
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            } else if (card["color"] === "wild") {
                $("#blue").attr("disabled", false);
                $("#red").attr("disabled", false);
                $("#yellow").attr("disabled", false);
                $("#green").attr("disabled", false);
                $("#first").attr("disabled", true);
                $("#second").attr("disabled", true);
                $("#third").attr("disabled", true);
                $("#fourth").attr("disabled", true);
                $("#fifth").attr("disabled", true);
            } else {
                currentplayer = incrementPlayer();
                gameDB.child("currentplayerIndex").set(currentplayer);
            }
        } else {
            alert("You can't play this card");
        }
    })

    document.getElementById("third").addEventListener("click", function () {
        index = leftIndex + 2;
        card = cards[index];
        if (cardToCardMatch(topCard, card)) {
            cards.splice(index, 1);
            cardsDB.set(cards);
            if (card["type"] === "drawtwo") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 2;
                } else {
                    drawcounter += 2;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "drawfour") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 4;
                } else {
                    drawcounter += 4;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "reverse") {
                playerorder.reverse();
                gameDB.child("playerorder").set(playerorder);
            }
            gameDB.orderByKey().once("value", (aGameSnap) => {
                discard = Object.values(aGameSnap.child("discarddeck").val());
                discard.push(card);
                gameDB.child("discarddeck").set(discard);
            });
            if (card["type"] === "skip") {
                currentplayer = incrementPlayer();
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            } else if (card["color"] === "wild") {
                $("#blue").attr("disabled", false);
                $("#red").attr("disabled", false);
                $("#yellow").attr("disabled", false);
                $("#green").attr("disabled", false);
                $("#first").attr("disabled", true);
                $("#second").attr("disabled", true);
                $("#third").attr("disabled", true);
                $("#fourth").attr("disabled", true);
                $("#fifth").attr("disabled", true);
            } else {
                currentplayer = incrementPlayer();
                gameDB.child("currentplayerIndex").set(currentplayer);
            }
        } else {
            alert("You can't play this card");
        }
    })

    document.getElementById("fourth").addEventListener("click", function () {
        index = leftIndex + 3;
        card = cards[index];
        if (cardToCardMatch(topCard, card)) {
            cards.splice(index, 1);
            cardsDB.set(cards);
            if (card["type"] === "drawtwo") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 2;
                } else {
                    drawcounter += 2;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "drawfour") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 4;
                } else {
                    drawcounter += 4;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "reverse") {
                playerorder.reverse();
                gameDB.child("playerorder").set(playerorder);
            }
            gameDB.orderByKey().once("value", (aGameSnap) => {
                discard = Object.values(aGameSnap.child("discarddeck").val());
                discard.push(card);
                gameDB.child("discarddeck").set(discard);
            });
            if (card["type"] === "skip") {
                currentplayer = incrementPlayer();
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            } else if (card["color"] === "wild") {
                $("#blue").attr("disabled", false);
                $("#red").attr("disabled", false);
                $("#yellow").attr("disabled", false);
                $("#green").attr("disabled", false);
                $("#first").attr("disabled", true);
                $("#second").attr("disabled", true);
                $("#third").attr("disabled", true);
                $("#fourth").attr("disabled", true);
                $("#fifth").attr("disabled", true);
            } else {
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            }
        } else {
            alert("You can't play this card");
        }
    })

    document.getElementById("fifth").addEventListener("click", function () {
        index = leftIndex + 4;
        card = cards[index];
        if (cardToCardMatch(topCard, card)) {
            cards.splice(index, 1);
            cardsDB.set(cards);
            if (card["type"] === "drawtwo") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 2;
                } else {
                    drawcounter += 2;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "drawfour") {
                extradraw = true;
                if (drawcounter === 1) {
                    drawcounter = 4;
                } else {
                    drawcounter += 4;
                }
                gameDB.child("extradraw").set(extradraw);
                gameDB.child("drawcounter").set(drawcounter);
            } else if (card["type"] === "reverse") {
                playerorder.reverse();
                gameDB.child("playerorder").set(playerorder);
            }
            gameDB.orderByKey().once("value", (aGameSnap) => {
                discard = Object.values(aGameSnap.child("discarddeck").val());
                discard.push(card);
                gameDB.child("discarddeck").set(discard);
            });
            if (card["type"] === "skip") {
                currentplayer = incrementPlayer();
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            } else if (card["color"] === "wild") {
                $("#blue").attr("disabled", false);
                $("#red").attr("disabled", false);
                $("#yellow").attr("disabled", false);
                $("#green").attr("disabled", false);
                $("#first").attr("disabled", true);
                $("#second").attr("disabled", true);
                $("#third").attr("disabled", true);
                $("#fourth").attr("disabled", true);
                $("#fifth").attr("disabled", true);
            } else {
                currentplayer = incrementPlayer();
                gameDB.child("currentplayer").set(currentplayer);
            }
        } else {
            alert("You can't play this card");
        }
    })

    cardToCardMatch = function (discardCard, myCard) {
        if (discardCard["type"] === "drawtwo" && extradraw) {
            if (myCard["type"] === "drawtwo" || myCard["type"] === "drawfour") {
                return true;
            } else {
                return false;
            }
        } else if (discardCard["type"] === "drawfour" && extradraw) {
            if (myCard["type"] === "drawfour") {
                return true;
            } else if (myCard["type"] === "drawtwo" && myCard["type"] === discardCard["tempColor"]) {
                return true;
            } else {
                return false;
            }
        } else if (discardCard["color"] === "wild") {
            if (myCard["color"] === discardCard["tempColor"]) {
                return true;
            } else if (myCard["color"] === "wild") {
                return true;
            } else {
                return false;
            }
        } else if (discardCard["type"] === myCard["type"]) {
            return true;
        } else if (discardCard["color"] === myCard["color"]) {
            return true;
        } else if (myCard["color"] === "wild") {
            return true;
        } else {
            return false;
        }
    }

    incrementPlayer = function () {
        index = playerorder.indexOf(currentplayer)
        index = (index + 1) % playerorder.length;
        currentplayer = index;
        return currentplayer;
    }

    document.getElementById("red").addEventListener("click", function () {
        gameDB.orderByKey().once("value", (aGameSnap) => {
            discard = Object.values(aGameSnap.child("discarddeck").val());
            discard[discard.length - 1]["tempColor"] = "red";
            currentplayer = incrementPlayer();
            gameDB.child("currentplayer").set(currentplayer);
            gameDB.child("discarddeck").set(discard);
        });
        $("#yellow").attr("disabled", true);
        $("#red").attr("disabled", true);
        $("#blue").attr("disabled", true);
        $("#green").attr("disabled", true);
    });

    document.getElementById("green").addEventListener("click", function () {
        gameDB.orderByKey().once("value", (aGameSnap) => {
            discard = Object.values(aGameSnap.child("discarddeck").val());
            discard[discard.length - 1]["tempColor"] = "green";
            currentplayer = incrementPlayer();
            gameDB.child("currentplayer").set(currentplayer);
            gameDB.child("discarddeck").set(discard);
        });
        $("#yellow").attr("disabled", true);
        $("#red").attr("disabled", true);
        $("#blue").attr("disabled", true);
        $("#green").attr("disabled", true);
    });

    document.getElementById("blue").addEventListener("click", function () {
        gameDB.orderByKey().once("value", (aGameSnap) => {
            discard = Object.values(aGameSnap.child("discarddeck").val());
            discard[discard.length - 1]["tempColor"] = "blue";
            currentplayer = incrementPlayer();
            gameDB.child("currentplayer").set(currentplayer);
            gameDB.child("discarddeck").set(discard);
        });
        $("#yellow").attr("disabled", true);
        $("#red").attr("disabled", true);
        $("#blue").attr("disabled", true);
        $("#green").attr("disabled", true);
    });

    document.getElementById("yellow").addEventListener("click", function () {
        gameDB.orderByKey().once("value", (aGameSnap) => {
            discard = Object.values(aGameSnap.child("discarddeck").val());
            discard[discard.length - 1]["tempColor"] = "yellow";
            gameDB.child("discarddeck").set(discard);
            currentplayer = incrementPlayer();
            gameDB.child("currentplayer").set(currentplayer);
        });
        $("#yellow").attr("disabled", true);
        $("#red").attr("disabled", true);
        $("#blue").attr("disabled", true);
        $("#green").attr("disabled", true);
    });

    document.getElementById("draw").addEventListener("click", function () {
        gameDB.orderByKey().once("value", (aGameSnap) => {
            drawDeck = [];
            if (aGameSnap.hasChild("drawdeck")) {
                drawDeck = Object.values(aGameSnap.child("drawdeck").val());
            } else {
                discardDeck = Object.values(aGameSnap.child("discarddeck").val());
                tempDeck = [];
                for (j = 0; j < discardDeck.length - 1; j++) {
                    tempDeck.push(discardDeck.shift());
                }
                tempDeck = shuffleDeck(tempDeck);
                for (j = 0; j < tempDeck.length; j++) {
                    drawDeck.push(tempDeck.shift());
                }
                gameDB.child("discarddeck").set(discardDeck);
            }
            for (i = 0; i < drawcounter; i++) {
                if (drawDeck.length > 0) {
                    cards.push(drawDeck.shift());
                    if (cards[cards.length - 1]["color"] === "wild") {
                        cards[cards.length - 1]["tempColor"] = "wild";
                    }
                }
                if (drawDeck.length === 0) {
                    discardDeck = Object.values(aGameSnap.child("discarddeck").val());
                    tempDeck = [];
                    for (j = 0; j < discardDeck.length - 1; j++) {
                        tempDeck.push(discardDeck.shift());
                    }
                    tempDeck = shuffleDeck(tempDeck);
                    for (j = 0; j < tempDeck.length; j++) {
                        drawDeck.push(tempDeck.shift());
                    }
                    gameDB.child("discarddeck").set(discardDeck);
                }
            }
            drawcounter = 1;
            extradraw = false;
            myDB.child("cards").set(cards);
            gameDB.child("drawdeck").set(drawDeck);
            gameDB.child("drawcounter").set(drawcounter);
            gameDB.child("extradraw").set(extradraw);
        });
    });

    checkForWinner = function () {
        winner = "";
        isWinner = false;
        gameDB.orderByKey().once("value", (dataSnapshot) => {
            dataSnapshot.child("players").forEach(function (snapshot) {
                if (!(snapshot.hasChild("cards"))) {
                    isWinner = true;
                    winner = snapshot.child("username").val();
                }
            });
        });
        return { "isWinner": isWinner, "winner": winner };
    }

    gamegoingFunction = function (dataSnapshot) {
        gamegoing = dataSnapshot.val();
    }
    readyFunction = function (dataSnapshot) {
        readyDB.set(true);
    }
    drawdeckFunction = function (dataSnapshot) {
        gameDB.orderByKey().once("value", function (snapshot) {
            players = Object.values(snapshot.child("players").val());
            update();
        });
    }
    discarddeckFunction = function (dataSnapshot) {
        gameDB.orderByKey().once("value", function (snapshot) {
            players = Object.values(snapshot.child("players").val());
            extradraw = snapshot.child("extradraw").val();
            drawcounter = snapshot.child("drawcounter").val();
            playerorder = snapshot.child("playerorder").val();
            currentplayer = snapshot.child("currentplayer").val();
        })
        deck = Object.values(dataSnapshot.val());
        topCard = deck[deck.length - 1];
        winnerData = checkForWinner();
        if (winnerData["isWinner"]) {
            gameDB.child("isWinner").set(winnerData["isWinner"]);
            gameDB.child("winner").set(winnerData["winner"]);
            isWinner = winnerData["isWinner"];
            winner = winnerData["winner"];
        }
        update();
    }
    cardsFunction = function (dataSnapshot) {
        cards = Object.values(dataSnapshot.val());
        update();
    }

    endingFunction = function (dataSnapshot) {
        if (dataSnapshot.val() === true) {
            readyDB.off("value", readyFunction);
            gameDB.child("gamegoing").off("value", gamegoingFunction)
            cardsDB.off("value", cardsFunction);
            gameDB.child("discarddeck").off("value", discarddeckFunction);
            gameDB.child("drawdeck").off("value", drawdeckFunction);
            gameDB.child("ending").off("value", endingFunction);
            readyDB = firebase.database().ref("games");
            myDB = firebase.database().ref("games");
            cardsDB = firebase.database().ref("games");
            gameDB = firebase.database().ref("games");
            myGamesDB = firebase.database().ref("games").child("gameObjects");
            gamename = "";
            created = "";
            maxplayers = 10;
            status = ""
            username = ""
            ready = true;
            cards = [];
            drawcounter = 1;
            topCard = {};
            playerorder = [0];
            currentplayer = 0;
            ending = false;
            numplayers = 1;
            gamegoing = false;
            extradraw = false;
            playerIndex = 0;
            leftIndex = 0;
            waiting = true;
            joined = false;
            update();
        }
    }
});