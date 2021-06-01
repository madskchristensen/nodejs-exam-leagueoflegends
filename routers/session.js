const router = require("express").Router();

router.get("/getSession", (req, res) => {
    if (process.env.NODE_ENV === "development") {
        res.send({ session: req.session });

    } else {
        res.sendStatus(403);
    }
});

router.get("/getUser", (req, res) => {
    const loggedIn = req.session.loggedIn;

    if (loggedIn) {
        const user = req.session.user;
        delete user.details;
        delete user._id;

        res.send(user);

    } else {
        res.sendStatus(401);
    }
})

module.exports = {
    router
}
