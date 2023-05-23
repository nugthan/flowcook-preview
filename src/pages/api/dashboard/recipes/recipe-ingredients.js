import {verifyRequest} from "@/lib/utils";
import conn from "@/lib/db";

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
        return
    }
    let body;
    try {
        body = JSON.parse(req.body);
    } catch (err) {
        res.status(500).send({error: true, message: 'Invalid JSON'});
        return
    }
    // check recipe is correct
    let recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${body.recipe_id}'`);
    if (recipe.rows.length === 0) {
        res.status(500).send({error: true, message: 'Recipe not found'});
        return
    }

    if (req.method === 'POST') {
        let newRow;
        try {
            newRow = await conn.query(`INSERT INTO recipe_ingredients (recipe_id, y) VALUES ('${body.recipe_id}', '${body.y}') RETURNING *`);
            newRow.rows[0].i = newRow.rows[0].id;
            newRow.rows[0].x = 0;
            newRow.rows[0].w = 1;
            newRow.rows[0].h = 1;

        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: 'Error creating ingredient'});
            return
        }

        res.status(200).send({error: false, message: 'ingredient created', ingredient: newRow.rows[0]});
    }
    if (req.method === 'DELETE') {
        try {
            await conn.query(`DELETE FROM recipe_ingredients WHERE id = '${body.ingredient_id}' AND recipe_id = '${body.recipe_id}'`);
        } catch (err) {
            console.log(err)
            res.status(500).send({error: true, message: 'Error deleting ingredient'});
            return
        }
        res.status(200).send({error: false, message: 'Step deleted'});
    }
}
