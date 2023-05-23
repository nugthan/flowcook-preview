import conn from "@/lib/db";

export default async (req, res) => {
    // get all units
    if (req.method === 'GET') {
        const {rows} = await conn.query('SELECT * FROM units');
        const units = rows.map((row) => {
            return {
                id: row.id,
                value: row.name,
                label: row.name,
                symbol: row.symbol
            };
        });

        res.status(200).send({
            error: false,
            data: units
        });
    }
}
