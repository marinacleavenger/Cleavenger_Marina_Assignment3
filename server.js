// Server.js is mostly compiled from  from the Lualima Assignment 1 instructions and Professor Sal's Video
// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();

// referenced from Professor Sal's video 
app.use(express.urlencoded({ extended: true }));

// Route all other GET requests to serve static files from a directory named "public"
app.use(express.static(__dirname + '/Public'));

//sets up the product array from the json file
let products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

// Define a route for handling a GET request to a path that matches "./products.js"
app.get("/products.js", function (request, response, next) {
    response.type('.js');
// Convert the JS string into a JSON string and embed it within variable products
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

///////////////////////// app post for login////////////////////////////////////
app.post("/login", function (request, response) {
    let raw_user_data = fs.readFilesync("./user_data.json");
    let user_data = JSON.parse(raw_user_data);
    
    let username_entered = request.body['username'];
    let password_entered = request.body['password'];

    // Assuming you have user_reg_data defined somewhere in your code
    const user_reg_data = {
        // Your user data here
    };

    let response_msg = '';
    let errors = false;

    // Check if username and password exist in user_reg_data
    if (typeof user_reg_data[username_entered] !== 'undefined') {
        // Check if the entered password meets the criteria
        if (!isValidPassword(password_entered)) {
            response_msg = 'Invalid password. Password must be between 10 and 16 characters, case-sensitive, and not contain spaces.';
            errors = true;
        } else if (password_entered == user_reg_data[username_entered].password) {
            // Redirect to invoice page after successful login
            response.redirect(`./invoice.html?username=${username_entered}`);
            return;
        } else {
            // Incorrect Password
            response_msg = 'Wrong username or password. Please try again.';
            errors = true;
        }
    } else {
        // Username does not exist
        response_msg = `${username_entered} does not exist`;
        errors = true;
    }

    // If there are errors, redirect to login page with error message and retained username
    if (errors) {
        // Redirect to login page with error message
        response.redirect(`/login.html?error=${response_msg}&username=${username_entered}`);
    }
});

// Function to check if the password is valid
function isValidPassword(password) {
    // Check length, case sensitivity, and absence of spaces
    return password.length >= 10 && password.length <= 16 && password === password && !/\s/.test(password);
}

// Route all other GET requests to serve static files from a directory named "public"
app.all('*', function (request, response, next) {
    // console.log(request.method + ' to ' + request.path);
    next();
});

///////////////////////////////// Post for Register///////////////////////////////
app.post("/register", function (request, response) {
    // Process a simple register form
    let new_user = request.body.username.trim(); // Trim to remove leading and trailing spaces
    let new_email = request.body.email.trim().toLowerCase(); // Trim and convert to lowercase

    let errors = false;
    let resp_msg = "";

    // Check if username contains spaces
    if (new_user.includes(" ")) {
        resp_msg = "Username cannot contain spaces.";
        errors = true;
    }

    // Check if email is valid (contains only letters, numbers, "_", ".", and "@")
    if (!/^[a-zA-Z0-9_.@]+$/.test(new_email)) {
        resp_msg = "Invalid email format. Email can only contain letters, numbers, '_', '.', and '@'.";
        errors = true;
    }

    // Check if email is already registered
    if (Object.values(user_reg_data).some(user => user.email.toLowerCase() === new_email)) {
        resp_msg = "Email address is already registered.";
        errors = true;
    }

    if (typeof user_reg_data[new_user] != 'undefined') {
        resp_msg = `${new_user} already exists`;
        errors = true;
    } else if (request.body.password == request.body.repeat_password) {
        // Check if password meets the criteria
        if (!isValidPassword(request.body.password)) {
            resp_msg = 'Invalid password. Password must be between 10 and 16 characters, case-sensitive, and not contain spaces.';
            errors = true;
        } else {
            // Save user data
            user_reg_data[new_user] = {};
            user_reg_data[new_user].password = request.body.password;
            user_reg_data[new_user].email = new_email;
            user_reg_data[new_user].name = request.body.name;

            fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');

            // Redirect to the invoice page after successful registration
            response.redirect(`./invoice.html?username=${new_user}`);
        }
    } else {
        resp_msg = `Passwords do not match`;
        errors = true;
    }

    if (errors) {
        response.send(resp_msg);
    }
});

// Function to check if the password is valid
function isValidPassword(password) {
    // Check length, case sensitivity, and absence of spaces
    return password.length >= 10 && password.length <= 16 && password === password && !/\s/.test(password);
}

// Start the server; listen on port 8080 for incoming HTTP requests
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

// // Start the server; listen on port 8080 for incoming HTTP requests
// app.listen(8080, () => console.log(`listening on port 8080`));