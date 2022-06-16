var express = require('express'),
    router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Vishwas Basic Node Website',
        message: 'Welcome to my Basic Node Website'
    });
});

module.exports = router;