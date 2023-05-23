import conn from '@/lib/db';
import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import {z} from "zod";

export default async (req, res) => {
    if (req.method === 'POST') {
        req.body = JSON.parse(req.body);
        let errors = []

        if (!req.body.email) {
            errors.push({
                input: 'email',
                message: 'Email is required'
            })
        }
        if (!req.body.password) {
            errors.push({
                input: 'password',
                message: 'Password is required'
            })
        }

        // if email contains @, its an email, otherwise assume its a username
        let type = 'email';
        if (req.body.email.indexOf('@') > -1) {
            type = 'email';
        } else {
            type = 'username';
        }


        if (type === 'email') {
            try {
                z.string().email().parse(req.body.email)
            } catch (err) {
                errors.push({
                    input: 'email',
                    message: 'Email is not in correct format'
                })
            }
        }


        if (errors.length > 0) {
            res.status(400).send({error: true, message: 'Unable to login', errors: errors});
            return
        }

        try {
            let email = req.body.email.toLowerCase();
            let query = await conn.query(`SELECT * FROM users WHERE email = '${email}' OR username = '${email}' LIMIT 1`);
            let user = query.rows[0];
            // check if OLD API STUFF exists
            if (!user) {
                console.log('user not found')
                res.status(400).send({error: true, message: 'Email or password is incorrect'});
                return
            }
            // check if password is correct
            const checkHash = await compare(req.body.password, user.password);
            if (!checkHash) {
                console.log('password is incorrect')
                res.status(400).send({error: true, message: 'Email or password is incorrect'});
            }

            const session = await conn.query(`
                INSERT INTO sessions (user_id)
                VALUES ('${user.id}')
                RETURNING *
            `)
            // create a jwt token
            const token = sign({
                session: session.rows[0].id,
            }, process.env.TOKEN, {
                expiresIn: '7d'
            })


            // return the token
            return res.status(200).json({error: false, token: 'Bearer ' + token});


        } catch (err) {
            res.status(500).json({error: true, message: err.message});
        }
    }
}
