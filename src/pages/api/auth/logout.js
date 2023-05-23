import conn from '@/lib/db';
import jwt from "jsonwebtoken";


// create default function with jwtCheck_old middleware
export default async (req, res) => {
    if (req.method === 'POST') {
        req = JSON.parse(req.body)
        let session;
        // check token is valid
        try {
            session = jwt.verify(req.token, process.env.TOKEN)
            session = session.session
        } catch(err) {
            res.status(500).send({
                error: true,
                message: "Invalid session"
            })
            return
        }
        // update the session to be expired
        try {
            const query = await conn.query(`
            UPDATE sessions SET expired = true WHERE id = '${session}'
        `)
            res.status(200).send({error: false, message: ""})
        } catch (err) {
            res.status(400).send({error: true, message: err.message})
        }
    }

}
