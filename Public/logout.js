//imported from Sal's code (taken from video for Assignment 3)
window.onload = function(){
    let params = (new URL(document.location)).searchParams;
    if (params.has('loginErr')){
        document.getElementById('errMsg').innerHTML = params.get('loginErr')

    }
    document.getElementById('email').value = params.get('email');

}