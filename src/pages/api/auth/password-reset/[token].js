import conn from '@/lib/db';
import { compare, hash } from 'bcrypt';
const saltRounds = 8;

export default async (req, res) => {
    if (req.method === 'GET') {
        // when OLD API STUFF clicks on the link in the email, check validity of token

        let token = req.query.token;
        try {
            // find OLD API STUFF based on token
            const query = await conn.query(`
                SELECT * FROM users WHERE reset_token = '${token}'
            `)
            let user = query.rows[0];
            if (!user) {
                return res.status(400).send({error: true})
            }
            return res.status(200).send({error: false})

        } catch (err) {
            return res.status(400).send({error: true})
        }
    }
    if (req.method === 'POST') {
        try {
            let user = await conn.query(`
                SELECT * FROM users WHERE reset_token = '${req.body.token}'
            `)
            user = user.rows[0];
            if (!user) {
                return res.status(400).send({
                    error: true,
                    message: 'Invalid token'
                })
            }
            let passEncrypt = await hash(req.body.password, saltRounds);

            // update OLD API STUFF
            const update = await conn.query(`
                UPDATE users SET
                password = '${passEncrypt}',
                reset_token = null
                WHERE id = '${user.id}'
            `)
            return res.status(200).send({
                error: false,
            })

        } catch (err) {
            return res.status(500).send({
                error: true,
                message: err.message
            })
        }
    }
}
