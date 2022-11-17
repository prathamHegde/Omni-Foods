const express = require("express");
const path = require("path");
const app = express();
const ejs = require("ejs");
const {parse} = require("querystring");
const paypal = require('paypal-rest-sdk');
const port = 9000;

const mysql = require("mysql");
const exp = require("constants");
const { copyFileSync } = require("fs");

//parse
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//setting ejs
app.set("view engine","ejs");

var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "9945",
    database : "omnifood"
});


connection.connect(function(error){
    if (error)
    {
        console.log("error");
    }
    else{
        console.log("connected");
    }
});


app.use("/img",express.static("img"));
app.use("/img/logos",express.static("logos"));
app.use("/img/customers",express.static("customers"));
app.use("/img/meals",express.static("meals"));


app.use("/login/img",express.static("img"));
app.use("/login/img/logos",express.static("logos"));
app.use("/login/img/customers",express.static("customers"));
app.use("/login/img/meals",express.static("meals"));

app.use("/recipes/final/img",express.static("img"));
app.use("/recipes/final/img/logos",express.static("logos"));
app.use("/recipes/final/img/customers",express.static("customers"));
app.use("/recipes/final/img/meals",express.static("meals"));
app.use("/recipes/final/css",express.static("css"));

app.use("/recipes/img",express.static("img"));
app.use("/recipes/img/logos",express.static("logos"));
app.use("/recipes/img/customers",express.static("customers"));
app.use("/recipes/img/meals",express.static("meals"));
app.use("/recipes/css",express.static("css"));


app.use("/forgotPassword/img",express.static("img"));
app.use("/forgotPassword/img/logos",express.static("logos"));
app.use("/forgotPassword/img/customers",express.static("customers"));
app.use("/forgotPassword/img/meals",express.static("meals"));
app.use("/forgotPassword/css",express.static("css"));



let name;
let obj;
let mail_id;
let grandTotal;



app.use("/login/css",express.static("css"));
app.use("/css",express.static("css"));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"index.html"));
})




app.listen(port,()=>{
    console.log(`listening to port ${port}`);
})
 

 


app.post("/login/signin",(req,res)=>{


    const email = req.body.email;
    const password = req.body.password;
    const sql = `select * from customers where email = "${email}"  and password = "${password}" `;


    connection.query(sql,function(err,rows,fields){
        if (err)
        {
            console.log(err);
        }
        else{
            
            let a = [...rows];
            if (a.length == 0)
            {
                res.render("signin");
            }
            else
            {
                name = rows[0].name;
                mail_id = rows[0].email;
                res.sendFile(path.join(__dirname,"recipes.html"));
            }
            
        }
    });
    
})

app.post("/login/signup",(req,res)=>{
    

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const sql1 = `select * from customers where email = "${email}" `;
    const sql2 = `insert into customers values ("${name}","${email}","${password}") `;

    connection.query(sql1,function(err,rows,fields){
        if (err)
        {
            console.log(err);
        }
        else{
            
            let a = [...rows];

            if (a.length == 0)
            {
            
                
                    connection.query(sql2,function(err,rows,fields){
                    if (err)
                    {
                        console.log(err)
                    }else{
                        console.log("data inserted into the database");
                    }
                })
                res.sendFile(path.join(__dirname,"login_success.html"));
            }
            else
            {
                res.render("signup");
            }
            
        }
    });

    
})

app.get("/forgotPassword",(req,res)=>{
    res.sendFile(path.join(__dirname,"forgotPassword.html"));
})

app.post("/forgotPassword/update",(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;

    var sql = `select * from customers where email = "${email}" and name = "${req.body.name}"`;
    var sql2 = `update customers set password = "${password}" where email = "${email}";`
    connection.query(sql,(err,rows,fields)=>{
        if (err)
        {
            console.log(err);
        }
        else
        {
            let a = [...rows];
            if (a.length == 0)
            {
                res.render("forgotPassword");
            }
            else{

                connection.query(sql2,(err,rows,fields)=>{
                    if (err)
                    {
                        console.log(err);
                    }
                    else{
                        console.log("password got updated");
                        res.sendFile(path.join(__dirname,"index.html"));
                    }
                })
            }
        }
    })
})


app.get("/login/forgotPassword",(req,res)=>{
    res.sendFile(path.join(__dirname,"forgotPassword.html"));
})

app.post("/login/forgotPassword/update",(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;

    var sql = `select * from customers where email = "${email}" and name = "${req.body.name}"`;
    var sql2 = `update customers set password = "${password}" where email = "${email}";`
    connection.query(sql,(err,rows,fields)=>{
        if (err)
        {
            console.log(err);
        }
        else
        {
            let a = [...rows];
            if (a.length == 0)
            {
                res.render("forgotPassword");
            }
            else{

                connection.query(sql2,(err,rows,fields)=>{
                    if (err)
                    {
                        console.log(err);
                    }
                    else{
                        console.log("password got updated");
                        res.sendFile(path.join(__dirname,"index.html"));
                    }
                })
            }
        }
    })
})




let table_id;

app.get("/recipes/final/end",(req,res)=>{
    let a = [...obj];
    let newArray = [];
    let j = 0;
    let i = 0;
    var sum = 0;
    let k = 0;
    while(i<a.length){
        if (a[i].count !==0){
            newArray[j] = a[i];
            j++;
        }
        i++;
    }

    var q = 0;

    while (k < newArray.length){
        sum = sum + newArray[k].price*newArray[k].count;
        q = q + newArray[k].count
        k++;
    }

    quantity = q;
    

    grandTotal = sum;
    
    
    
    let foodDetails = {
        name : name,
        orderedFood : newArray
    };

    var sql = `insert into food (email,name,total_bill,date,time) values ("${mail_id}","${name}","${sum}",curdate(),curtime());`

    var sql2 = `select * from food order by orderID desc limit 1;`
    if (newArray.length === 0)
    {   
        
        
        res.sendFile(path.join(__dirname,"recipes.html"));
    }
    else
    {

        connection.query(sql,function(err,rows,fields){
            if (err)
            {
                console.log(err);
            }
            else{
                console.log("food records inserted into the database");
            }
        })

        connection.query(sql2,(err,rows,fields)=>{
            if (err)
            {
                console.log(err);
            }
            else{
                table_id = rows[0].orderID;
                console.log(table_id);
            }
        })

        
        res.render("final",{obj : newArray,name : name,total : sum,tableID : table_id});
    }
    
})


//search option 
app.post("/recipes/final",(req,res)=>{
    obj = req.body;
    res.send(obj);
})


app.get("/recipes",(req,res)=>{
    res.sendFile(path.join(__dirname,"recipes.html"));
})


app.post("/recipes/search",(req,res)=>{
    var find = req.body.name;

    var veg = "veg";
    var non_veg = "non veg";

    if (find === veg)
    {
        res.sendFile(path.join(__dirname,"veg.html"));
    }
    else if (find === non_veg)
    {
        res.sendFile(path.join(__dirname,"non_veg.html"));
    }
    else
    {
        res.send("No Page found");
    }
    
})






//payment


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ATi8GLx1gOeOoNRVgOaURwpuqrZ8mGJ_1v6wKmNnZrXJZoiHYnswtR4_DjakiRGk9Qv6bZDAqa28xKN2',
    'client_secret': 'EOu5ZYKwudx2VtD1FAhdzLijxo6PM7YcN8IF2U3e_0FGYSDvh448QUPGmelNRbXORWZhycZ16DnA13pa'
  });





app.get("/payment",(req,res)=>{
    res.render("payment",{name : name,total : grandTotal,email : mail_id});
})


app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:9000/payment_success",
        "cancel_url": "http://localhost:9000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "ordered_food",
                "sku": "001",
                "price": grandTotal/quantity,
                "currency": "USD",
                "quantity": quantity
            }]
        },
        "amount": {
            "currency": "USD",
            "total": grandTotal
        },
        "description": "Thanks for ordering the food"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
  }
});

});



app.get('/payment_success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": grandTotal
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.sendFile(path.join(__dirname,"payment_success.html"));
    }
});
});

app.get("/cancel",(req,res)=>{
    res.sendFile(path.join(__dirname,"payment_failed.html"));
})
