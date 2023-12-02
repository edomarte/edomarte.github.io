var users = {}; // array that contains the registred users
var loggedInUser; // logged in user
var couponTypes = ["10% discount in shops", "free keychain", "5€ gift card"]; // Coupons that can be extracted
var couponLocation; // stores the position of the coupon in the current extraction

// loadingPage(): runs every time a page is loaded to initialize variables, set users, assign value to the placeholder in home, and check if user already played.

function loadingPage() {
    setEventListeners();
    setUsers();
    setParagloggedInUser();
    setPlayPage();
}

// setUsers(): get users array and loggedInUser value from sessionStorage, parse them through JSON, and assign them to the respective script variables.

function setUsers() {
    if (sessionStorage.getItem('users') != null)
        users = JSON.parse(sessionStorage.getItem('users'));
    if (sessionStorage.getItem('loggedInUser') != null)
        loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
}

// setEventListeners(): set event listeners on HTML items depending on the page loaded, since each page have different components. Exception: the logout button exist in all the pages.

function setEventListeners() {
    // Signup page
    if (location.pathname.includes("signup"))
        $("#form").on("submit", validateAndRegister);
    // Login page
    if (location.pathname.includes("login"))
        $("#form").on("submit", login);
    // Play page
    if (location.pathname.includes("play")) {

        $("#btnChoice1").on("click", checkResult);
        $("#btnChoice2").on("click", checkResult);
        $("#btnChoice3").on("click", checkResult);
    }
    // Button logout
    $("#btnLogout").on("click", logout);
}

// logout(): clear the loggedInUser variable and nullifies the sessionStorage 'loggedInUser' item. Then shows an alert 'Logout successful!' and redirect to the homepage.

function logout() {
    loggedInUser = null;
    sessionStorage.setItem('loggedInUser', null);
    alert("Logout successful!");
    window.location.replace("index.html");
}

// setParagloggedInUser(): set the value for the placeholder in the homepage to the name of the logged in user.

function setParagloggedInUser() {
    if (location.pathname.includes("index") && loggedInUser != null)
        $("#ploggedInUser").text("Hello " + loggedInUser.name + "!");
}

// setPlayPage(): set the components of the 'play' page depending on if the user is allowed to play.

function setPlayPage() {
    if (location.pathname.includes("play")) { // check if the page is 'play'
        if (!isAllowedToPlay())  // runs the validation function isAllowedToPlay()
            hideChoiceButtons(); // it hides the choiceButtons, to be shown only after the 'play' button is clicked
        else
            play();
    }
}

// validateAndRegister(e): event fired when 'Register' button is clicked on the registration page.

function validateAndRegister(e) {
    e.preventDefault(); // It prevents the page refresh

    if (isUsernameFree()) // check if the chosen username is free
        if (isPasswordValid()) { // check if the chosen password is valid.
            users[$("#inputEmail").val()] = createUser(); // it creates a new user in the array with the registration email as array item's 'id'
            setItemInSessionStorage("users", users); // update the 'users' array in the sessionStorage
            alert("Registration successful!");
            window.location.replace("login.html"); // redirect to the login page
        }

}

// createUser(): it creates a new "user" item in the users array. Gets the birth date from the form input. Return an object ("user") with valued items from the form inputs.

function createUser() {
    var dateOf_Birth = new Date($("#inputBirth").val());
    dateOf_Birth.setHours(0, 0, 0, 0); // set the object hours, minutes, seconds, and milliseconds to 0 for a correct comparison with the current date in the function notAlreadyPlayed().
    return {
        email: $("#inputEmail").val(),
        password: $("#inputPassword").val(),
        name: $("#inputName").val(),
        surname: $("#inputSurname").val(),
        dateOfBirth: dateOf_Birth,
        dateOfLastPlay: "",
        attemptsLeft: 3,
        wonPrizes: 0,
        gender: $('input[name="rGender"]:checked').val() // get the value from the checked radio input for gender.
    }
}

// isUsernameFree(): returns if the username/email chosen during the registration is not already taken by another previous user.

function isUsernameFree() {

    if (!jQuery.isEmptyObject(users))   // check if any user exist by checking if the users array is empty
        if (typeof users[$("#inputEmail").val()] !== 'undefined') {     // check if the chosen username/email is taken by verifying if an element in the array with the chosen username/email as id exist.
            $("#userErrorplaceholder").text("Username already in use! Chose another one."); // valorize the placeholder with the error message.
            return false;
        }
    return true;
}

// isPasswordValid(): return if the chosen password in the registration from respects the given parameters. Regular expressions are used for checking string content.

function isPasswordValid() {
    var isvalid = true;
    resetLiPasswordRequirementColor(); // reset pwd requirement list color
    var pwd = $("#inputPassword").val();

    // if any of the conditions is not respected, it sets the boolean variable isValid to false. 
    // It colors the unrespected requirement message to red to highlight the missing requirement to the user.                   

    if (pwd.length < 8 || pwd.length > 18) {    // check pwd lenght
        $("#liLenght").addClass("password_requirement_missing");
        isvalid = false;
    }

    var pattern = /[0-9]/g;
    if (!pwd.match(pattern)) {      // check if pwd contains at least one number
        $("#liNumber").addClass("password_requirement_missing");
        isvalid = false;
    }

    pattern = /[a-z]/g;
    if (!pwd.match(pattern)) {      // check if pwd contains at least one lowercase character
        $("#liLowerChar").addClass("password_requirement_missing");
        isvalid = false;
    }

    pattern = /[A-Z]/g;
    if (!pwd.match(pattern)) {      // check if pwd contains at least one uppercase character
        $("#liUpperChar").addClass("password_requirement_missing");
        isvalid = false;
    }

    pattern = /[@#$%^&-+=()]/g;
    if (!pwd.match(pattern)) {      // check if pwd contains at least one special character
        $("#liSpecialChar").addClass("password_requirement_missing");
        isvalid = false;
    }

    return isvalid;
}

// resetLiPasswordRequirementColor(): remove class .password_requirement_missing from the li element of the password requirement list #pwdRequirements in the signup page.

function resetLiPasswordRequirementColor() {
    $("#liLenght").removeClass("password_requirement_missing");
    $("#liNumber").removeClass("password_requirement_missing");
    $("#liUpperChar").removeClass("password_requirement_missing");
    $("#liLowerChar").removeClass("password_requirement_missing");
    $("#liSpecialChar").removeClass("password_requirement_missing");
}

// login(e): event fired by clicking on the 'btnLogin' in the login page.

function login(e) {
    e.preventDefault();
    // get the values from the input form
    var email = $("#inputEmail").val();
    var pwd = $("#inputPassword").val();

    if (typeof users[email] === 'undefined')    // check if a user item with the login email as id exist. If not, return error in the placeholder.
        $("#userErrorplaceholder").text("This email is not registred.");
    else
        if (users[email].password !== pwd)  // check if the login password matches the one registered in the user object with the login email as id in the users array. If not, return error in the placeholder.
            $("#pwdErrorplaceholder").text("This password is incorrect.");
        else {
            // if user and pwd are correct, set the loggedInUser as the logged in user, update the loggedInUser in the sessionStorage, show an alert with 'Login Successful!', and redirect to the homepage.
            loggedInUser = users[email];
            updateSessionloggedInUser();
            alert("Login Successful!");
            window.location.replace("index.html");
        }
}

// setItemInSessionStorage(key, value): set the value of 'key' item in sessionStorage at 'value'. Uses JSON to stringify the value.

function setItemInSessionStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

// play(e): event fired by clicking on the 'btnPlay' in the play page.      

function play() {

    setCouponLocation(); // set the coupon location for the current play round
    $("#placeholder").text("Guess under which card is the coupon! You have " + loggedInUser.attemptsLeft + " attempts for today."); // shows the instructions for playing and the attempts left in a placeholder (field in loggedInUser)

}

// checkResult(e): event fired by clicking on the coupon cards. Check if the clicked card is the one associated with the coupon or not and inform the user.

function checkResult(e) {
    var choice = $(e.target).attr('choiceNum');
    if (choice == couponLocation) {
        $("#placeholder").text("You found the coupon!");
        loggedInUser.wonPrizes++;
    } else {
        $("#placeholder").text("The coupon was under card " + (couponLocation + 1) + ".");
    }

    // Reduce the attempts left for the day on the loggedInUser object and inform the user.
    loggedInUser.attemptsLeft--;
    $("#placeholder").append(" Attempts left for today: " + loggedInUser.attemptsLeft);

    // If there is no attempt left, calls the actionsWhenAttemptsFinish() function.
    if (loggedInUser.attemptsLeft == 0)
        actionsWhenAttemptsFinish();

    // Call the methods for updating sessionStorage users and loggedInUser objects.
    updateSessionloggedInUser();
    updateSessionUserlist();

    // Set new coupon location for the next round.
    setCouponLocation();
}

// actionsWhenAttemptsFinish(): actions when the user has no more guessing attempts at finding the coupons.

function actionsWhenAttemptsFinish() {
    setDateOfLastPlayToToday(); // set the day of last play to loggedInUser. 
    $("#placeholder").append("<br></br><b>It was your last attempt for today! Come back tomorrow to play again.</b> " +
        "<br></br>"); // Informs the user it was the last attempt. 

    // If the user won any prizes, extract the coupons and inform the user.
    if (loggedInUser.wonPrizes > 0)
        $("#placeholder").append("Here are the coupons you won today: " + extractCoupons());
    // Hide choicebuttons to prevent further play.
    hideChoiceButtons();
}

// showChoiceButtons(): shows the choice buttons (cards)

function showChoiceButtons() {
    $("#btnChoice1").show();
    $("#btnChoice2").show();
    $("#btnChoice3").show();
}

// hideChoiceButtons(): hide the choice buttons (cards)

function hideChoiceButtons() {
    $("#btnChoice1").hide();
    $("#btnChoice2").hide();
    $("#btnChoice3").hide();
}

// setCouponLocation(): set variable couponLocation to a randomly generated number.

function setCouponLocation() {
    couponLocation = randomNumberGen();
}

// isAllowedToPlay(): return the result of the validation of the player attempt to play.

function isAllowedToPlay() {
    return isLoggedIn() && notAlreadyPlayed() && isOver18();
}

// notAlreadyPlayed(): check if the user played already on the same day.

function notAlreadyPlayed() {
    // Get the current date and set hours, minutes, seconds, and milliseconds to 0 to allow comparison with user's date of last play.
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    // Get user's date of last play.
    var dateOfLastPlay = new Date(loggedInUser.dateOfLastPlay);
    // Check if the dates are the same. If so, return error message, otherwise resets the attemptLeft counter to 3.
    if (currentDate.getTime() == dateOfLastPlay.getTime()) {
        $("#placeholder").text("You played already today! Come back tomorrow.");
        return false;
    } else {
        loggedInUser.attemptsLeft = 3;
        return true;
    }
}

// isLoggedIn(): check if there is a logged in user verifying that loggedInUser is not null. If null, shows an error alert and redirect to the login page.

function isLoggedIn() {
    if (loggedInUser == null) {
        alert("You need to log in first.");
        window.location.replace("login.html");
        return false;
    } else {
        return true;
    }
}

// isOver18(): check if the user is over 18.

function isOver18() {
    // Get user's birth date.
    var birthDate = new Date(loggedInUser.dateOfBirth);
    var currentDate = new Date();

    // Check if the difference between today's date and the user's birth date is over 18 years; if not, shows an error message. 
    // 31556952000 is the number of milliseconds in an year
    if ((currentDate - birthDate) / 31556952000 >= 18)
        return true;
    else {
        $("#placeholder").text("You must be at least 18 years old to play.");
        return false;
    }
}

// extractCoupons(): extract a coupon for each prize won by the user.

function extractCoupons() {
    var prizeMessage = "";

    for (var i = 0; i < loggedInUser.wonPrizes; i++) {
        prizeMessage += assignPrize(randomNumberGen());
    }
    return prizeMessage;
}

// setDateOfLastPlayToToday(): set the date of last play to today to the loggedInUser.

function setDateOfLastPlayToToday() {
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    loggedInUser.dateOfLastPlay = currentDate;
}

// randomNumberGen(): generates a random number between 0 and 2.

function randomNumberGen() {
    return Math.floor(Math.random(3) * 3);
}

// assignPrize(extractedNum): return a message with the coupon extracted given a number as parameter.

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

// updateSessionUserlist(): updates the sessionStorage 'users' array with the current 'users' object.

function updateSessionUserlist() {
    users[loggedInUser.email] = loggedInUser;
    setItemInSessionStorage('users', users);
}

// updateSessionloggedInUser(): updates the sessionStorage 'loggedInUser' object with the current 'loggedInUser' object.

function updateSessionloggedInUser() {
    setItemInSessionStorage('loggedInUser', loggedInUser);
}



let items = document.querySelectorAll('.slider .item');
    let next = document.getElementById('next');
    let prev = document.getElementById('prev');
    
    let active = 1;
    function loadShow(){
        let stt = 0;
        items[active].style.transform = `none`;
        items[active].style.zIndex = 1;
        items[active].style.filter = 'none';
        items[active].style.opacity = 1;
        for(var i = active + 1; i < items.length; i++){
            stt++;
            items[i].style.transform = `translateX(${120*stt}px) scale(${1 - 0.2*stt}) perspective(16px) rotateY(-1deg)`;
            items[i].style.zIndex = -stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
        stt = 0;
        for(var i = active - 1; i >= 0; i--){
            stt++;
            items[i].style.transform = `translateX(${-120*stt}px) scale(${1 - 0.2*stt}) perspective(16px) rotateY(1deg)`;
            items[i].style.zIndex = -stt;
            items[i].style.filter = 'blur(5px)';
            items[i].style.opacity = stt > 2 ? 0 : 0.6;
        }
    }
    loadShow();
    next.onclick = function(){
        active = active + 1 < items.length ? active + 1 : active;
        loadShow();
    }
    prev.onclick = function(){
        active = active - 1 >= 0 ? active - 1 : active;
        loadShow();
    }