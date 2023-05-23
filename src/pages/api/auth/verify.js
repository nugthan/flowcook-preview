import conn from "@/lib/db";
import jwt from "jsonwebtoken";

// check user session
export default async (req, res) => {
    if (req.method === 'POST') {

        req = JSON.parse(req.body)
        let session;
        // check token is valid
        try {
            session = jwt.verify(req.token.split(' ')[1], process.env.TOKEN)
            session = session.session
        } catch(err) {
            res.status(500).send({
                error: true,
                message: "Invalid JWT"
            })
            return
        }
        // select session from db
        let check = await conn.query(`
                SELECT * FROM sessions WHERE id = '${session}'
                AND expired = false
            `)
        if (check.rows.length === 0) {
            res.status(500).send({
                error: true,
                message: "Invalid session"
            })
            return
        }
        // fetch user data
        let user = await conn.query(`
                SELECT id, username, email, created_at, updated_at, display_name FROM users WHERE id = '${check.rows[0].user_id}'
            `)
        user = user.rows[0]
        if (user === undefined) {
            res.status(500).send({
                error: true,
                message: "Invalid user"
            })
            return
        }
        // get bookmarks
        let bookmarks = await conn.query(`
                SELECT recipe_id FROM bookmarks WHERE user_id = '${user.id}'
            `)
        user.bookmarks = bookmarks.rows || []

        // check if staff
        let staff = await conn.query(`
                SELECT * FROM staff WHERE user_id = '${user.id}'
            `)
        if (staff.rows && staff.rows.length > 0) {
            user.staff = true
            user.role = staff.rows[0].role
        }
        // return user data
        res.status(200).send({
            error: false,
            user: user,
        })
    }
}
