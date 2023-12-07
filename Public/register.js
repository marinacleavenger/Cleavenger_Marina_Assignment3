//this is the params drawing from the validations and responding with the messages declared in quotations. This was adapted from Anthony Lee's study session, and changed to be consistent with my variables and how the registration will respond  
// let params = (new URL(document.location)).searchParams;
// if (params.has('error')) {
//     if (params.get('error') == "exists") {
//         document.getElementById("email-error").innerHTML = "This email is already registered";
//     } else if (params.get('error') == "email") {
//         document.getElementById("email-error").innerHTML = "Please enter a valid email";
//     } else if (params.get('error') == "pass") {
//         document.getElementById("pass-error").innerHTML = "Passwords must be a Min of 10 characters, Max of 16 characters, and 1 Special Character";
//     } else if (params.get('error') == "match") {
//         document.getElementById("repass-error").innerHTML = "Your passwords do not match";
//     }
// }

//registration.js (one from Ethan )
let params = (new URL(document.location)).searchParams;

window.onload = function() {
    let register_form = document.forms ['register_form'];

    //Get values previously inputted and place back into input fields
    register_form.elements['name'].value = params.get('name');
    register_form.elements['email'].value = params.get('email').toLowerCase();

    //Get error messages and display them
    for (let i = 0; i <= document.getElementsByClassName('form-group').length; i++) {
        let inputName = register_form.elements[i].name;

        if (params.has(`${inputName}_length`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`);

            if (params.has(`${inputName}_type`)) {
                document.getElementById(`${inputName}_error`).innerHTML += ` ${params.get(`${inputName}_length`)}`;
            }
        }
        else if (params.has(`${inputName}_type`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_type`);
        }
    }
}
