var users = {};
var currentUser;
var couponTypes = ["10% discount in shops", "free keychain", "5€ gift card"];

function loadingPage() {
    setEventListeners();
    setUsers();
    setParagCurrentUser();
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
    if (location.pathname.includes("play"))
        $("#btnPlay").on("click", play);

        $("#btnLogout").on("click", logout);
}

function logout(){
    currentUser=null;
    sessionStorage.setItem('currentUser',null);
    alert("Logout successful!");
    window.location.replace("index.html");
}

function setParagCurrentUser() {
    if (location.pathname.includes("index") && currentUser!=null)
        $("#pCurrentUser").text(currentUser.name);
}

function validateAndRegister(e) {
    e.preventDefault();

    if (!checkIfUsernameAlreadyUsed())
        if (validatePassword()) {
            users[$("#inputEmail").val()] = createUser();
            sessionStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful!");
            window.location.replace("login.html");
        }

}

function createUser() {
    var dateOf_Birth=new Date($("#inputBirth").val());
    dateOf_Birth.setHours(0,0,0,0);
    return {
        email: $("#inputEmail").val(),
        password: $("#inputPassword").val(),
        name: $("#inputName").val(),
        surname: $("#inputSurname").val(),
        dateOfBirth: dateOf_Birth,
        dateOfLastPlay: "",
        gender:$('input[name="rGender"]:checked').val()
    }
}

function checkIfUsernameAlreadyUsed() {

    if (!jQuery.isEmptyObject(users))
        if (typeof users[$("#inputEmail").val()] !== 'undefined') {
            alert("Username already in use! Chose another one.");
            return true;
        }
    return false;
}

function validatePassword() {
    var isvalid = true;
    var pwd = $("#inputPassword").val();

    var errorMessage = "";
    if (pwd.length < 8 || pwd.length > 18) {
        errorMessage += "The password is not between 8 and 18 characters).\n"
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
        alert(errorMessage);

    return isvalid;
}

function login(e) {
    e.preventDefault();
    var email = $("#inputEmail").val();
    var pwd = $("#inputPassword").val();

    if (typeof users[email] === 'undefined')
        alert("This email is not registred.");
    else
        if (users[email].password !== pwd)
            alert("This password is incorrect.");
        else {
            currentUser = users[email];
            setItemInSessionStorage("currentUser", currentUser);
            alert("Login Successful!");
            window.location.replace("index.html");
        }
}

function setItemInSessionStorage(key,value){
    sessionStorage.setItem(key, JSON.stringify(value));

}

function play(e) {
    if (checkIfCanPlay()){
        $("#placeholder").text(extractCoupons());
        updateUserlist();
    }
}

function checkIfCanPlay() {
    if (checkIfLoggedIn())
        if (!checkIfAlreadyPlayed())
            if (checkIfOver18())
                return true;

    return false;
}

function checkIfAlreadyPlayed() {
    var currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    var dateOfLastPlay = new Date(currentUser.dateOfLastPlay);
    if (currentDate.getTime() == dateOfLastPlay.getTime()) {
        alert("You played already today! Come back tomorrow.");
        return true;
    } else
        return false;
}

function checkIfLoggedIn() {
    if (currentUser == null) {
        alert("You need to log in first.");
        window.location.replace("login.html");
    } else {
        return true;

    }
}

function checkIfOver18() {
    var birthDate = new Date(currentUser.dateOfBirth);
    var currentDate = new Date();

    if ((currentDate - birthDate) / 31556952000 >= 18)
        return true;
    else {
        alert("You must be at least 18 years old to play.");
        return false;
    }
}

function extractCoupons() {
    var prizeMessage = "";

    let currentDate=new Date();
    currentDate.setHours(0,0,0,0);
    currentUser.dateOfLastPlay = currentDate;

    for (var i = 0; i < 3; i++) {
        prizeMessage += assignPrize(randomNumberGen());
    }
    return prizeMessage;
}

function randomNumberGen() {
    return Math.floor(Math.random(3)*3);
}

function assignPrize(extractedNum) {

    switch (extractedNum) {
        case 0:
            return "\nYou won a " + couponTypes[0];

        case 1:
            return "\nYou won a " + couponTypes[1];

        case 2:
            return "\nYou won a " + couponTypes[2];

    }
}

function updateUserlist(){
    users[currentUser.email]=currentUser;
    setItemInSessionStorage('users', users);
}