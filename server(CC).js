// Author: Caleb Chang
// Server used to validate data inputted in the webstore, and path to either an error message on the same page or redirect to the invoice page.
// Updated to include a login, registration, and profile edit page, based on Blake Saari's S22 server.js
// Used an online code formatter to adjust "ugliness" in code 

//Load in query string, product info, and express package, cookie parser and session middleware, and user information
var express = require("express");
var app = express();
var fs = require("fs");

const qs = require("querystring");
const { query } = require("express");
const { response } = require("express");
const { URLSearchParam } = require("url");
var products = require(__dirname + "/products.json");

// A2IR1 crypt librarys; ChatGPT was used to build my understanding of the crypto library and the crypt() function, as well as the foundation for all encryption code used in the login, register, and update pages.
const crypto = require("crypto");

//variable to store user data
var user_data = "./user_data.json";

var qty_obj = {};

app.use(express.urlencoded({ extended: true }));

// Non Negative Integer function, used later to determine validity, (If q is "")
function isNonNegInt(q, returnErrors = false) {
  errors = [];
  if (Number(q) != q) errors.push("Not a number!");
  if (q < 0) errors.push("Negative value!");
  if (parseInt(q) != q) errors.push("Not an integer!");
  return returnErrors ? errors : errors.length == 0;
}

// Created function used to check input in the textbox and add an error message below in real time.
// Used assistance from ChatGPT to tweak the below function from Lab 12 (lines 38 - 56) to dynamically change my error message, as well as match A1: IR3's criteria (red border color, error msg, & replacing input value to the qty_available)
function checkQuantityTextbox(qtyTextbox) {
  const qtyAva = parseInt(qtyTextbox.dataset.qtyAva); // Get available quantity from dataset
  const qty = parseInt(qtyTextbox.value); // Get entered quantity
  const errorSpan = document.getElementById(qtyTextbox.id + "_errors");
  // Check if entered quantity exceeds available quantity
  if (qty > qtyAva) {
    // Changes the error message to the following
    errorSpan.innerHTML = `We don't have ${qty} available`;
    // Sets textbox value to available quantity
    qtyTextbox.value = qtyAva;
    // Changes textbox border color to red when value is > qtyAva
    qtyTextbox.style.borderColor = "red";
  }
  // Clears error message and changes border color back to default
  else {
    errorSpan.innerHTML = "";
    qtyTextbox.style.borderColor = "";
  }
}

// Monitor all requests
app.all("*", function (request, response, next) {
  console.log(request.method + " to " + request.path);
  next();
});

// Routing
app.get("/products.js", function (request, response, next) {
  response.type(".js");
  var products_str = `var products = ${JSON.stringify(products)};`;
  response.send(products_str);
});

// ---------------------- Purchase ----------------------//
// process purchase request (validate quantities, check quantity available)
app.post("/purchase", function (request, response, next) {
  //Receive data from textboxes and log
  console.log(request.body);

  // Quantities array to hold my quantites to take to login
  var quantities = [];
  quantities = request.body;
  // Below code (lines 81 - 130 based on Branson Suzuki's (F22) server.js
  // Declaring q as a empty variable, setting the has_quantity default to false (eg. quantities haven't been entered yet), and an empty errors object.
  var q;
  var has_quantity = false;
  var errors = {};

  for (let i in products) {
    q = request.body["quantity" + i];
    if (typeof q != "undefined") {
      console.log(q);
      // Check that there were quantities inputted
      if (q > 0) {
        has_quantity = true;
      }
      // Using isNonNegInt to validate values
      if (isNonNegInt(q) == false) {
        errors["quantity_error" + i] = isNonNegInt(q, true);
      }
      // Checking stock validity, (created pre - IR3 code, as the IR3 code blocks the user from sending in a quantity larger than the qty_available, but still functions properly)
      if (q > products[i].qty_ava) {
        errors[
          "stock_outage" + i
        ] = `We currently don't have ${q} ${products[i].name}s. Please check back later!`;
      }
    }
  }
  // Prints an error telling the user to select an item to purchase; when the user hasn't input any values.
  if (has_quantity == false) {
    errors["no_selections_error"] = "Please select some items to purchase!";
  }
  let quantity_object = qs.stringify(request.body);
  // If all selected quantities are valid, and at least one selection is made without errors, redirect to the invoice.html file, and in all other cases it will stay on the store page.
  if (Object.keys(errors).length == 0) {
    // Take the quantity purchased out of the quantity available before pathing to invoice
    for (let i in products) {
      products[i].qty_ava -= Number(request.body["quantity" + i]);
    }

    // store quantities in qty_obj
    qty_obj = quantity_object;
    // Redirect to login page before pathing to invoice
    response.redirect("./login.html?");
  } else {
    response.redirect(
      "./products_display_assign1.html?" +
        qs.stringify(request.body) +
        "&" +
        qs.stringify(errors)
    );
  }
});

// --------------------------- Log-in --------------------------- //
// Based on Blake Saari's (S2) server.js
// Example from Lab 13, used to retrieve the user data from my json file
if (fs.existsSync(user_data)) {
  var user_data = "./user_data.json";
  var data_str = fs.readFileSync(user_data, "utf-8");
  var user_str = JSON.parse(data_str);
} else {
  console.log(user_data + " does not exist.");
}

// Process the login request
// Process login form POST and redirect to logged in page if ok, back to login page if not
app.post("/login", function (request, response) {
  // Start with no errors
  var errors = {};

  // Declare variables for the inputs from the login form
  var the_email = request.body["email"].toLowerCase();
  // save username in case of password change
  logged_in = the_email;
  var the_password = request.body["password"];

  // Check if password entered matches password stored in JSON
  if (typeof user_str[the_email] != "undefined") {
    // A2IR1 ENCRYPTION: Retrieve the salt and the hashed_password from the user_data.json file, to use the same salt to hash and encrypt the password that is entered.
    let salt = user_str[the_email].password_salt;
    let saved_hash = user_str[the_email].password_hash;
    // Hash the password entered during login using the same salt and parameters
    let hash = crypto
      .pbkdf2Sync(the_password, salt, 1000, 64, "sha512")
      .toString("hex");
    if (saved_hash == hash) {
      // If the passwords match...
      qty_obj["email"] = the_email;
      qty_obj["fullname"] = user_str[the_email].fullname;
      var pass_name = user_str[the_email].fullname;
      // Store quantity data
      let params = new URLSearchParams(qty_obj);
      params.append("fullname", pass_name);
      // If no errors, redirect to invoice page with quantity data
      response.redirect("./invoice.html?" + params.toString());
      qty_obj = {};
      return;
      // If password incorrect add to errors variable
    } else {
      errors["login_error"] = `Incorrect password`;
    }
    // If email incorrect add to errors variable
  } else {
    errors["login_error"] = `Wrong E-Mail`;
  }
  // If errors exist, redirect to login page with errors in string
  let params = new URLSearchParams(errors);
  params.append("email", the_email);
  response.redirect("./login.html?" + params.toString());
});

// ---------------------------  Registration --------------------------- //
// Based on Blake Saari's (S2) server.js

app.post("/registration", function (request, response) {
  // Start with 0 registration errors
  var registration_errors = {};
  // Import email from submitted page
  var register_email = request.body["email"].toLowerCase();
  // Validate email address (From w3resource - Email Validation)
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email) ==
    false
  ) {
    registration_errors["email"] = `Please enter a valid email address`;
  }
  // Validates that there is an email inputted
  else if (register_email.length == 0) {
    registration_errors["email"] = `Please enter a valid email address`;
  }
  // Validates that the email inputted has not already been registered
  if (typeof user_str[register_email] != "undefined") {
    registration_errors[
      "email"
    ] = `This email address has already been registered`;
  }
  // Validates that password is at least 8 characters
  if (request.body.password.length < 8) {
    registration_errors["password"] = `Password must be at least 8 characters`;
  }
  // Validates that there is a password inputted
  else if (request.body.password.length == 0) {
    registration_errors["password"] = `Please enter a password`;
  }
  // Validates that the passwords match
  if (request.body["password"] != request.body["repeat_password"]) {
    registration_errors[
      "repeat_password"
    ] = `Your passwords do not match, please try again`;
  }
  // Validates that the full name inputted consists of A-Z characters exclusively
  if (/^[A-Za-z, ]+$/.test(request.body["fullname"])) {
  } else {
    registration_errors["fullname"] = `Please enter your first and last name`;
    // Assures that the name inputted will not be longer than 30 characters
  }
  if (request.body["fullname"].length > 30) {
    registration_errors[
      "fullname"
    ] = `Please enter a name less than 30 characters`;
  }
  // Lines 241-271 based on both the example code provided in class and Blake Saari's (S22)
  // If there are no errors...
  if (Object.keys(registration_errors).length == 0) {
    // A2IR1 ENCRYPTION: First, generate a random salt
    let salt = crypto.randomBytes(16).toString("hex");
    let password = request.body["password"];
    // Hash the password and the salt using the crypto library
    let hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    // Creating my object, getting my email and fullname.
    user_str[register_email] = {};
    user_str[register_email].email = request.body.email;
    user_str[register_email].fullname = request.body.fullname;
    // Save the salt and the hash to the user_data.json file, salt being the rng to encrypt, hash being the encrypted password
    user_str[register_email].password_salt = salt;
    user_str[register_email].password_hash = hash;
    // Write data into user_data.json file via the user_str variable
    fs.writeFileSync(user_data, JSON.stringify(user_str));
    // Add product quantity data
    qty_obj["email"] = register_email;
    qty_obj["fullname"] = user_str[register_email].name;
    let params = new URLSearchParams(qty_obj);
    // If registered send to login with product quantity data
    response.redirect("./login.html?" + params.toString());
  } else {
    // If errors exist, redirect to registration page with errors
    request.body["registration_errors"] = JSON.stringify(registration_errors);
    let params = new URLSearchParams(request.body);
    response.redirect("./register.html?" + params.toString());
  }
});

// --------------------------- Change Registration Details --------------------------- //
// Based on Blake Saari's (S2) server.js
app.post("/change_password", function (request, response) {
  // Start with no errors
  var reset_errors = {};

  // Pulls data inputed into the form from the body
  let current_email = request.body["email"].toLowerCase();
  let current_password = request.body["password"];

  // Validates that email is correct format
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email) ==
    false
  ) {
    reset_errors[
      "email"
    ] = `Please enter a valid email address (Ex: marina@me.com)`;
  }
  // Validates that an email was inputted
  else if (current_email.length == 0) {
    reset_errors["email"] = `Please enter an email address`;
  }
  // Validates that both new passwords are identical
  if (request.body["newpassword"] != request.body["repeatnewpassword"]) {
    reset_errors[
      "repeatnewpassword"
    ] = `The passwords you entered do not match`;
  }

  // Check if the inputted email matches the email associated with the saved password
  if (typeof user_str[current_email] == "undefined") {
    // Error message if email is incorrect
    reset_errors["email"] = `The email entered has not been registered yet`;
  } else if (user_str[current_email].email != current_email) {
    // Error message if email does not match the saved email
    reset_errors[
      "email"
    ] = `The email entered does not match the email associated with this account`;
  } else {
    // A2IR1 ENCRYPTION: Retrieve the salt and the hashed_password from the user_data.json file, to use the same salt to hash and encrypt the password that is entered
    let salt = user_str[current_email].password_salt;
    let saved_hash = user_str[current_email].password_hash;
    let hash = crypto
      .pbkdf2Sync(current_password, salt, 1000, 64, "sha512")
      .toString("hex");

    // Validates that inputted email and password match credentials stored in user_data.json
    if (typeof user_str[current_email] != "undefined") {
      // Validates that password submited matches password saved in user_data.json
      if (user_str[current_email].password_hash == hash) {
        // Validates that password is at least 8 characters long
        if (request.body.newpassword.length < 8) {
          reset_errors[
            "newpassword"
          ] = `Password must be at least 8 characters`;
        }
        // Validates that passwords matches user_data.json
        if (user_str[current_email].password_hash != hash) {
          reset_errors["password"] = `The password entered is incorrect`;
        }
        // Validates that inputted new passwords are identical
        if (request.body.newpassword != request.body.repeatnewpassword) {
          reset_errors[
            "repeatnewpassword"
          ] = `The passwords you entered do not match`;
        }
        // Validates that new password is different than current password
        if (
          request.body.newpassword &&
          request.body.repeatnewpassword == current_password
        ) {
          reset_errors[
            "newpassword"
          ] = `Your new password must be different from your old password`;
        }
      } else {
        // Error message if password is incorrect
        reset_errors["password"] = `You entered an incorrect password`;
      }
    } else {
      // Error message is email is incorrect
      reset_errors["email"] = `The email entered has not been registered yet`;
    }
    // If there are no errors
    if (Object.keys(reset_errors).length == 0) {
      // A2IR1 ENCRYPTION: Generate a new random salt and overwrite the saved salt, and hash the new password and overwrite that as well.
      salt = crypto.randomBytes(16).toString("hex");
      let password = request.body["newpassword"]; //
      // Hash the password and the salt using the crypto library
      hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
      // Save the salt and the hash to the user_data.json file
      user_str[current_email].password_salt = salt;
      user_str[current_email].password_hash = hash;
      // Write new password into user_data.json
      fs.writeFileSync(user_data, JSON.stringify(user_str), "utf-8");
      // Pass quantity data
      qty_obj["email"] = current_email;
      qty_obj["fullname"] = user_str[current_email].name;
      let params = new URLSearchParams(qty_obj);
      // Redirect to login page with quantity data in string
      response.redirect("./login.html?" + params.toString());
      return;
    } else {
      // Request errors
      request.body["reset_errors"] = JSON.stringify(reset_errors);
      let params = new URLSearchParams(request.body);
      // Redirect back to update registration page with errors in string
      response.redirect("update.html?" + params.toString());
    }
  }
});

// route all other GET requests to files in public
app.use(express.static(__dirname + "/public"));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));