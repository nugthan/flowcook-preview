import conn from "@/lib/db";


export default async (req, res) => {
    const body = JSON.parse(req.body)
    if (req.method === 'POST') {
        // check token is valid
        let {rows} = await conn.query(`SELECT * FROM users WHERE reset_token = '${body.token}'`)
        if (rows.length === 0) {
            res.status(400).json({error: 'Invalid token'})
            return
        }
        res.status(200).json({})
    }
}
