import conn from "../../../lib/db";

export default async (req, res) => {
    if (req.method === 'GET') {

        try {
            const recipes = await conn.query(`
                SELECT recipes.*, users.username, users.display_name FROM recipes
                INNER JOIN users 
                ON users.id = recipes.user_id
                WHERE status = 'public'
                AND mod_status = 'approved'
            `);

            for (let i in recipes.rows) {
                if (recipes.rows[i].prepTime) {
                    recipes.rows[i].prepTime = recipes.rows[i].steps.reduce((a, b) => a + b.time, 0);
                }
            }

            res.status(200).json({error: false, data: recipes.rows});

        } catch (err) {
            console.log(err);
            res.status(500).json({error: true, message: err.message});
        }
    }
}
