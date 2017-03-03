var express = require('express');
var passport = require('passport');
var router = express.Router();
var multer  = require('multer');
// var upload = multer({ dest: './public/images/' });
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '.jpg') 
  }
});

var upload = multer({ storage: storage });

let Work = require("../models/work");
let Portfolio = require("../models/portfolio");
let User = require("../models/user");

router.get('/', function(req, res, next) {

  Portfolio.find(function(err, portfolios){
    if(err)
    {
      res.send(err);
    }
    else if(!portfolios.length)
    {
      res.render('index', { title: 'Portfolio', user: req.user, message:"NO PORTFOLIOS HAVE BEEN CREATED YET",portfolios: null});
    }
    else
    {
      var totalPortfolios = portfolios.length,
        pageSize = 10;
        if(totalPortfolios % 10 == 0)
          var pageCount = totalPortfolios / pageSize;
        else
          var pageCount = (totalPortfolios - totalPortfolios % 10 )/ pageSize + 1;
       var currentPage = 1,
        portfoliosArrays =[],
        portfoliosList = [];
        while(portfolios.length > 0)
        {
          portfoliosArrays.push(portfolios.splice(0, pageSize));
        }
        if (typeof req.query.page !== 'undefined') {
           currentPage = +req.query.page;
        }
        portfoliosList = portfoliosArrays[+currentPage - 1];
        console.log("pageCount" + pageCount);
      res.render('index', { title: 'Portfolio', message:null, user: req.user, portfolios: portfoliosList,  pageSize: pageSize,
    totalPortfolios: totalPortfolios,
    pageCount: pageCount,
    currentPage: currentPage});
    }
  })

  
});

router.get('/login', function(req, res, next) {
  res.render('login.ejs', { message: req.flash('loginMessage') , user: req.user});
});

router.get('/signup', function(req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage'), user: req.user});
});

router.get('/profile', isLoggedIn, function(req, res) {
  Portfolio.findOne({_id: req.user.portfolio}, function(err, result){
          if(err)
          {
            res.send(err);
          }
          else if(!result)
          {
           res.render('profile',{user:req.user, message:null,portfolio:null}); 
          }
          else
          {
            Work.find({UID:req.user._id}, function(err, works){
              if(err)
              {
                res.send(err);
              }
              else
              {
                res.render('profile',{user:req.user, message:req.flash('portfolioMessage'),portfolio:result, works:works});              }
            })
            
          }
        });
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true,
  
}));

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
  
}));


router.post('/add-work', upload.single('screenshot'), function (req, res, next) {
  if(req.body.type == "1")
  {
    var newWork = new Work({
      title:req.body.title,
      type:1,
      details:req.body.url,
      UID:req.user._id
    });
  }
  else
  {
    var newWork = new Work({
      title:req.body.title,
      type:req.body.type,
      details:"images/"+req.file.filename,
      UID:req.user._id
    });
  }
      newWork.save(function(err, work){
      if(err)
      {
        res.send(err.message);
        console.log(err);
      }
      else
      {
        Portfolio.findOne({_id: req.user.portfolio}, function(err, result){
          if(err)
          {
            res.send(err);
          }
          else if(!result)
          {
           res.redirect('/profile');
          }
          else
          {
            result.works.push(work);
            res.redirect('/profile');
          }
        });
        
      }
    });  
});

router.post('/create-portfolio',function(req,res){
  Work.find({UID: req.user._id}, function(err, workList){
    if(err)
    {
      res.send(err.message);
    }
    else if(!workList.length)
    {
      res.render('profile.ejs',{message: "you have to add at least one work", user:req.user, portfolio:req.user.portfolio});
    }
    else
    {
      var newPortfolio = new Portfolio({
        name:req.body.name,
        UID:req.user._id,
        description:req.body.description,
        works : workList
      });
      newPortfolio.save(function(err, portfolio){
        if(err)
        {
          res.send(err.message);
          console.log(err);
        }
        else
        {
          User.findByIdAndUpdate(req.user._id, {portfolio: portfolio}, {multi: false}, function(err, user){
            if(err)
            {
              console.log(err);
            }
            else
            {
              console.log(user);
            }
          });          
         
        }
      })
      req.flash('portfolioMessage',"Congrats!\nYou have successfully created your portfolio!")
      res.redirect('/profile');
    }
  })
});

router.post('/change-pp',upload.single('pp'), function (req, res, next) {
  User.findById(req.user._id,function(err, user){
    if(err)
    {
      res.send(err);
    }
    else
    {
      Portfolio.findByIdAndUpdate(user.portfolio, {profilePicture:"images/"+req.file.filename}, {multi: false}, function(err, portfolio){
            if(err)
            {
              console.log(err);
            }
            else
            {
              res.redirect('/profile');
            }
          });
    }
  })
});

router.get('/view-portfolio', function(req, res){
  Portfolio.findById(req.param('id'), function(err, portfolio){
    if(err)
    {
      res.send(err);
    }
    else
    {
      Work.find({UID: portfolio.UID}, function(err, works){
        if(err)
        {
          res.send(err);
        }
        else
        {
          res.render('view-portfolio.ejs', {portfolio: portfolio, works: works, user:req.user});
        }
      })
    }
  })
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();
  res.redirect('/');
}
