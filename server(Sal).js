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

// Start the server; listen on port 8080 for incoming HTTP requests
app.listen(8080, () => console.log(`listening on port 8080`));

//lab 14
const fs=require('fs');

let filename= __dirname+"/user_data.json";

//have to declare it at the top 
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

//part 4 of lab 12. Creating the username and defining it 
username = 'newuser';
user_reg_data[username] = {};
user_reg_data[username].password = 'newpass';
user_reg_data[username].email = 'newuser@user.com';

//writes the updated user data to the json file, the updated information (lines 28-31), we use this fs.writeFileSync and then the json stringify is converting the json file into a string to use
fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');

let express = require('express');
let app = express();


app.use(express.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str); //send this to a blank page where the post called in the first place 
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not

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

app.listen(8080, () => console.log(`listening on port 8080`));

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 //where the app.post - response message used to be 

 //assingment 2 add from here 
 let user_data;

const fs= require('fs');
const filename= __dirname + 'use_data.json';
if (fs.existsSync(filename)){
    let data=fs.readFileSync(filename, 'utf-8');
user_data = JSON.parse(data);
console.log(user_data);
}
else {
    //data function is now a global variable. The user data is global so all the other functions can use the user data. If the file does not exist, creating a empty object 
    console.log(`${filename} does not exist.`);
    user_data = {};
}

let temp_user; //temporary storage for inputs to be pased along (see slide 10)

app.post("/register", function (request, response) {
    // process a simple register form
let new_user = request.body.username;
let errors = false;
let response_msg= '';
//if the username is undefined then state undefined
    if (typeof user_reg_data[new_user] != 'undefined'){
        response_msg = 'Username unavailable. Please enter a different username.';
        errors = true;
        //if the username is defined, but is already in use, then you use a different username. Make sure that the password checks the new password as well. 
    } else if (request.body.password == request.body.repeat_password) {
user_reg_data[new_user] = {};
user_reg_data[new_user].name =request.body.name;
user_reg_data[new_user].password = request.body.password;
user_reg_data[new_user].email = request.body.email;

//add to the memory of the json file as a string, and then if it doesn't exist go back into the login 
fs.writeFileSync(filename, JSON.stringify(user_reg_data), 'utf-8');
response.redirect(`./login`);
    } else {
        response_msg = "Repeat password does not match with password"
        errors = true;
    }
    if (errors){
        response.send(response_msg);
    }
 });

 for (let i in products){
    temp_user = POST [`qty${[i]}`];
 }
 let params = new URLSearchParams();
 response.redirect(`./login.html?${params.toString()}`);
}

else if (Object.keys(errorObject).length > 0){
    response.redirect("./products.html?" + qs.stringify(POST)+ `&inputErr`);
}



//after declairing a variable, put it in a params and then push it out to a URL 

app.post('/process_purchase', function(request, response){
});

app.post('/process_purchase', function(request, response){
    let POST = request.body;
    let entered_email = POST ['email'].toLowerCase();
    let entered_password = POST ['password'];
//check and see if they are blank 
    if (entered_email.length == 0 && entered_password == 0){
        request.query.loginErr = 'Email address & password are both required.0'
    } else if (user_data[entered_email]){
        //does the email exist and does the password match the email 
        if (user_data[entered_email].password == entered_password) {
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;
//sal's code from Nov. 27 class 
            let params = new URLSearchParams(temp_user);
            response.redirect(`/invoice.html?valid&${params.toString()}`);
            return;
        } else if (entered_password ==0){
            request.query.loginErr= 'Password cannot be blank. Please try again.';
        } else {
            request.query.loginErr = 'Incorrect password';
        }
    } else {
        request.query.loginErr = 'Invalid email, please try again';
    }
    request.query.email = entered_email;
    let params = new URLSearchParams(request.query);
    response.redirect(`login.html?${params.toString()}`);

    });

    app.post('./process_login', functinon(request,response));

    app.post('./continue_shopping', function(request, response){
        let params = new URLSearchParams(temp_user);
        response.redirect(`./products_display.html?${params.toString()}`);
    })

    app.post('/purchase_logout', function(request, response){
// updating the quantity sold by going to the temp user variable and looking for in the array the quantity. Incrementing it by +=, finding current quantity available and then subtracting from the temp user. 
            for (let i in prodicts) {
                products[i].qty_sold += Number(temp_user[`qty${i}`]); 
                products[i].qty_available = products [i].qty_available - Number(temp_user[`qty${i}`]);

            }
            fs. writeFile(__dirname+'products.json', JSON.stringify(products), 'utf-8'), (err) => {
                if (err){
                    console.error("Error updating products data");
                } else {
                    console.log("Products data has been updated")
                }
                }
            })


        