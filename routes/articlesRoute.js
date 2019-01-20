const express = require("express");
const Article = require('../models/article');
const User = require('../models/user');

// Express Router Function
const router = express.Router();

// Route for : article/add 
router.route('/add')
  .get((req, res) => {
    res.render("add_article", {
      title: "Add Article",
      url: req.originalUrl
    });
  })
  .post((req, res) => {
    req.checkBody('title', '<strong>Title</strong> is Required !').notEmpty();
    req.checkBody('body', '<strong>Body</strong> is Required !').notEmpty();
    let errors = req.validationErrors();

    if(errors){
      res.render("add_article", {
        title: "Add Article",
        url: req.originalUrl,
        error: errors
      });
    } else {
      if (req.user) {
        var article = new Article({
          title: req.body.title,
          author: req.user._id,
          body: req.body.body
        });
    
        article.save(err => {
          if (err) {
            res.send(err);
          } else {
            res.flash('success', 'Articles Added');
            res.redirect("/");
          }
        });     
      } else {
        res.flash('error', 'You have to Log In before Adding Articles !');
        res.redirect(req.originalUrl);
      }
    }
  });

// Route for /article/(id)
router
  .route("/:id")
  .get((req, res) => {
    Article.findById(req.params.id, (err, artc) => {
      if (err) {
        res.send(err);
      } else {
        User.findById(artc.author)
          .exec((err, auth) => {
            if(err){
              throw err;
            } else {
              res.render("article", {
                title: "Article",
                article: artc,
                author: auth.name
              });
            }
        });
      }
    });
  })
  .delete((req, res) => {
    const query = { _id: req.params.id };
    Article.deleteOne(query).exec(err => {
      res.flash("success", "Article Deleted");
      res.send();
    });
  });

// Route for /article/edit/(id)
router.route('/edit/:id')
  .get((req, res) => {
    Article.findById(req.params.id, (err, item) => {
      if(err){
        res.json(err);
      } else {
        res.render("edit_article", {
          title: "Edit Article",
          doc: item,
          url: req.originalUrl
        });
      }
    })
  })
  .post((req, res) => {
    const query = { _id: req.params.id };
    const article = {
      title: req.body.title,
      body: req.body.body
    };

    Article.updateOne(query, article, (err) => {
      if (err) {
        res.json(err);
      } else {
        res.flash('success', 'Artcile Edited');
        res.redirect('/');
      }
    });
  });

module.exports = router;
