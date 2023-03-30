const fs = require("fs")
const Sauce = require("../models/Sauce")

// ** CREATE SAUCE ** //
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce)
  delete sauceObject._id
  delete sauceObject._userId
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  })
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
    .catch((error) => res.status(400).json({ error }))
}

// ** MODIFY SAUCE ** //
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body }

  delete sauceObject._userId
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" })
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié!" }))
          .catch((error) => res.status(401).json({ error }))
      }
    })
    .catch((error) => {
      res.status(400).json({ error })
    })
}

// ** DELETE SAUCE ** //
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" })
      } else {
        const filename = sauce.imageUrl.split("/images/")[1]
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimé !" })
            })
            .catch((error) => res.status(401).json({ error }))
        })
      }
    })
    .catch((error) => {
      res.status(500).json({ error })
    })
}

// ** GET ONE SAUCE ** //
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }))
}

// ** GET ALL SAUCE ** //
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }))
}

// ** LIKE & DISLIKE SAUCE ** //
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1:
          if (
            !sauce.usersLiked.includes(req.auth.userId) &&
            !sauce.usersDisliked.includes(req.auth.userId)
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } }
            )
              .then(() => res.status(200).json({ message: "Like Ajouté" }))
              .catch((error) => res.status(401).json({ error }))
          } else {
            res.status(403).json({ message: "Not authorized" })
          }
          break

        case -1:
          if (
            !sauce.usersDisliked.includes(req.auth.userId) &&
            !sauce.usersLiked.includes(req.auth.userId)
          ) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.auth.userId },
              }
            )
              .then(() => res.status(200).json({ message: "Dislike Ajouté" }))
              .catch((error) => res.status(401).json({ error }))
          } else {
            res.status(403).json({ message: "Not authorized" })
          }
          break

        case 0:
          if (sauce.usersLiked.includes(req.auth.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } }
            )
              .then(() => res.status(200).json({ message: "Like Supprimé" }))
              .catch((error) => res.status(401).json({ error }))
          } else if (sauce.usersDisliked.includes(req.auth.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.auth.userId },
              }
            )
              .then(() => res.status(200).json({ message: "Like Supprimé" }))
              .catch((error) => res.status(401).json({ error }))
          } else {
            res.status(403).json({ message: "Not authorized" })
          }
          break

        default:
          null
      }
    })
    .catch((error) => res.status(404).json({ error }))
}
