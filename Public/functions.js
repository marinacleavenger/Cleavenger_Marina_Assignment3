//straight from sample code from Dr. Portes example code, referenced from Sal's study video
function loadJSON(service, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('POST', service, false);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }

// This function makes a navigation bar from a products_data object
//loop through the three things in the products array
function nav_bar(products_key, products) {
    // This makes a navigation bar to other product pages
    for (let products_key in products) {
        //if (products_key == this_product_key) continue;
        //this loop puts the books, decor, and movies into the nav bar
        document.write(`<a class="nav-link mx-3 highlight" href='/products.html?products_key=${products_key}'>${products_key}</a>`);
    }
}