import conn from "../../../../lib/db";

export default async (req, res) => {
    if (req.method === 'GET') {
        const {author_name, recipe_url} = req.query;

        try {
            const query = await conn.query(`
                SELECT recipes.*, users.username, users.display_name FROM recipes
                INNER JOIN users
                ON users.id = recipes.user_id
                WHERE url = '${recipe_url}' AND username = '${author_name}'
            `)
            let recipe = query.rows[0];

            // add view to recipe
            await conn.query(`UPDATE recipes set views = views + 1 WHERE id='${recipe.id}'`);

            // for each ingredient, search the db again in the [ingredients] table
            // and add the name to the [ingredients] array
            // for (let i = 0; i < recipe.ingredients.length; i++) {
            //     const ingredient = await conn.query(`SELECT * FROM ingredients WHERE id = '${recipe.ingredients[i].id}'`);
            //     recipe.ingredients[i].name = ingredient.rows[0].name;
            //
            //     // units
            //     const unit = await conn.query(`SELECT * FROM units WHERE id = '${recipe.ingredients[i].unit}'`);
            //     recipe.ingredients[i].unit_name = unit.rows[0].name;
            //     recipe.ingredients[i].unit_symbol = unit.rows[0].symbol;
            //
            // }

            // calculate the prep time


            res.status(200).json({error: false, data: recipe});


        } catch (err) {
            // console.log(err);
            res.status(500).json({error: true, message: err.message});
        }
    }
    if (req.method === 'PUT') {
        const {author_name, recipe_url} = req.query;
        const recipe = req.body;

            try {
                const query = await conn.query(`
                    UPDATE recipes SET
                    timeline_data = '${recipe}'
                    WHERE url = '${recipe_url}' AND user_id = (SELECT id FROM users WHERE username = '${author_name}')
                `)

                res.status(200).json({error: false, message: 'Recipe updated'});

            } catch (err) {
                // console.log(err);
                res.status(500).json({error: true, message: err.message});
            }
    }
}
