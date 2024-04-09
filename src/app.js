const express = require("express");
const path =require("path");
const exphbs= require('express-handlebars');
const app=express();
const hbs = require("hbs");


require("./db/conn");
const Register= require("./models/registers")
const { json }= require("express");
const port=process.env.PORT || 3000;
const static_path=path.join(__dirname,"../public");
const template_path=path.join(__dirname,"../templates/views");
const partials_path=path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine","hbs")
app.set("views",template_path)
hbs.registerPartials(partials_path);
app.get("/",(req,res)=>{
    res.render("index")
});

app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.get("/partner",(req,res)=>{
    res.render("partner")
})
app.get("/booking-summary",(req,res)=>{
    res.render("order-summary")
})
app.post("/register",async(req,res)=>{
    try{
        const password=req.body.password;
        const cpassword=req.body.confirmpassword;
        if(password===cpassword){
            const registerUser= new Register({
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
                mobile: req.body.mobile
            })
            const registered= await registerUser.save();
            console.log("User registered:", registered)
            res.status(201).redirect("/");
        }else{
            console.log("password do not match");
            res.send("password are not matching");
        }

    }catch(error){
        console.log("Error during registration: ",error);
        res.status(400).send(error);
    }
})
app.post("/login",async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        console.log(`${email} and password is ${password}`);
        const useremail =await Register.findOne({email:email});
        if(useremail.password===password){
            res.status(201).render("index");

        }
        else{
            res.send("password are not matching");
        }

    }catch(error){
        res.status(400).send("Invalid email")
    }
})
// Define the price per luggage item
const PRICE_PER_LUGGAGE = 10; // Replace with your actual price

// POST route for handling the form submission
app.post('/booking-summary', (req, res) => {
    // Extract data from the request body
    const { location, checkInDate, checkOutDate, luggageItems } = req.body;

    // Calculate the number of days between check-in and check-out dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Calculate the total price
    const totalPrice = numberOfDays * luggageItems * PRICE_PER_LUGGAGE;

    // Render the order-summary template with the data
    res.render('booking-summary', { 
        orderSummary: {
            location,
            checkInDate,
            checkOutDate,
            luggageItems,
        },
        numberOfDays,
        totalPrice
    });
});




app.listen(port,()=>{
    console.log(`server is running at port no ${port}`)
})
