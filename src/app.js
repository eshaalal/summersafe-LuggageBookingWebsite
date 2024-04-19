const express = require("express");
const path = require("path");
const exphbs = require('express-handlebars');
const session = require('express-session');
const Register = require("./models/registers");
const Booking = require("./models/booking"); // Require the booking model

const app = express();
const hbs = require("hbs");

require("./db/conn");

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "hbs")
app.set("views", template_path)
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index")
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.get("/register", (req, res) => {
    res.render("register")
});

app.get("/partner", (req, res) => {
    res.render("partner")
});

app.get("/booking-summary", (req, res) => {
    res.render("order-summary")
});
app.get("/order-success",(req,res)=>{
    res.render("order-success")
})
app.get("/contact",(req,res)=>{
    res.render("contact")
});


app.get("/profile", async (req, res) => {
    try {
        // Retrieve user's email from session
        const userEmail = req.session.userEmail;
        if (!userEmail) {
            return res.status(404).send("User not found");
        }

        // Find user in the database based on the email
        const user = await Register.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send("User not found");
        }
        const bookings = await Booking.find({ userEmail: userEmail });


        // Render profile page with user data
        res.render("profile", { userData: user,bookings:bookings });
    } catch (error) {
        console.log("Error fetching user data:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        
        if (password === cpassword) {
            const registerUser = new Register({
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
                mobile: req.body.mobile
            });

            const registered = await registerUser.save();
            console.log("User registered:", registered);

            // Store user's email in session
            req.session.userEmail = req.body.email;

            // Redirect to profile page after successful registration
            res.status(201).redirect("/");
        } else {
            console.log("Passwords do not match");
            res.send("Passwords do not match");
        }
    } catch (error) {
        console.log("Error during registration:", error);
        res.status(400).send(error);
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(`${email} and password is ${password}`);

        // Find user in the database based on the email
        const user = await Register.findOne({ email: email });

        // If user does not exist, return error
        if (!user) {
            return res.status(404).send("User not found");
        }

        // Check if the entered password matches the stored password
        if (user.password === password) {
            // Store user's email in session
            req.session.userEmail = email;

            // Redirect to index page after successful login
            return res.status(201).redirect("/");
        } else {
            return res.status(401).send("Passwords do not match");
        }

    } catch (error) {
        console.log("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Define the price per luggage item
const PRICE_PER_LUGGAGE = 10; // Replace with your actual price

// POST route for handling the form submission
app.post('/booking-summary', async (req, res) => {
    try {
        // Extract data from the request body
        const { location, checkInDate, checkOutDate, luggageItems } = req.body;

        // Calculate the number of days between check-in and check-out dates
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const numberOfDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        // Calculate the total price
        const totalPrice = numberOfDays * luggageItems * PRICE_PER_LUGGAGE;

        // Get the user's email from the session
        const userEmail = req.session.userEmail;

        // Create a new booking document
        const booking = new Booking({
            userEmail,
            location,
            checkInDate,
            checkOutDate,
            luggageItems,
            totalPrice
        });

        // Save the booking document to the database
        await booking.save();
        const user = await Register.findOne({ email: userEmail });

        // Push the booking details into the user's profile
        user.bookings.push(booking);
        await user.save();

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
    } catch (error) {
        console.error("Error saving booking:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/checkout', async (req, res) => {
    res.redirect('/order-success');
});


app.listen(port, () => {
    console.log(`server is running at port no ${port}`)
});