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
    response.redirect("./login.html?" + params.toString());
  } else {
    // If errors exist, redirect to registration page with errors
    request.body["registration_errors"] = JSON.stringify(registration_errors);
    let params = new URLSearchParams(request.body);
    response.redirect("./registration.html?" + params.toString());
  });

// --------------------------- Change Registration Details --------------------------- //
// Based on Blake Saari's (S2) server.js
app.post("/change_password", function (request, response){
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
    ] = `Please enter a valid email address (Ex: hannip@newjeans.kr)`;
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