const express = require("express")
const helmet = require("helmet")
const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config()

// ** Init API ** //
const app = express()

// ** Import routers
const sauceRoutes = require("./routes/sauce")
const userRoutes = require("./routes/user")

// ** Database connection ** //
mongoose.set("strictQuery", true) // Ensure that only the fields that are specified in the schema will be saved in the database
mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"))

// ** Middleware to handle errors CORS ** //
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  )
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  )
  next()
})

// ** Middleware to intercept all requests that have a JSON content type ** //
app.use(express.json())
// ** Middleware Helmet to secure the app by setting various HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }))

// ** ROUTES ** //
app.use("/api/sauces", sauceRoutes)
app.use("/api/auth", userRoutes)
app.use("/images", express.static(path.join(__dirname, "images")))

module.exports = app
