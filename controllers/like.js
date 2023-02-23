const Sauce = require("../models/Sauce")

exports.likeSauce = (req, res, next) => {
  // Affichage du req.body
  console.log("--> CONTENU req.body - like Ctrl", req.body)
  //Réccupérer l'id dans l'URL de la requete
  console.log("--> CONTENU req.params - like Ctrl ", req.params)
  //Cet id va être utilisé pourchercher dans mongodb et dans mongo db de format de l'Id à un underscore
  // Mise au format de l'Id
  console.log("--> id en _id", { _id: req.params.id })

  console.log("auth user Id : ", req.auth.userId)
  console.log("body user Id : ", req.body.userId);
  console.log("params id : ", req.params.id)
  
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
    console.log(sauce.usersLiked)
      switch (req.body.like) {

        case 1:
          if (!sauce.usersLiked.includes(req.auth.userId) && !sauce.usersDisliked.includes(req.auth.userId)) {
            console.log("un like")
            
            Sauce.updateOne(
              { _id: req.params.id },
              { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } }
            )
              .then(() => res.status(200).json({ message: "Like Ajouté" }))
              .catch((error) => res.status(401).json({ error }))
          } else {
            res.status(403)
          }
          break

        case -1:
            if (!sauce.usersDisliked.includes(req.auth.userId) && !sauce.usersLiked.includes(req.auth.userId)) {
                console.log("un dislike")
                Sauce.updateOne(
                  { _id: req.params.id },
                  { $inc: { dislikes: 1 }, $push: { usersDisliked: req.auth.userId } }
                )
                  .then(() => res.status(200).json({ message: "Dislike Ajouté" }))
                  .catch((error) => res.status(401).json({ error }))
              } else {
                res.status(403)
              }
              break

        case 0:
            console.log("pas de vote");
          if (sauce.usersLiked.includes(req.auth.userId)) {
            console.log("like supprimé")
            Sauce.updateOne(
                { _id: req.params.id },
                { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } }
              )
                .then(() => res.status(200).json({ message: "Like Supprimé" }))
                .catch((error) => res.status(401).json({ error }))
          } else if (sauce.usersDisliked.includes(req.auth.userId)) {
            console.log("dislike supprimé")
            Sauce.updateOne(
                { _id: req.params.id },
                { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.auth.userId } }
              )
                .then(() => res.status(200).json({ message: "Like Supprimé" }))
                .catch((error) => res.status(401).json({ error }))
          } else {
            res.status(403)
          }
          break

        default:
          null
      }
    })
    .catch((error) => res.status(404).json({ error }))
}
