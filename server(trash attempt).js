// Import the Express.js framework
const express = require('express');
// Create an instance of the Express application named "app"
// This instance will be used for defining routes and handling requests
const app = express();

const fs=require('fs');

// Enable parsing of URL-encoded data in requests
app.use(express.urlencoded({ extended: true }));

let filename= __dirname+"/user_data.json";

let user_reg_data;

if (fs.existsSync(filename)){
    
    let data = fs.readFileSync(filename, 'utf-8');
    
    //make it something other than a string 
    user_reg_data= JSON.parse(data);
    
    //stat sync will create a stats object that has different elements such as stat size, file name, etc.  Declairing this
    let user_stats = fs.statSync(filename);
}
// Serve static files from the "public" directory
app.use(express.static(__dirname + '/public'));

// Load product data from the "products.json" file and initialize total_sold property for each product
let products = require(__dirname + '/products.json');
products.forEach((prod, i) => { prod.total_sold = 0; });

// let fs = require('fs');
let qs = require('querystring');
let crypto = require('crypto');

let loggedIn = [];

//part 4 of lab 12. Creating the username and defining it 
username = 'newuser';
user_reg_data[username] = {};
user_reg_data[username].password = 'newpass';
user_reg_data[username].email = 'newuser@user.com';

//writes the updated user data to the json file, the updated information (lines 28-31), we use this fs.writeFileSync and then the json stringify is converting the json file into a string to use
fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');

// let express = require('express');
// let app = express();


// app.use(express.urlencoded({ extended: true }));

// Define a route to handle GET requests for "./products.js". Asked chatgpt to write this code based on this question: "How can I create an Express.js route to serve a JavaScript file containing JSON data from a server?""
app.get("/products.js", function (request, response, next) {
    // Set the response type to JavaScript
    response.type('.js');
    // Convert products array to a JavaScript string and send it as the response
    let products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

// Handle POST requests to "/process_form". Chatgpt wrote this code. "How can I handle form submissions in an Express.js application to validate quantities, update product quantities, and redirect to different pages based on the results?"
app.post("/process_purchase", function (request, response) {
    // Get textbox inputs as an array
    let qtys = request.body[`quantity_textbox`];
    console.log(qtys);
    // Initially set the validity check to true
    let valid = true;
    // Initialize an empty string to hold the URL parameters
    let url = '';
    let soldArray = [];

    // Iterate over each quantity
    for (let i in qtys) {
        // Convert the quantity to a number
        let q = Number(qtys[i]);

        // Check if the quantity is valid
        if (validateQuantity(q) === '') {
            // Check if buying this quantity would result in a negative inventory
            if (products[i]['qty_available'] - q < 0) {
                valid = false;
                url += `&prod${i}=${q}`;
            }
            // If not, update total_sold and subtract from available quantity
            else {
                soldArray[i] = q;
                url += `&prod${i}=${q}`;
            }
        }
        // If the quantity is not valid, set validity to false
        else {
            valid = false;
            url += `&prod${i}=${q}`;
        }
    }

    // Check if user is logged in
    if (request.body.user) {
        url += `&user=${request.body.user}`
    }

    // Check if no products were bought
    if (url === `&prod0=0&prod1=0&prod2=0&prod3=0&prod4=0&prod5=0`) {
        valid = false;
    }

    // If validity is false, redirect to the store with an error parameter
    if (valid === false) {
        response.redirect(`store.html?error=true` + url);
    }
    else if (!url.includes("user")) {
        response.redirect('login.html?' + url);
    }
    // Otherwise, redirect to the invoice with the URL parameters attached
    else {
        // Update total_sold and quantity available for each product
        for (let i in qtys) {
            products[i]['total_sold'] += soldArray[i];
            products[i]['qty_available'] -= soldArray[i];
        }
        response.redirect('invoice.html?' + url);
    }
});

// Login Handling

app.post("/login", function (request, response) {
    let raw_user_data = fs.readFileSync("./user_data.json"); // Retrieving User Data from user_data.json
    let user_reg_data = JSON.parse(raw_user_data); // Making the user data into a parsable JSON object
    console.log(request.body);
    // Variables to hold inputted user information
    attempted_user = request.body['email'];
    // attempted_user = request.body['email'].toLowerCase();
    attempted_pass = request.body['password'];
//process login form POST and redirect to logged in page if it works, if it doesn't, it will go back to the login page. You will first get the user's entered information to store
let username_entered = request.body['username'];
let password_entered = request.body['password'];

let response_msg = '';
let errors = false;

//check if the username exists in user_reg_data
if (typeof user_reg_data[username_entered] != 'undefined'){

    //check if password matches with username
    if (password_entered == user_reg_data[username_entered].password){
        response_msg = `${username_entered} is logged in.`;
    } else {
        response_msg = `Incorrect password. Please try again.`;
        errors= true;
    }
 } else {
    response_msg = `${username_entered} does not exist.`;
    errors=true;
    }if (!errors){
    response.send(response_msg);
} else {
    response.redirect(`./login?error=${response_msg}`)
}

});
//     if (typeof user_data[attempted_user] != 'undefined') { // If: Username is present in user_data
//         if (user_data[attempted_user].password == attempted_pass) { // If: Password matches corresponding Username
//             delete request.body.password; // Get rid of password object (for privacy)
//             delete request.body.submit;
//             let split_user = attempted_user.split("@");
//             request.body.user = split_user;
//             let data = request.body;
//             stringified = qs.stringify(data);
//             loggedIn.push(attempted_user);
//             console.log(loggedIn);
//             if (Object.keys(data).length != 1) { // If: Purchase information exists
//                 response.redirect("./products_display.html?" + stringified + "&ready=yes"); // Redirect to invoice
//             } else { // Else (If only signing in)
//                 response.redirect("./products_display.html?" + stringified); // Redirect to storefront
//             }
//         } else { // Else (Incorrect Password)
//             delete request.body.email
//             delete request.body.password;
//             delete request.body.submit;
//             let data = request.body;
//             stringified = qs.stringify(data);

//             response.redirect("./login.html?error=pass&" + stringified);
//         }
//     }
//     delete request.body.email
//     delete request.body.password;
//     delete request.body.submit;
//     let data = request.body;
//     stringified = qs.stringify(data);

//     response.redirect("./login.html?error=email&" + stringified); // User doesn't exist
// });

app.post("/logout", function(request, response) {
    let indexToRemove = loggedIn.indexOf(request.body.user);
    loggedIn.splice(indexToRemove, 1);
    console.log(loggedIn);
    response.redirect("./login.html");
});

// Register

function sha256(inputPass) {
    const hash = crypto.createHash('sha256');
    hash.update(inputPass);
    return hash.digest('hex');
}

app.post("/register", function(request, response) {
    let raw_user_data = fs.readFileSync("./user_data.json");
    let user_data = JSON.parse(raw_user_data);

    register_email = request.body['email'];
    register_name = request.body['name']; 
    register_pass = request.body['password'];
    register_repass = request.body['password'];

    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-zA-Z0-9]).{10,16}$/;
    const nonLetterRegex = /[^a-zA-Z]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof(user_data[register_email]) != 'undefined') { response.redirect("./register.html?error=exists"); }
    if (emailRegex.test(register_email)) { response.redirect("./register.html?error=email"); }
    if (passwordRegex.test(register_pass)) { response.redirect("./register.html?error=pass"); }
    if (register_pass != register_repass) { response.redirect("./register.html?error=match"); }
    if (register_name.length < 2 || register_name.length > 30 || nonLetterRegex.test(register_name)) { response.redirect("./register.html?error=name"); }

    user_data[register_email] = {};
    user_data[register_email].name = register_name;
    user_data[register_email].password = sha256(register_pass);
    fs.writeFileSync("./user_data.json", JSON.stringify(user_data));

    delete request.body.email;
    delete request.body.password;
    delete request.body.repass;
    delete request.body.name;

    stringified = qs.stringify(request.body);
    if (Object.keys(request.body).length != 1) {
        response.redirect("./invoice.html?" + stringified);
    } else {
        response.redirect("./products_display.html?" + stringified);
    }

})

// Route all other GET requests to serve static files from the "public" directory
app.all('*', function (request, response, next) {
    next();
});

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

// Function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both
// If no errors in quantity, returns an empty string
function validateQuantity(quantity) {
    if (isNaN(quantity)) {
        return "Not a Number";
    } else if (quantity < 0 && !Number.isInteger(quantity)) {
        return "Negative Inventory & Not an Integer";
    } else if (quantity < 0) {
        return "Negative Inventory";
    } else if (!Number.isInteger(quantity)) {
        return "Not an Integer";
    } else {
        return "";
    }
}