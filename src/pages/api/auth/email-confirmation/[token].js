import conn from '@/lib/db';

export default async (req, res) => {
    if (req.method === 'GET') {
        let token = req.query.token;
        try {
            // find OLD API STUFF based on token
            const query = await conn.query(`
                SELECT * FROM users WHERE confirmation_token = '${token}'
            `)
            let user = query.rows[0];
            if (!user) {
                return res.redirect('/login?errormessage=true&message=VGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IgY29uZmlybWluZyB5b3VyIGFjY291bnQuIFBsZWFzZSBjb250YWN0IHN1cHBvcnQgaWYgdGhpcyBpc3N1ZSBwZXJzaXN0cw==');
            }
            // update api
            const update = await conn.query(`
                UPDATE users SET
                confirmation_token = null
                WHERE id = '${user.id}'
            `)
            return res.redirect('/login?message=QWNjb3VudCBjb25maXJtZWQsIHlvdSBjYW4gbm93IGxvZ2luLg==');

        } catch (err) {
            return res.redirect('/login?errormessage=true&message=VGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IgY29uZmlybWluZyB5b3VyIGFjY291bnQuIFBsZWFzZSBjb250YWN0IHN1cHBvcnQgaWYgdGhpcyBpc3N1ZSBwZXJzaXN0cw==VGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IgY29uZmlybWluZyB5b3VyIGFjY291bnQuIFBsZWFzZSBjb250YWN0IHN1cHBvcnQgaWYgdGhpcyBpc3N1ZSBwZXJzaXN0cw==');
        }

    }
}
