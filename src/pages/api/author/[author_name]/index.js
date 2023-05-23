import conn from "../../../../lib/db";
// get all recipes by author, and author information
export default async (req, res) => {
    if (req.method === 'GET') {
        const { author_id } = req.query;

        try {
            //create query
            let result = await conn.query(`
                SELECT recipes.*, users.username, users.display_name FROM recipes
                INNER JOIN users
                ON users.id = recipes.user_id
                WHERE user_id = '${author_id}'
            `);

            for (let i in result.rows) {
                result.rows[i].prepTime = result.rows[i].steps.reduce((a, b) => a + b.time, 0);
            }

            res.status(200).json({error: false, data: result.rows});


        } catch (err) {
            console.log(err);
            res.status(500).json({error: true, message: err.message});
        }
    }
}
