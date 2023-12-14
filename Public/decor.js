// defining the variables to be blank, able to insert other information from another Array, and also importing it into the url 
let params = (new URL(document.location)).searchParams;
let error;
let order = [];

//This is if there was an error, you can get the params to execute an error so it will not go forward 
error = params.get('error');
//assigned type in products.json
letstoreName = "decor"

//I referenced ChatGPT for this code. this code essentially loops through the params object and extracts values associated with keys that start with 'prod', converting them to integers and storing them in the order array. 
params.forEach((value,key) => {
    if (key.startsWith('prod')) {
            order.push(parseInt(value));
        }
});


//If there is an error submitted, then it shows the error text 
if(error == 'true'){
    // this line of code adds a new HTML message (a heading with a red text color indicating an error message) to the content of the element with the ID 'errorDiv'. If this line is executed multiple times, it will keep appending this error message to the existing content of 'errorDiv'.
    document.getElementById('errorDiv').innerHTML += `<h3 class="text-danger">Please enter a valid quantity!</h3><br>`;

    //Sal's code from November 27 Assign. 2 help. We are looping the quantity form and the quantity identifier and value. 
    if (URLSearchParams.has('name')){
    document.getElementById('helloMsg').innerHTML = `Thank you ${name}!`;
    for (let i in products){
        qty_form[`qty${i}`].value = params.get(`qty${i}`);
    }
}
}

//This code displays the a loop for  product images from boostrap 5 hence the div class "col-md-6".
for (let i = 0; i < products.length; i++) {
    if(products[i].type === "decor") {
    document.querySelector('.row').innerHTML += 
        `<div class="col-md-6 textColor">
        <div class="name">
            <div class="text-center">
                <img src="${products[i].image}" class="name-img" alt="Product Image">
            </div>
            <div class="name-body">
                <h5 class="name-title">${products[i].model}</h5>
                <p class="name-text">
                    Price: $${(products[i].price).toFixed(2)}<br>
                    In Stock: ${products[i].qty_available}<br>
                    Total Sold: ${products[i].total_sold}
                </p>
                
                <input type="text" placeholder="0" name="quantity_textbox" id="${[i]}" class="form-control mb-2" oninput="validateQuantity(this)" value="${order[i] !== 0 && order[i] !== undefined ? order[i] : ''}" onload="validateQuantity(this)">
                <p id="invalidQuantity${[i]}" class="text-danger"></p>
                </div>
            </div>
        </div>`
        validateQuantity(document.getElementById(`${[i]}`));
 ;}

//Defined the ability to generate the function for the quantity 
    function validateQuantity(quantity){
        //I am declaring the variables and making them able to pull quantities that the client says, and see if it is correct. It is not predetermined that is why it is blank.
        let validationQuantity = '';
        let quantityNumber = Number(quantity.value);
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = "validationQuantity";

        //This was referenced from Professor Sal's code in Store 1/Poke 12. This displays a validation message if not a number, negative, not an integer, or if there is not enough items in stock
        if(isNaN(quantityNumber)){
            validationQuantity = "Please Enter a Number";
        }else if (quantityNumber<0 && !Number.isInteger(quantityNumber)){
            validationQuantity = "Please Enter a Positive Integer";
        }else if (quantityNumber <0){
            validationQuantity = "Please Enter a Positive Value";
        }else if(!Number.isInteger(quantityNumber)){
            validationQuantity = "Please Enter an Integer";
        }else if(quantityNumber > products[quantity.id]['qty_available']){
            validationQuantity = "Not Enough Items in Stock";
        }
        else{
            validationQuantity = '';
        }
        //Lets the validationQuantity to the innerHTML to the section
        document.getElementById(`invalidQuantity${quantity.id}`).innerHTML = validationQuantity;
    
    }}