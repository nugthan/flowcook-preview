import conn from "@/lib/db";

export default async (req, res) => {
    // get all units
    if (req.method === 'GET') {
        const {rows} = await conn.query('SELECT * FROM cooking_methods');
        res.status(200).send({
            error: false,
            data: rows
        });
    }
}
