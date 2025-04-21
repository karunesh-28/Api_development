const http = require('http');
const fs = require('fs');
const url = require('url');

//create a server 

// 127.0.0.1:8000
//localhost:8000

http.
  createServer((req, res) => {

    console.log(req.method);

    let parsedurl = url.parse(req.url, true)

    console.log(parsedurl);

    //read the file as string



    let products = fs.readFileSync("./products.json", "utf-8");


    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if(req.method=="OPTIONS")
    {
      res.end();
    }


    // if (req.method==OPTIONS){

    //   res.end();

    // }
    
 


    //fetch all products
     if (parsedurl.pathname === "/products" && req.method == "GET" && parsedurl.query.id == undefined) {

      
  
      res.end(products);
      

    }

    else if (parsedurl.pathname === "/products" && req.method == "GET" && parsedurl.query.id != undefined) {
      let productArray = JSON.parse(products);

      let product = productArray.find((product) => {
        return product.id == parsedurl.query.id;
      })

      if (product != undefined) {
        res.end(JSON.stringify(product));
      }
      else {
        res.end(JSON.stringify({ "message": "product not found" }))
      }


    }
    //create new product
    else if (req.method == "POST" && parsedurl.pathname === "/products") {

      let product = "";

      // this event is called for every chunk received
      req.on("data", (chunk) => {
        console.log(chunk);
        product = product + chunk;
      })

      //this event is called at end of the stream and convert bytes to readable string
      req.on("end", () => {

        let productsArray = JSON.parse(products);
        let newproduct = JSON.parse(product);

        productsArray.push(newproduct);

        fs.writeFile("./products.json", JSON.stringify(productsArray), (err) => {
          if (err == null) {
            res.end(JSON.stringify({ "message": "new product created" }))
          }
        })
      })


    }


    //end point to update a product

    else if (req.method == "PUT" && parsedurl.pathname == "/products") {


      let product = " ";

      req.on("data", (chunk) => {
        product += chunk; //product=product+chunk

      })

      req.on("end", () => {
        let productsArray = JSON.parse(products);
        let productOBJ = JSON.parse(product);

        let index = productsArray.findIndex((product) => {
          return product.id == parsedurl.query.id;
        })


        if (index !== -1) {
          productsArray[index] = productOBJ;

          fs.writeFile("./products.json", JSON.stringify(productsArray), (err) => {
            if (err == null) {
              res.end(JSON.stringify({ "message": "product successfully updated" }))
            }
            else {
              res.end(JSON.stringify({ "message": "some problem" }))
            }
          })

        }

        else {
          res.end(JSON.stringify({ "message": "the element is given when id is not there" }))
        }


      })

    }
    //end points to delete the product based on id

    else if (req.method == "DELETE" && parsedurl.pathname == "/products") {

      let productsArray = JSON.parse(products);

      let index = productsArray.findIndex((product) => {
        return product.id == parsedurl.query.id;
      })

      if (index !== -1) {
        productsArray.splice(index, 1);

        fs.writeFile("./products.json", JSON.stringify(productsArray), (err) => {
          if (err == null) {
            res.end(JSON.stringify({ "message": "product successfully deleted" }))
          }
          else {
            res.end(JSON.stringify({ "message": "some problem" }))
          }
        })
      }

      else {
        res.end(JSON.stringify({ "message": "the element is given when id is not there" }))
      }


    }

  })

  .listen(8000)