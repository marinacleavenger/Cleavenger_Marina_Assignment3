
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();
const fs = require('fs');
const qs = require('querystring');

// referenced from Professor Sal's video 
app.use(express.urlencoded({ extended: true }));

// Route all other GET requests to serve static files from a directory named "public"
app.use(express.static(__dirname + '/Public'));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});


let filename = __dirname + "/user_data.json";

if (fs.existsSync(filename)) {
    // Read user_data data and save it as variable
    var user_data = fs.readFileSync(filename, "utf-8");

    // Convert user_data to object
    var user_data = JSON.parse(user_data);

    // If file is not found
} else {
    console.log(`File ${filename} was not found!`);
}
// Middleware for decoding form data
app.use(express.urlencoded({ extended: true }));

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
// Convert the JS string into a JSON string and embed it within letiable products
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

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



// Route all other GET requests to serve static files from a directory named "public"
app.all('*', function (request, response, next) {
    // console.log(request.method + ' to ' + request.path);
    next();
});


//login page 
app.post("/login", function (request, response, next) {

    // Initialize empty errors
    const errors = {};

    // Create letiables username & password - referenced from Assignment 2 example code
    let username = request.body["username"].toLowerCase();
    let password = request.body["password"];

    // Check if username is empty
    if (username == "") {
        errors[`email_error`] = "Enter your email address!";

        // Create a regular expression to check if username is in valid format
        // Code referenced from w3schools + ChatGPT
    } else if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(username)) {
        errors[`email_error`] = `${username} is in an invalid format.`;

        // Check if username email is in user data file
    } else if (user_data.hasOwnProperty(username) !== true) {
        errors[`username_error`] = `${username} is not a registered email.`;

        // Check if password is empty 
    } else if (password == "") {
        errors[`password_error`] = "Enter a password.";

        // IR1: Encrypt the password and check it against the user_data encrypted password
    } else if (hashPassword(password) !== user_data[username].password) {
        errors[`password_error`] = "Password is incorrect.";
    } else {
        let name = user_data[username].name;
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
//end login page 

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
        errors["username"].push("Please enter a valid email address.");

        // Checks format of username to see if it is a valid email address, regex referenced from ChatGPT
    } else if (!/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(username)) {
        errors["username"].push("Please enter a valid email address!");

        // Checks if the email is already in our user_data.json file
    } else if (typeof user_data[username] != "undefined") {
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
        // Save new registration info into user_data.json
        user_data[username] = {};
        user_data[username].name = request.body.name;
        // IR1: Store encrypted password into user_data
        user_data[username].password = hashPassword(request.body.password);
        // Write to our user_data.json file, we add the null and 2 option to account for a null replacer, and indentation
        fs.writeFileSync(filename, JSON.stringify(user_data, null, 2));

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
        response.redirect("./registration.html?" + params.toString());
    }
});

// //IR5: Logout route that sends user to login page
// app.post('/logout', (request, response) => {
//     // Get username and index of that username in loggedInUsers array
//     const username = request.body["username"];
//     const index = loggedInUsers.indexOf(username);

//     // Remove username from loggedInUsers array (logging the user out)
//     if (index !== -1) {
//         loggedInUsers.splice(index, 1);
//     }

//     // Redirect the user to the login page after logout
//     response.redirect('/login.html');
// });

// Serve static files
app.use(express.static(__dirname + '/public'));

// Start server
app.listen(8080, () => console.log(`listening on port 8080`));

function findNonNegInt(q, returnErrors = false) {
    const errors = [];
    if (Number(q) != q) errors.push('Please enter a number!'); // Check if string is a number value
    if (q < 0) errors.push('Please enter a non-negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('This is not an integer!'); // Check that it is an integer

    return returnErrors ? errors : errors.length === 0;
};