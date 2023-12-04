//you will search for errors in the url and then output the errors in the email and password. Referenced from Anthony Lee's study session, but adapted to seeing if the email and password are correct and outputting the response messages 
let params = (new URL(document.location)).searchParams;
if (params.has('error')) {
    if (params.get('error') == "email") {
        document.getElementById("email-error").innerHTML = "No email found. Please try again.";
    } else if (params.get('error') == "pass") {
        document.getElementById("pass-error").innerHTML = "Password is incorrect";
    }
}