const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

router.route('/register')
	.get((req, res) => {
		res.render('register', {
			title: 'Register',
			url: req.originalUrl
		});
	})
	.post((req, res) => {
		let { name, email, username, password } = req.body;
		let user = new User({
			name: name,
			email: email,
			username: username,
			password: password
		});

		req.checkBody('name', '<strong>Name</strong> is Required').notEmpty();
		req.checkBody('email', '<strong>Email</strong> is Required').notEmpty();
		req.checkBody('username', '<strong>Username</strong> is Required').notEmpty();
		req.checkBody('password', '<strong>Password</strong> is Required').notEmpty();
		req.checkBody('confirm', '<strong>Confirm Password</strong> is Required').notEmpty();
		req.checkBody('confirm', '<strong>Password</strong> not matched').equals(password);

		let errors = req.validationErrors();
		res.locals.error = errors;

		if (errors) {
			res.render('register', {
				title: 'Register',
				url: req.originalUrl
			});
		} else {
			bcrypt.hash(user.password, 10, (err, hash) => {
				if (err) {
					console.error(err);
				} else {
					user.password = hash;
					user.save((err) => {
						if (err) {
							console.error(err);
						} else {
							req.flash('success', "You're registered, now you can Log In !");
							res.redirect('/user/login');
						}
					});
				}
			});
		}

	});

router.route('/login')
	.get((req, res) => {
		res.render('login', {
			title: 'Login',
			url: req.originalUrl
		});
	})
	.post((req, res, next) => {
		passport.authenticate('local', {
			successRedirect: '/',
			successFlash: true,
			failureRedirect: '/user/login',
			failureFlash: true
		})(req, res, next);
	});

router.route('/logout')
	.get((req, res) => {
		req.logout();
		req.flash('success', 'You are logged out');
		res.redirect('/');
	});

router.route('/:id')
	.get((req, res) => {
		if(!req.user){
			req.flash('error', 'Not Logged In')
			res.redirect('/');
		} else if(req.params.id != req.user._id){
			req.flash('error', 'Invalid User ID')
			res.redirect('/');
		} else {
			const query = { _id: req.params.id };
			User.findById(query)
				.exec((err, doc) => {
					if(err) return err;
					res.render('profile', {
						title: 'Profile',
						url: req.originalUrl,
						profile: doc
				});
			});
		}
	})
	.post((req, res) => {
		const {password} = req.body;
		req.checkBody('password', '<strong>Password</strong> is Required').notEmpty();
		req.checkBody('confirm', '<strong>Confirm Password</strong> is Required').notEmpty();
		req.checkBody('confirm', '<strong>Password</strong> not matched').equals(password);
		let errors = req.validationErrors();

		if(errors){
			const query = { _id: req.params.id };
			User.findById(query)
				.exec((err, doc) => {
					if(err) return err;
					res.render('profile', {
						title: 'Profile',
						url: req.originalUrl,
						profile: doc,
						error: errors
					});
			});
		} else {
			const query = {_id: req.params.id};
			bcrypt.hash(password, 10, (err, hash) => {
				const update = {password: hash};
				if(err) throw err;
				User.updateOne(query, update)
					.exec((err) => {
						if (err) {
							throw err;
						}
						req.flash('success', 'Password changed !');
						res.redirect(req.originalUrl);
					});
			});
		}
	});

module.exports = router;