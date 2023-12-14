//taken from Sal's referenve video for Assignment 3 
// When the window loads, perfom the following function:
window.onload = function() {
    //read in the URL redirect, if there is one
    let params = (new URL(document.location)).searchParams;
    // If the key 'loginError' is present, it means that there were no inputs or an invalid email/password
    if (params.has('loginErr')) {
        // After the window loads, get the value from key 'loginError' and display it in errorMessage
        document.getElementById('errMsg').innerHTML = params.get('loginErr')
    }
    document.getElementById('email').value = params.get('email');
}