

function home(req,res){
    return res.render('index')
}

function page404(req, res) {
    res.status(404).render('404');
}

function page429(req, res) {
    res.status(429).render('429');
}

function page500(req, res) {
    res.status(500).render('500');
}


module.exports={home,page404,page429,page500};

