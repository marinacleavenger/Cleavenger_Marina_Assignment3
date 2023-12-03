// Server.js is mostly compiled from  from the Lualima Assignment 1 instructions and Professor Sal's Video
// Importing the Express.js framework 
const express = require('express');
// Create an instance of the Express application called "app"
// app will be used to define routes, handle requests, etc
const app = express();
const fs = require("fs");

let filename= __dirname+"/user_data.json";

let user_reg_data;

if (fs.existsSync(filename)){
    
    let data = fs.readFileSync(filename, 'utf-8');
    //make it something other than a string 
user_reg_data= JSON.parse(data);

//stat sync will create a stats object that has different elements such as stat size, file name, etc.  Declairing this
let user_stats = fs.statSync(filename);

let stat_size= user_stats.size;
//print it out in characters
console.log(`The file name of ${filename} has ${stat_size} characters`);

} else{
    console.log(`The file name ${filename} does not exist.`);
}

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
    //console.log(request.method + ' to ' + request.path);
    next();
 });

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
// // --------------------------- Log-in --------------------------- //
// // Based on Blake Saari's (S2) server.js
// // Example from Lab 13, used to retrieve the user data from my json file
// if (fs.existsSync(user_data)) {
//   let user_data = "/user_data.json";
//   let data_str = fs.readFileSync(user_data, "utf-8");
//   let user_str = JSON.parse(data_str);
// } else {
//   console.log(user_data + " does not exist.");
// }

// // Process the login request
// // Process login form POST and redirect to logged in page if ok, back to login page if not
// app.post("/login", function (request, response) {
//   // Start with no errors
//   let errors = {};

//   // Declare letiables for the inputs from the login form
//   let the_email = request.body["email"].toLowerCase();
//   // save username in case of password change
//   logged_in = the_email;
//   let the_password = request.body["password"];

//   // Check if password entered matches password stored in JSON
//   if (typeof user_str[the_email] != "undefined") {
//     // A2IR1 ENCRYPTION: Retrieve the salt and the hashed_password from the user_data.json file, to use the same salt to hash and encrypt the password that is entered.
//     let salt = user_str[the_email].password_salt;
//     let saved_hash = user_str[the_email].password_hash;
//     // Hash the password entered during login using the same salt and parameters
//     let hash = crypto
//       .pbkdf2Sync(the_password, salt, 1000, 64, "sha512")
//       .toString("hex");
//     if (saved_hash == hash) {
//       // If the passwords match...
//       qty_obj["email"] = the_email;
//       qty_obj["fullname"] = user_str[the_email].fullname;
//       let pass_name = user_str[the_email].fullname;
//       // Store quantity data
//       let params = new URLSearchParams(qty_obj);
//       params.append("fullname", pass_name);
//       // If no errors, redirect to invoice page with quantity data
//       response.redirect("/invoice.html?" + params.toString());
//       qty_obj = {};
//       return;
//       // If password incorrect add to errors letiable
//     } else {
//       errors["login_error"] = `Incorrect password`;
//     }
//     // If email incorrect add to errors letiable
//   } else {
//     errors["login_error"] = `Wrong E-Mail`;
//   }
//   // If errors exist, redirect to login page with errors in string
//   let params = new URLSearchParams(errors);
//   params.append("email", the_email);
//   response.redirect("/login.html?" + params.toString());
// });
// // route all other GET requests to files in public

// app.use(express.static(__dirname + "/public"));

// // Start the server; listen on port 8080 for incoming HTTP requests
// app.listen(8080, () => console.log(`listening on port 8080`));

//make sure to look at the login for lab 14 and past it into your code

//start of lab 14
// const fs=require('fs');

// let filename= __dirname+"/user_data.json";

// //have to declare it at the top 
// let user_reg_data;

// if (fs.existsSync(filename)){
    
// let data = fs.readFileSync(filename, 'utf-8');

// //make it something other than a string 
// user_reg_data= JSON.parse(data);

// //stat sync will create a stats object that has different elements such as stat size, file name, etc.  Declairing this
// let user_stats = fs.statSync(filename);

// let stat_size= user_stats.size;
// //print it out in characters
// console.log(`The file name of ${filename} has ${stat_size} characters`);

// } else{
//     console.log(`The file name ${filename} does not exist.`);
    
// }

// //part 4 of lab 12. Creating the username and defining it 
// username = 'newuser';
// user_reg_data[username] = {};
// user_reg_data[username].password = 'newpass';
// user_reg_data[username].email = 'newuser@user.com';

// //writes the updated user data to the json file, the updated information (lines 28-31), we use this fs.writeFileSync and then the json stringify is converting the json file into a string to use
// fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');

// // let express = require('express');
// // let app = express();

// app.use(express.urlencoded({ extended: true }));

// // 
// app.post("/login", function (request, response) {
//     // Process login form POST and redirect to logged in page if ok, back to login page if not

// //process login form POST and redirect to logged in page if it works, if it doesn't, it will go back to the login page. You will first get the user's entered information to store
// let username_entered = request.body['username'];
// let password_entered = request.body['password'];

// let response_msg = '';
// let errors = false;

// //check if the username exists in user_reg_data
// if (typeof user_reg_data[username_entered] != 'undefined'){

//     //check if password matches with username
//     if (password_entered == user_reg_data[username_entered].password){
//         response_msg = `${username_entered} is logged in.`;
//     } else {
//         response_msg = `Incorrect password. Please try again.`;
//         errors= true;
//     }
//  } else {
//     response_msg = `${username_entered} does not exist.`;
//     errors=true;
//     }if (!errors){
//     response.send(response_msg);
// } else {
//     response.redirect(`./login?error=${response_msg}`)
// }

// });

// app.listen(8080, () => console.log(`listening on port 8080`));


//  app.post("/register", function (request, response) {
//     // process a simple register form
// let new_user = request.body.username;

// let errors = false;
// let response_msg= '';
// //if the username is undefined then state undefined
//     if (typeof user_reg_data[new_user] != 'undefined'){
//         response_msg = 'Username unavailable. Please enter a different username.';
//         errors = true;
//         //if the username is defined, but is already in use, then you use a different username. Make sure that the password checks the new password as well. 
//     } else if (request.body.password == request.body.repeat_password) {
// user_reg_data[new_user] = {};
// user_reg_data[new_user].name =request.body.name;
// user_reg_data[new_user].password = request.body.password;
// user_reg_data[new_user].email = request.body.email;

// //add to the memory of the json file as a string, and then if it doesn't exist go back into the login 
// fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');
// response.redirect(`./login`);
//     } else {
//         response_msg = "Repeat password does not match with password"
//         errors = true;
//     }
//     if (errors){
//         response.send(response_msg);
//     }
//  });

// // first made purchase go to login page, change the server to a login.html
//  //implement stuff learned in lab 14 in login page
//  // make lab 14 work in my repo
// // products page go to login, then go to invoice 
// // 