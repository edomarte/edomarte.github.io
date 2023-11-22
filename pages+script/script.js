var users = {};
var currentUser;
var couponTypes = ["10% discount in shops", "free keychain", "5€ gift card"];
var couponLocation;

function loadingPage() {
    setEventListeners();
    setUsers();
    setParagCurrentUser();
    userAlreadyPlayed();
}

function setUsers() {
    if (sessionStorage.getItem('users') != null)
        users = JSON.parse(sessionStorage.getItem('users'));
    if (sessionStorage.getItem('currentUser') != null)
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
}

function setEventListeners() {
    if (location.pathname.includes("signup"))
        $("#form").on("submit", validateAndRegister);
    if (location.pathname.includes("login"))
        $("#form").on("submit", login);
    if (location.pathname.includes("play")) {
        $("#btnPlay").on("click", play);
        $("#btnChoice1").on("click", checkResult);
        $("#btnChoice2").on("click", checkResult);
        $("#btnChoice3").on("click", checkResult);
    }
    $("#btnLogout").on("click", logout);
}



function logout() {
    currentUser = null;
    sessionStorage.setItem('currentUser', null);
    alert("Logout successful!");
    window.location.replace("index.html");
}

function setParagCurrentUser() {
    if (location.pathname.includes("index") && currentUser != null)
        $("#pCurrentUser").text(currentUser.name);
}

function userAlreadyPlayed() {
    if (location.pathname.includes("play") && currentUser != null)
        if (!isAllowedToPlay()) {
            $("#btnPlay").hide();

        }
    hideChoiceButtons();
}

function validateAndRegister(e) {
    e.preventDefault();

    if (isUsernameFree())
        if (isPasswordValid()) {
            users[$("#inputEmail").val()] = createUser();
            setItemInSessionStorage("users", users);
            alert("Registration successful!");
            window.location.replace("login.html");
        }

}

function createUser() {
    var dateOf_Birth = new Date($("#inputBirth").val());
    dateOf_Birth.setHours(0, 0, 0, 0);
    return {
        email: $("#inputEmail").val(),
        password: $("#inputPassword").val(),
        name: $("#inputName").val(),
        surname: $("#inputSurname").val(),
        dateOfBirth: dateOf_Birth,
        dateOfLastPlay: "",
        attemptsLeft: 3,
        wonPrizes: 0,
        gender: $('input[name="rGender"]:checked').val()
    }
}

function isUsernameFree() {

    if (!jQuery.isEmptyObject(users))
        if (typeof users[$("#inputEmail").val()] !== 'undefined') {
            $("#userErrorplaceholder").text("Username already in use! Chose another one.");
            return false;
        }
    return true;
}

function isPasswordValid() {
    var isvalid = true;
    var pwd = $("#inputPassword").val();

    var errorMessage = "";
    if (pwd.length < 8 || pwd.length > 18) {
        errorMessage += "The password is not between 8 and 18 characters.\n"
        isvalid = false;
    }

    var pattern = /[0-9]/g;
    if (!pwd.match(pattern)) {
        errorMessage += "The password doesn't contain at least a number.\n"
        isvalid = false;
    }

    pattern = /[a-z]/g;
    if (!pwd.match(pattern)) {
        errorMessage += "The password doesn't contain at least a lower case letter.\n"
        isvalid = false;
    }

    pattern = /[A-Z]/g;
    if (!pwd.match(pattern)) {
        errorMessage += "The password doesn't contain at least an upper case letter.\n"
        isvalid = false;
    }

    pattern = /[@#$%^&-+=()]/g;
    if (!pwd.match(pattern)) {
        errorMessage += "The password doesn't contain one at least a special character @#$%^&-+=()."
        isvalid = false;
    }
    if (!isvalid)
        $("#pwdErrorplaceholder").text(errorMessage);

    return isvalid;
}

function login(e) {
    e.preventDefault();
    var email = $("#inputEmail").val();
    var pwd = $("#inputPassword").val();

    if (typeof users[email] === 'undefined')
        $("#userErrorplaceholder").text("This email is not registred.");
    else
        if (users[email].password !== pwd)
            $("#pwdErrorplaceholder").text("This password is incorrect.");
        else {
            currentUser = users[email];
            updateSessionCurrentUser();
            alert("Login Successful!");
            window.location.replace("index.html");
        }
}

function setItemInSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function play(e) {
    //$("#placeholder").text(extractCoupons());
    $("#btnPlay").hide();
    setCouponLocation();
    $("#placeholder").text("Guess under which card is the coupon! You have " + currentUser.attemptsLeft + " attempts for today.");
    showChoiceButtons();
}

function checkResult(e) {
    var choice = $(e.target).attr('choiceNum');
    if (choice == couponLocation) {
        $("#placeholder").text("You found the coupon!");
        currentUser.wonPrizes++;
    } else {
        $("#placeholder").text("The coupon was under card " + (couponLocation + 1) + ".");
    }

    currentUser.attemptsLeft--;
    $("#placeholder").append(" Attempts left for today: " + currentUser.attemptsLeft);



    if (currentUser.attemptsLeft == 0)
        actionsWhenAttemptsFinish();

    updateSessionCurrentUser();
    updateSessionUserlist();

    setCouponLocation();
}

function actionsWhenAttemptsFinish() {
    setDateOfLastPlayToToday();
    $("#placeholder").append("<br></br><b>It was your last attempt for today! Come back tomorrow to play again.</b> " +
        "<br></br>");
    if (currentUser.wonPrizes > 0)
        $("#placeholder").append("Here are the coupons you won today: " + extractCoupons());
    hideChoiceButtons();
}

function showChoiceButtons() {
    $("#btnChoice1").show();
    $("#btnChoice2").show();
    $("#btnChoice3").show();
}

function hideChoiceButtons() {
    $("#btnChoice1").hide();
    $("#btnChoice2").hide();
    $("#btnChoice3").hide();
}

function setCouponLocation() {
    couponLocation = randomNumberGen(1);
}

function isAllowedToPlay() {
    return isLoggedIn() && notAlreadyPlayed() && isOver18();
}

function notAlreadyPlayed() {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    var dateOfLastPlay = new Date(currentUser.dateOfLastPlay);
    if (currentDate.getTime() == dateOfLastPlay.getTime()) {
        $("#placeholder").text("You played already today! Come back tomorrow.");
        return false;
    } else {
        currentUser.attemptsLeft = 3;
        return true;
    }
}

function isLoggedIn() {
    if (currentUser == null) {
        alert("You need to log in first.");
        window.location.replace("login.html");
        return false;
    } else {
        return true;
    }
}

function isOver18() {
    var birthDate = new Date(currentUser.dateOfBirth);
    var currentDate = new Date();

    //31556952000 is the number of milliseconds in an year
    if ((currentDate - birthDate) / 31556952000 >= 18)
        return true;
    else {
        $("#placeholder").text("You must be at least 18 years old to play.");
        return false;
    }
}

function extractCoupons() {
    var prizeMessage = "";

    for (var i = 0; i < currentUser.wonPrizes; i++) {
        prizeMessage += assignPrize(randomNumberGen());
    }
    return prizeMessage;
}

function setDateOfLastPlayToToday() {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    currentUser.dateOfLastPlay = currentDate;
}

function randomNumberGen() {
    return Math.floor(Math.random(3) * 3);
}

function assignPrize(extractedNum) {

    switch (extractedNum) {
        case 0:
            return "You won a " + couponTypes[0] + "!<br></br>";

        case 1:
            return "You won a " + couponTypes[1] + "!<br></br>";

        case 2:
            return "You won a " + couponTypes[2] + "!<br></br>";

    }
}

function updateSessionUserlist() {
    users[currentUser.email] = currentUser;
    setItemInSessionStorage('users', users);
}

function updateSessionCurrentUser() {
    setItemInSessionStorage('currentUser', currentUser);
}