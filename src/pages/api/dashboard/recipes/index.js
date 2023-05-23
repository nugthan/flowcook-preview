import conn from "@/lib/db";
import {getAppCookies, verifyRequest, verifyToken} from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import {nanoid} from "nanoid";
import randomWords from "random-words";
// get all recipes by author, and author information
export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }

    // get all recipes by author
    if (req.method === 'GET') {
        // get query on url
        let query = req.query;
        try {
            let recipes = await conn.query(`
                SELECT recipes.*, users.username, users.display_name
                FROM recipes
                INNER JOIN users
                ON users.id = recipes.user_id
                WHERE user_id = '${user.id}'
                ${query.nodrafts === 'true' ? 'AND status != \'draft\'' : ''}
                
                ORDER BY recipes.created_at DESC 
                LIMIT ${query.limit || 400}
            `);

            for (let i in recipes.rows) {
                if (recipes.rows[i].prepTime) {
                    recipes.rows[i].prepTime = recipes.rows[i].steps.reduce((a, b) => a + b.time, 0);
                }
            }
            // get recipe bookmarks if stats is set
            if (query.stats) {
                let bookmarks = await conn.query(`
                    SELECT recipe_id, COUNT(*) as count
                    FROM bookmarks
                    WHERE recipe_id IN ('${recipes.rows.map(r => r.id).join(',')}')
                    GROUP BY recipe_id
                `);
                for (let i in recipes.rows) {
                    let bookmark = bookmarks.rows.find(b => b.recipe_id === recipes.rows[i].id);
                    recipes.rows[i].bookmarks = bookmark ? bookmark.count : 0;
                }
            }


            res.status(200).json({error: false, data: recipes.rows});


        } catch(err) {
            console.log(err);
            res.status(500).json({error: true, message: err.message});
        }
    }
    // create a new recipe
    if (req.method === 'POST') {
        try {
            // generate uuid
            let uuid = nanoid(7)
            let title = 'Draft recipe ' + uuid;

            let recipe = await conn.query(`
                INSERT INTO recipes (title, user_id)
                VALUES ('${title}', '${user.id}')
                RETURNING *
            `);

            res.status(200).json({error: false, data: recipe.rows[0]});

        } catch(err) {
            console.log(err);
            res.status(500).json({error: true, message: err.message});
        }
    }
    if (req.method === 'DELETE') {
        let body = JSON.parse(req.body);
        try {
            await conn.query(`DELETE FROM recipes WHERE id = '${body.id}' AND user_id = '${user.id}'`);
            res.status(200).json({error: false, message: 'Recipe deleted'});
        } catch (err) {
            res.status(500).json({error: true, message: err.message});
            return
        }
    }
}
