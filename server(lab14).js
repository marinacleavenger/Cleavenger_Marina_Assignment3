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