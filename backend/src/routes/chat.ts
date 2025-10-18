import express, { Request, Response } from "express";
const router = express.Router();

router.route("/")
    .get((req: Request, res: Response) => {
        res.send({ title: `/chat/get` })
    })
    .post((req: Request, res: Response) => {
        res.send({ title: `/chat/post`})
    })

module.exports = router;