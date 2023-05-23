import conn from '@/lib/db';
import { nanoid } from 'nanoid'
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API)
import { compare, hash } from 'bcrypt';

export default async (req, res) => {
    if (req.method === 'POST') {
        let body = JSON.parse(req.body);
        // check user with email exists
        let user = await conn.query(`SELECT * FROM users WHERE LOWER(email) = '${body.email.toLowerCase()}'`);
        console.log(user.rows)
        if (user.rows.length === 0) {
            res.status(200).send({})
            return
        }
        // create ID
        let token = nanoid(30);
        // add token to user
        await conn.query(`UPDATE users SET reset_token = '${token}' WHERE email = '${body.email}'`);

        // send email
        try {
            const msg = {
                from: {email:'accounts@flowcook.com', name: 'Accounts at Flowcook'},
                template_id: 'd-2e9e7224577d45cea2f186edf67086f9',
                personalizations: [
                    {
                        to: body.email,
                        dynamic_template_data: {
                            reset_url: 'https://flowcook.com/reset-password/' + token,
                        }
                    }
                ]
            }
            await sgMail.send(msg)
            return res.status(200).send({})
        } catch (err) {
            return res.status(500).send({
                error: true,
                message: err.message
            })
        }
    }
    if (req.method === 'PUT') {
        let body = JSON.parse(req.body);
        // check token exists
        let user = await conn.query(`SELECT * FROM users WHERE reset_token = '${body.token}'`);
        if (user.rows.length === 0) {
            res.status(400).send({error: true, message: 'Invalid reset token'})
            return
        }
        // update password
        let password = await hash(body.password, 8);
        await conn.query(`UPDATE users SET password = '${password}', reset_token = null WHERE reset_token = '${body.token}'`);
        return res.status(200).send({error: false, message: 'Password updated'})
    }
}
