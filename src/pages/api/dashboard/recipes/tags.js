import {verifyRequest} from "@/lib/utils";
import conn from "@/lib/db";
import badwords from "bad-words";

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
        return
    }
    if (req.method === "GET") {
        const {search} = req.query;

        let rows;
        if (!search) {
            // get all tags
            const tags = await conn.query(`
            SELECT * FROM tags LIMIT 10
        `);
            rows = tags.rows;
        } else {
            // search tags
            const tags = await conn.query(`
            SELECT * FROM tags WHERE name LIKE '%${search}%' LIMIT 10
        `);
            rows = tags.rows;
        }
        // convert to format needed
        const tags = rows.map((row) => {
            return {
                id: row.id,
                value: row.name,
                label: row.name,
            };
        });
        res.status(200).send({error: false, data: tags})
    }
    if (req.method === "POST") {
        const {name} = JSON.parse(req.body);

        // add tag
        try {
            let filter = new badwords();
            if (filter.isProfane(name)) {
                res.status(200).send({error: true, message: 'Tag cannot contain profanity'});
                return
            }


            const tag = await conn.query(`INSERT INTO tags (name) VALUES ('${name}') RETURNING *`);
            let newTag = {
                id: tag.rows[0].id,
                value: tag.rows[0].name,
                label: tag.rows[0].name,
            }
            res.status(200).send({error: false, data: newTag});
        }
        catch (e) {
            res.status(500).send({error: true, message: 'Tag already exists'});
            return
        }

    }
}
