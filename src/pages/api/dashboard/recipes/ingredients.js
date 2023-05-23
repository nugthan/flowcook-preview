import conn from "@/lib/db";
import {getAppCookies, verifyRequest, verifyToken} from "@/lib/utils";
import badwords from "bad-words";

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
        return
    }
    // fetch ingredient / ingredients based on query
    if (req.method === "GET") {
        const {search} = req.query;

        let rows;
        if (!search) {
            // get all tags
            const tags = await conn.query(`
            SELECT * FROM ingredients LIMIT 10
        `);
            rows = tags.rows;
        } else {
            // search tags
            const ingredients = await conn.query(`
            SELECT * FROM ingredients WHERE name LIKE '%${search}%' ORDER BY RANDOM LIMIT 10
        `);
            rows = ingredients.rows;
        }
        // convert to format needed
        const ingredients = rows.map((row) => {
            return {
                id: row.id,
                value: row.name,
                label: row.name,
            };
        });
        res.status(200).send({error: false, data: ingredients})
    }
    if (req.method === "POST") {
        const {name, group} = JSON.parse(req.body);

        // add tag
        try {
            let filter = new badwords();
            if (filter.isProfane(name)) {
                res.status(200).send({error: true, message: 'Ingredient cannot contain profanity'});
                return
            }

            let newIngredient;
            const ingredient = await conn.query(`INSERT INTO ingredients (name, group) VALUES ('${name}', true) RETURNING *`);
            newIngredient = {
                id: ingredient.rows[0].id,
                value: ingredient.rows[0].name,
                label: ingredient.rows[0].name,
                group: ingredient.rows[0].group
            }
            if (group) {

            } else {
                const ingredient = await conn.query(`INSERT INTO ingredients (name) VALUES ('${name}') RETURNING *`);
                newIngredient = {
                    id: ingredient.rows[0].id,
                    value: ingredient.rows[0].name,
                    label: ingredient.rows[0].name,
                }
            }
            res.status(200).send({error: false, data: newIngredient});
        }
        catch (e) {
            res.status(500).send({error: true, message: 'Ingredient already exists'});
            return
        }

    }
}
