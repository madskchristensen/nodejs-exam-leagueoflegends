const router = require("express").Router();

router.get("/getSession", (req, res) => {
    if (process.env.NODE_ENV === "development") {
        res.send({ session: req.session });

    } else {
        res.sendStatus(403);
    }
});

module.exports = {
    router
}
