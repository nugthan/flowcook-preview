import {verifyRequest} from "@/lib/utils";
import conn from "@/lib/db";

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }
    if (req.method === "POST") {
        let body = JSON.parse(req.body)
        // check recipe exists
        let recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${body.recipe_id}'`)
        if (!recipe.rows[0]) {
            res.status(500).send({error: true, message: 'Recipe not found'});
            return
        }
        // check user has not already bookmarked recipe
        let bookmark = await conn.query(`SELECT * FROM bookmarks WHERE user_id = '${user.id}' AND recipe_id = '${body.recipe_id}'`)
        // remove bookmark
        if (bookmark.rows[0]) {
            let remove = await conn.query(`DELETE FROM bookmarks WHERE user_id = '${user.id}'`)
            let result = await conn.query(`SELECT * FROM bookmarks WHERE user_id = '${user.id}'`)
            res.status(200).send({error: false, data: result.rows});
            return
        }
        // add bookmark
        let add = await conn.query(`INSERT INTO bookmarks (user_id, recipe_id) VALUES ('${user.id}', '${body.recipe_id}')`)
        let result = await conn.query(`SELECT * FROM bookmarks WHERE user_id = '${user.id}'`)
        res.status(200).send({error: false, data: result.rows});


    }
    if (req.method === "GET") {
        let bookmarks = await conn.query(`SELECT * FROM bookmarks WHERE user_id = '${user.id}'`)
        // get all the recipes relating to bookmarks
        if (bookmarks.rows.length > 0) {
            let ids = bookmarks.rows.map(b => b.recipe_id).join("','")
            let result = await conn.query(`
                                SELECT recipes.title, recipes.user_id, recipes.id, recipes.url, users.username, users.display_name  FROM recipes
                                INNER JOIN users ON users.id = recipes.user_id 
                                WHERE recipes.id IN ('${ids}')`)
            res.status(200).send({error: false, data: result.rows});
            return
        }
        res.status(200).send({error: false, data: []});
    }
}
