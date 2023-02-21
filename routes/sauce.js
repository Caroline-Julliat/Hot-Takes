const express = require("express")
const router = express.Router()

const sauceCtrl = require("../controllers/sauce")
const likeCtrl = require("../controllers/like")
const multer = require("../middleware/multer-config")
const auth = require("../middleware/auth")

router.post("/", auth, multer, sauceCtrl.createSauce)
router.put("/:id", auth, multer, sauceCtrl.modifySauce)
router.delete("/:id", auth, sauceCtrl.deleteSauce)
router.get("/:id", auth, sauceCtrl.getOneSauce)
router.get("/", auth, sauceCtrl.getAllSauces)
router.post("/:id/like", auth, likeCtrl.likeSauce)

module.exports = router