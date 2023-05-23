import {verifyRequest} from "@/lib/utils";
import conn from "@/lib/db";
import badwords from "bad-words";
import { compare, hash } from 'bcrypt';

export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }
    if (req.method === "POST") {
        let body = JSON.parse(req.body)
        let filter = new badwords();
        let errors = [];

        if (filter.isProfane(body.display_name)) {
            errors.push({
                input: 'display_name',
                message: 'Display name cannot contain profanity',
            });
        }
        if (body.current_password && body.new_password) {
            // check if current password is correct
            let current_password = await conn.query(`SELECT password FROM users WHERE id = '${user.id}'`)
            let check = await compare(body.current_password, current_password.rows[0].password)
            if (!check) {
                errors.push({
                    input: 'current_password',
                    message: 'Current password is incorrect',
                });
            } else {
                // update password
                let newPassword = await hash(body.new_password, 8)
                await conn.query(`UPDATE users SET password = '${newPassword}' WHERE id = '${user.id}'`)
            }
        }


        if (errors.length > 0) {
            res.status(400).send({error: true, message: 'User not updated', errors: errors});
            return;
        }

        await conn.query(`UPDATE users SET display_name = '${body.display_name}' WHERE id = '${user.id}'`)
        res.status(200).send({error: false, message: 'User updated'});

    }
}
