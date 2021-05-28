const router = require("express").Router();

router.get("/getSession", (req, res) => {
    res.send({ session: req.session });
});

module.exports = {
    router
}
