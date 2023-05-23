import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'
import Router from 'next/router'
import {useStoreActions} from "easy-peasy";
import sizeOf from 'buffer-image-size'
import Jimp from 'jimp'

export async function verifyToken(jwtToken) {
    try {
        let tokenData = jwt.verify(jwtToken.split(' ')[1], process.env.TOKEN);
        if (tokenData) {
            const res = await fetch(process.env.BASE + process.env.VERCEL_URL + '/api/auth/verify', {
                method: 'POST',
                body: JSON.stringify({
                    token: jwtToken
                }),
            });
            const data = await res.json();
            if (data.error) {
                console.log('libutilsverify dataerror:', data);
                return null;
            }
            return tokenData
        }
    } catch (e) {
        console.log('libutilsverify verifyerror:', e);
        return null;
    }
}

// used on most of the internal dashboard pages to verify the request
export async function verifyRequest(req, res, conn) {
    let cookies = getAppCookies(req);
    if (!cookies.token) {
        return null
    }
    const session = cookies.token ? await verifyToken(cookies.token) : '';
    // console.log(session.session)
    let user;
    if (session) {
        try {
            let getSession = await conn.query(`SELECT * FROM sessions WHERE id = '${session.session}'`)
            user = await conn.query(`SELECT * FROM users WHERE id = '${getSession.rows[0].user_id}'`)
            user = user.rows[0]
        } catch (err) {
            res.status(401).json({error: true, message: 'Unauthorized'});
            return
        }
    }
    if (!session) {
        res.status(401).json({error: true, message: 'Unauthorized'});
        return
    }
    if (!user) {
        res.status(401).json({error: true, message: 'Unauthorized'});
        return
    }
    return user
}

const dashboardPages = ['/dashboard', '/dashboard/recipes', '/dashboard/recipes/[id]']
const adminPages = ['/dashboard/admin']


export async function getUserAuth(token, path) {
    if (!token) {
        if (dashboardPages.includes(path)) {
            return {
                redirect: '/login'
            }
        }
        if (adminPages.includes(path)) {
            return {
                redirect: '/login'
            }
        }
        return null
    }
    if (token) {
        let user = await fetch( '/api/auth/verify', {
            method: 'POST',
            body: JSON.stringify({
                token: token
            }),
        })
        let data = await user.json()
        if (data.error) {
            if (dashboardPages.includes(path)) {
                return {
                    redirect: {
                        destination: '/login',
                        permanent: false,
                    },
                }
            }
            if (adminPages.includes(path)) {
                return {
                    redirect: '/login'
                }
            }
        }
        if (data.user && !data.user.staff) {
            if (adminPages.includes(path)) {
                return {
                    redirect: '/dashboard'
                }
            }
        }
        return data.user
    }
}
export function getAppCookies(req) {
    const parsedItems = {};
    if (req.headers.cookie) {
        const cookiesItems = req.headers.cookie.split('; ');
        cookiesItems.forEach(cookies => {
            const parsedItem = cookies.split('=');
            parsedItems[parsedItem[0]] = decodeURI(parsedItem[1]);
        });
    }
    return parsedItems;
}
export function absoluteUrl(req, setLocalhost) {
    var protocol = 'https:';
    var host = req
        ? req.headers['x-forwarded-host'] || req.headers['host']
        : window.location.host;
    if (host.indexOf('localhost') > -1) {
        if (setLocalhost) host = setLocalhost;
        protocol = 'http:';
    }
    return {
        protocol: protocol,
        host: host,
        origin: protocol + '//' + host,
        url: req,
    };
}
export async function setLogout(e, setUser) {
    e.preventDefault();
    let token = Cookies.get('token');
    let jwtToken = token.split(' ')[1];
    // expire session
    await fetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({
            token: jwtToken
        }),
    });
    Cookies.remove('token');
    setUser(null);
    return
}

export function getNumberSuffix(num) {
    const th = 'th'
    const rd = 'rd'
    const nd = 'nd'
    const st = 'st'

    if (num === '11' || num === '12' || num === '13') return th

    let lastDigit = num.toString().slice(-1)

    switch (lastDigit) {
        case '1': return st
        case '2': return nd
        case '3': return rd
        default:  return th
    }
}

export async function processAvatar(buffer) {
    const dimensions = sizeOf(buffer)
    const read = await Jimp.read(buffer)
    const width = dimensions.width > 300 ? 300 : dimensions.width
    let resize = await read.resize(width, width)
    let convert = await resize.getBufferAsync(Jimp.MIME_JPEG)

    let r;
    try {
        r = await gm(convert)
            .compress('JPEG')
            .quality(70)
            .toBuffer('JPEG', function (err, buff) {
                if (err) {
                    console.log('gm error', err)
                    return
                }
                return buff
            })
    } catch (err) {
        console.log('gm error', err)
        return
    }


}
