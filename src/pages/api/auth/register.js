
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { compare, hash } from 'bcrypt';
const saltRounds = 8;
import { z } from "zod";

import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API)

import conn from '@/lib/db';

export default async (req, res) => {
    if (req.method === 'POST') {
        req.body = JSON.parse(req.body)
        const errors = []

        if (!req.body.username) {
            errors.push({
                input: 'username',
                message: 'Username is required'
            })
        }
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


        // check email is in correct format
        try {
            z.string().email().parse(req.body.email)
        } catch (err) {
            errors.push({
                input: 'email',
                message: 'Email is not in correct format'
            })
        }

        if (errors.length > 0) {
            res.status(400).send({error: true, message: 'Account not created', errors: errors});
            return
        }

        let username = req.body.username.toLowerCase();
        let email = req.body.email.toLowerCase();
        let password = req.body.password;

        // check if username or email is already in use
        const check = await conn.query(`
            SELECT * FROM users WHERE username = '${username}' OR email = '${email}'
        `)
        if (check.rows.length > 0) {
            // check if its username or email that is already in use
            if (check.rows[0].email === email) {
                errors.push({
                    input: 'email',
                    message: 'Email is already taken'
                })
            }
            if (check.rows[0].username === username) {
                errors.push({
                    input: 'username',
                    message: 'Username is already taken'
                })
            }
        }
        if (errors.length > 0) {
            res.status(400).send({error: true, message: 'Account not created', errors: errors});
            return
        }



        const confirm_token = uuidv4();
        // create a new OLD API STUFF
        try {
            const passwordHash = await hash(password, saltRounds);

            const query = await conn.query(`
                INSERT INTO users (username, email, password, confirmation_token)
                VALUES ('${username}', '${email}', '${passwordHash}', '${confirm_token}')
            `)
        } catch (err) {
            return res.status(400).send({
                error: true,
                message: err.message
            })
        }

        // send confirmation email
        try {
            const msg = {
                from: {email:'accounts@flowcook.com', name: 'Accounts at Flowcook'},
                template_id: 'd-f39c6bcb6f5844788ed9867575f9e201',
                personalizations: [
                    {
                        to: email,
                        dynamic_template_data: {
                            verify_url: 'https://flowcook.com/api/auth/email-confirmation/' + confirm_token,
                        }
                    }
                ]
            }
            await sgMail.send(msg)
            return res.status(200).send({
                error: false,
                message: 'User created'
            })
        } catch (err) {
            return res.status(500).send({
                error: true,
                message: err.message
            })
        }
    }
}
