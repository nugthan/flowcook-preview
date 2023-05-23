import {verifyRequest} from "@/lib/utils";
import conn from "@/lib/db";
import badwords from 'bad-words'

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }
    let body = JSON.parse(req.body);
    let filter = new badwords();
    if (filter.isProfane(body.title)) {
        res.status(200).send({error: true, message: 'Title contains profanity'});
        return
    }

    // check title
    if (req.method === 'POST') {
        let check = await conn.query(`SELECT * FROM recipes WHERE LOWER(title) = '${body.title.toLowerCase()}' AND user_id = '${user.id}' AND id != '${body.id}'`);
        if (check.rows.length > 0) {
            res.status(200).send({error: true, message: 'You already have a recipe with this name'});
            return
        }
        res.status(200).send({error: false});

    }
}
