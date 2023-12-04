
const express = require('express');
const app = express();
const querystring = require('querystring');
const products = require(__dirname + '/products.json');
const fs = require("fs");

// IR1: Use crypto library to encrypt password
const crypto = require('crypto');

function hashPassword(password) {
    //We use any secret key of our choosing, here we use test.
    const secret = 'test';
    // Create hashed password, code referenced from ChatGPT
    const hash = crypto.createHmac('sha256', secret).update(password).digest('hex');
    return hash;
}

// We use user_registration_info.json to hold users registration data (name, password, email)
let filename = "./user_data.json";
let user_registration_info_obj_JSON;
let user_registration_info; 

if (fs.existsSync(filename)) {
    // Read user_registration_info data and save it as variable
    user_registration_info_obj_JSON = fs.readFileSync(filename, "utf-8");

    // Convert user_registration_info to object
     user_registration_info = JSON.parse(user_registration_info_obj_JSON);

    // If file is not found
} else {
    console.log(`File ${filename} was not found!`);
}
// Middleware for decoding form data
app.use(express.urlencoded({ extended: true }));


// IR4: Keep track of the number of times a user logged in and the last time they logged in.
const userLoginInfo = {};

// Middleware to keep track of user logins - code referenced from ChatGPT
app.use((request, response, next) => {
    // Get username (email)
    const username = request.body.username;
    if (username) {
        // Check if userLoginInfo object already has an entry for this user, if it doesn't then add it
        if (!userLoginInfo[username]) {
            userLoginInfo[username] = {
                loginCount: 1,
                lastLogin: new Date(),
            };
            // If userLoginInfo object already has an entry, just update loginCount and lastLogin
        } else {
            userLoginInfo[username].loginCount++;
            userLoginInfo[username].lastLogin = new Date();
        }
    }

    // Use the next() function to pass control to the next middleware/route handler.
    // In this case, it would pass control back to the login route handler.
    next();
});

// Log all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});

//sets up the product array from the json file
// let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
// Convert the JS string into a JSON string and embed it within variable products
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// IR5:  Keep track of the number of users currently logged in to the site and display this number with the personalization information.
// This is the global array variable
const loggedInUsers = [];

// Route for getting number of logged in users
app.get('/getLoggedInUsers.js', (request, response) => {
    // We just used the same code as products_data.js but modified it for numLoggedInUsers
    response.type('.js');
    const numLoggedInUsers = `const numLoggedInUsers = ${loggedInUsers.length}`;
    response.send(numLoggedInUsers);
})

/
//Copied from Laulima. This is naming the products.json file to be posting the process_purchase 
app.post("/process_purchase", function (request, response) {

    //Referenced from Aaron Kim: Textboxs in the array
    let qtys = request.body[`quantity_textbox`];

    //Set the valididy check to automatically true 
    let valid = true;

    //This is an empty string so the url will go in it 
    let url = '';
    let soldArray =[];

    //// Iterate through elements in the array 'qtys'
    for (i in qtys) {
        
        //Set q as the number
        let q = Number(qtys[i]);
        
        // The code validates user-entered quantities for purchase against available stock. It updates data structures and flags based on the validation results        
        if (validateQuantity(q)=='') {
            if(products[i]['qty_available'] - Number(q) < 0){
                valid = false;
                url += `&prod${i}=${q}`
            }
            // If above does not execute, then calculate sold, and subtract from available quantity 
            else{
               
                soldArray[i] = Number(q);
                
                //adding to url 
                url += `&prod${i}=${q}`
            }
            
            
        }
        // This part of the code flags as invalid any unsuccessful attempts to buy products or when no products are selected for purchase
        else {
            
            valid = false;
            url += `&prod${i}=${q}`
        }
        //If no products were bought, set valid to false. The url will display as followed. 
        if(url == `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`){
            valid = false
        }
    }
    // This code redirects users to a page indicating an error in the purchase attempt if the 'valid' flag is set to 'false', passing along additional information through URL parameters
    if(valid == false)
    {
       
        response.redirect(`products_display.html?error=true` + url);
        
        
    }
    //If it does not it will redirect to the invoice with the url attached
    else{

         for (i in qtys)
        {
            //Update total and qty only if there are no errors
            products[i]['total_sold'] += soldArray[i];
            products[i]['qty_available'] -= soldArray[i];
        }
        
        response.redirect('invoice.html?' + url);
        
    }
 });


// Login route, this is a post request and processes username and password against data in user_registration_info.json
app.post("/login", function (request, response, next) {

    // Initialize empty errors
    const errors = {};

    // Create variables username & password - referenced from Assignment 2 example code
    let username = request.body["username"].toLowerCase();
    let password = request.body["password"];

    // Check if username is empty
    if (username == "") {
        errors[`email_error`] = "Enter an email address!";

        // Create a regular expression to check if username is in valid format
        // Code referenced from w3schools + ChatGPT
    } else if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(username)) {
        errors[`email_error`] = `${username} is in an invalid format.`;

        // Check if username email is in user data file
    } else if (user_registration_info.hasOwnProperty(username) !== true) {
        errors[`username_error`] = `${username} is not a registered email.`;

        // Check if password is empty 
    } else if (password == "") {
        errors[`password_error`] = "Enter a password.";

        // IR1: Encrypt the password and check it against the user_registration_info encrypted password
    } else if (hashPassword(password) !== user_registration_info[username].password) {
        errors[`password_error`] = "Password is incorrect.";
    } else {
        let name = user_registration_info[username].name;
    }

    // If all the login information is valid, redirect to invoice.html with quantities of items purchased, and username and name of user
    if (Object.keys(errors).length === 0) {

        // Get info about number of logins and last time logged in
        const loginInfo = userLoginInfo[username];

        // IR5: Add username to keep track of amount of logged in users
        // Check if loggedInUsers already has the username so that we don't login more than once for the same user
        if (!loggedInUsers.includes(username)) {
            loggedInUsers.push(username);
        }

        // Create params variable and add username and name fields
        let params = new URLSearchParams(request.body);
        params.append("username", username);
        params.append("loginCount", loginInfo.loginCount);
        params.append("lastLogin", loginInfo.lastLogin);
        params.append("name", name);

        // Redirect to invoice.html with the new params values
        response.redirect("./invoice.html?" + params.toString());
    }
    // If login information is invalid, redirects to login page and gives error
    else {
        // Create params variable and add username, name, and errorString fields
        let params = new URLSearchParams(request.body);
        params.append("username", username);
        params.append("name", name);
        params.append("errorString", JSON.stringify(errors));
        // Redirect to login.html with new params values
        response.redirect("./login.html?" + params.toString());
    }
});

// Register route, this is a post request and is referenced from the Assignment 2 example code.
app.post("/register", function (request, response, next) {
    // Set variables from request.body
    let username = request.body["username"].toLowerCase();
    let password = request.body["password"];
    let confirmPassword = request.body["confirmPassword"];
    let name = request.body["name"];

    // Initialize empty errors
    let errors = {};

    // Initialize different error types with empty arrays
    errors["username"] = [];
    errors["name"] = [];
    errors["password"] = [];
    errors["confirmPassword"] = [];

    // Checks if username is blank
    if (username == "") {
        errors["username"].push("Please enter an email address.");

        // Checks format of username to see if it is a valid email address, regex referenced from ChatGPT
    } else if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(username)) {
        errors["username"].push("Please enter a valid email address!");

        // Checks if the email is already in our user_registration_info.json file
    } else if (typeof user_registration_info[username] != "undefined") {
        errors["username"].push(`${username} is already registered. Please use a different email address.`);
    }

    // Check if name is blank
    if (name == "") {
        errors["name"].push("Please enter a name (First and Last).");

        // Check if name is in valid First space Last name format, regex referenced from ChatGPT
    } else if (!/^[a-zA-Z]+\s+[a-zA-Z]+$/.test(name)) {
        errors["name"].push("Please enter a first and last name separated by a space.");

        // Check if name is proper length (2 > name.length < 30)
    } else if (name.length > 30 || name.length < 2) {
        errors["name"].push("Please enter a name greater than 2 characters and less than 30 characters.");
    }

    // Check if password is blank
    if (password == "") {
        errors["password"].push("Please enter a password.");

        // Check if password contains spaces, regex referenced from ChatGPT
    } else if (!/^\S+$/.test(password)) {
        errors["password"].push("Password cannot have spaces. Please try again.");

        // IR2: Require that passwords have at least one number and one special character, regex referenced from ChatGPT
    } else if (!/^(?=.*\d)(?=.*\W).+$/.test(password)) {
        errors["password"].push("Password must contain at least one letter, one number, and one special character.");

        // Check if confirm password is empty
    } else if (confirmPassword == "") {
        errors["confirmPassword"].push("Please confirm your password.");

        // Check if password and confirm password match
    } else if (password !== confirmPassword) {
        errors["confirmPassword"].push("Passwords do not match.");
    }

    // Check if password is correct length (10 <= password.length <= 16)
    if ((password.length < 10 && password.length >= 1) || password.length > 16) {
        errors["password"].push("Password length must be between 10 and 16 characters.");
    }

    // Check count of errors, if 0 then we redirect user to invoice.html else there are errors and redirect to registration page
    let countErrors = 0;

    // Loop through errors
    for (let error in errors) {
        countErrors += errors[error].length;
    }

    // If there are no errors, we redirect to invoice.html 
    if (countErrors === 0) {
        // Save new registration info into user_registration_info.json
        user_registration_info[username] = {};
        user_registration_info[username].name = request.body.name;
        // IR1: Store encrypted password into user_registration_info
        user_registration_info[username].password = hashPassword(request.body.password);
        // Write to our user_registration_info.json file, we add the null and 2 option to account for a null replacer, and indentation
        fs.writeFileSync(filename, JSON.stringify(user_registration_info, null, 2));

        // Get info about number of logins and last time logged in
        const loginInfo = userLoginInfo[username];

        // IR5: Add username to keep track of amount of logged in users
        // Check if loggedInUsers already has the username so that we don't login more than once for the same user
        if (!loggedInUsers.includes(username)) {
            loggedInUsers.push(username);
        }

        // Create params variable and add username and name fields
        let params = new URLSearchParams(request.body);
        params.append("username", username);
        params.append("name", name);
        params.append("loginCount", loginInfo.loginCount);
        params.append("lastLogin", loginInfo.lastLogin);
        response.redirect("./invoice.html?" + params.toString());

        return;
        // If any errors exist, redirect to registration.html with the errors
    } else {
        let params = new URLSearchParams();
        params.append("username", username);
        params.append("name", name);
        params.append("errorString", JSON.stringify(errors));
        response.redirect("./register.html?" + params.toString());
    }
});

//IR5: Logout route that sends user to login page
app.post('/logout', (request, response) => {
    // Get username and index of that username in loggedInUsers array
    const username = request.body["username"];
    const index = loggedInUsers.indexOf(username);

    // Remove username from loggedInUsers array (logging the user out)
    if (index !== -1) {
        loggedInUsers.splice(index, 1);
    }

    // Redirect the user to the login page after logout
    response.redirect('/login.html');
});

// Serve static files
app.use(express.static(__dirname + '/public'));

// Start server
app.listen(8080, () => console.log(`listening on port 8080`));

//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
//if no errors in quantity, returns empty string
function validateQuantity(quantity){
    //console.log(quantity);
    if(isNaN(quantity)){
        return "Not a Number";
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Negative Inventory & Not an Integer";
    }else if (quantity <0){
        return "Negative Inventory";
    }else if(!Number.isInteger(quantity)){
        return "Not an Integer";
    }else{
        return"";
    }

}

// Start the server; listen on port 8080 for incoming HTTP requests
// app.listen(8080, () => console.log(`listening on port 8080`));

// function findNonNegInt(q, returnErrors = false) {
//     const errors = [];
//     if (Number(q) != q) errors.push('Please enter a number!'); // Check if string is a number value
//     if (q < 0) errors.push('Please enter a non-negative value!'); // Check if it is non-negative
//     if (parseInt(q) != q) errors.push('This is not an integer!'); // Check that it is an integer

//     return returnErrors ? errors : errors.length === 0;
// };