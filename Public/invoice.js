//initializing variables. My code was not working until I foud I was not initlization or declairing variables. Lines 2-6 is referenced from collaboration on Monday 11/13 with Justin Wang and Ethan Swartz.
let extendedPrices = [];
let taxAmount = 0;
let shipping = 0;
let extendedPrice = 0;
let subtotal = 0;

// Fetching the query string parameters
let params = (new URL(document.location)).searchParams;
        //initializes empty quantity array that was defined above so it knows to start at nothing instead of pre-picked arrays 
        let quantity = [];
        //for each 'prod', push the value to the array
        params.forEach((value,key) => {
            if (key.startsWith('prod')) {
                    quantity.push(parseInt(value));
                }
        });        
        
//Generates all the item rows so display on teh webpage and also take in calculations
generateItemRows();

//Calculate subtotal and tax
 let tax = (subtotal*0.0575);

//checks the shipping price
if(subtotal <= 50)
{  
    shipping = 2;
}else if(subtotal <=100)
{
    shipping = 5;
}
else{
    shipping = subtotal*.05;
}

//calculates total
let total = tax+ subtotal+ shipping;


//This is generating the footer rows copied from Store1/Poke12
document.getElementById("subtotal_cell").innerHTML = "$" + subtotal.toFixed(2);
document.getElementById("tax_cell").innerHTML = "$" + tax.toFixed(2);
document.getElementById("shipping_cell").innerHTML = "$"+shipping.toFixed(2);
document.getElementById("total_cell").innerHTML = "$"+total.toFixed(2);

//function to validate the quantity, returns a string if not a number, negative, not an integer, or a combination of both, this was done in a video for Store1/Poke12 so lines 50-63 are referenced by Professor Sal 
function validateQuantity(quantity){
    // if it is not a number it will display the error message
    if(isNaN(quantity)){
        return "Please Enter a Number";
// If the quantity is a decimal it will display the error message
    }else if (quantity<0 && !Number.isInteger(quantity)){
        return "Please Enter a Positive Integer";
    // if the quantity is negative it will display the error message
    }else if (quantity <0){
        return "Please Enter a Positive Number";
    }else if(!Number.isInteger(quantity)){
        return "Please Enter an Integer";
    }else{
        return"";
    }

}
//generates all the item rows
function generateItemRows(){

//sets table to the invoice table on the html
    let table = document.getElementById("invoiceTable");

//Defined this to see if it has errors it will therefore not work
    let hasErrors = false; 

    //for each Member of the array is a for loopthat lets all products be drawn in from the quantity
    for(let i=0;i<products.length;i++){
        
    //Sets item and itemQuantity from the products array, and the array gotten from the url: Lines 79-80 referenced from Aaron Kim
        let item = products[i];
        let itemQuantity = quantity[i];
        
    //Validate the quantity
        let validationMessage = validateQuantity(itemQuantity);
        
        //if there is an error, it will ignore this below. It is checking the validation if it is true or false
        if(validationMessage !== ""){
            hasErrors = true;
            let row =table.insertRow();
            row.insertCell(0).insertHTML = item.model;
            row.insertCell(1).innerHTML = validationMessage;
        } 
        //Depending on the output, it will create the row in the invoice and update the extended price and subtotal
        else if(itemQuantity >0){
            //Update the variables in the table
            extendedPrice = item.price * itemQuantity;
            subtotal += extendedPrice;

            //Create a new row and generates the info that is the image, the name, quantity, the price, then the total of the entire quantity based on quantity
            let row = table.insertRow();
            row.insertCell(0).innerHTML = `<img src="${item.image}" class="img-invoice" name = "img">`;
            row.insertCell(1).innerHTML = item.model;
            row.insertCell(2).innerHTML = itemQuantity;
            row.insertCell(3).innerHTML = "$" + item.price.toFixed(2);
            row.insertCell(4).innerHTML = "$"+extendedPrice.toFixed(2);

        }
    }
}