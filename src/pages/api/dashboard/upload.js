import conn from "@/lib/db";
import minioClient from "@/lib/minio"
import {verifyRequest} from "@/lib/utils";
import formidable from "formidable";
import pngtojpg from "png-to-jpeg";
import fs from "fs";
import {v4 as uuidv4} from "uuid";
import {processAvatar} from "@/lib/utils";
import * as Jimp from "jimp";
import sizeOf from "buffer-image-size"
import { nanoid } from 'nanoid'

export const config = {
    api: {
        bodyParser: false
    }
}


export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }

    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.status(500).send({error: true, message: 'Error parsing form'});
                return
            }
            if (!files.file) {
                res.status(500).send({error: true, message: 'No file found'});
                return
            }
            // reject if larger than 5mb
            if (files.file.size > 5000000) {
                res.status(500).send({error: true, message: 'File too large'});
                return
            }

            if (fields.type === 'avatar') {
                if (files.file.mimetype !== 'image/jpeg' && files.file.mimetype !== 'image/png') {
                    res.status(500).send({error: true, message: 'Invalid file type'});
                    return
                }
                const avatar = fs.readFileSync(files.file.filepath);


                const dimensions = sizeOf(avatar);
                const size = dimensions.width > 300 ? 300 : dimensions.width;
                const image = await Jimp.read(avatar);
                const cover = await image.cover(size, size).getBufferAsync(Jimp.MIME_JPEG);

                await minioClient.putObject('cdn.flowcook.com', 'avatar/' + user.id +'.jpg', cover, {
                    'Content-Type': 'image/jpeg',
                    'x-amz-acl': 'public-read',
                    'x-amz-meta-for': 'avatar'
                })

                const fakeWait = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true)
                    }, 200)
                })

                // wait for 3 seconds to make sure the image is uploaded
                await fakeWait;

                res.status(200).send({error: false, message: 'File uploaded successfully'})
            }

            if (fields.type === 'step') {
                // get recipe
                const recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${fields.recipe}' AND user_id = '${user.id}'`);
                if (recipe.length === 0) {
                    res.status(500).send({error: true, message: 'Recipe not found'});
                    return
                }


                if (files.file.mimetype !== 'image/jpeg' && files.file.mimetype !== 'image/png') {
                    res.status(500).send({error: true, message: 'Invalid file type'});
                    return
                }
                const image = fs.readFileSync(files.file.filepath);
                const id = nanoid(10);
                const dimensions = sizeOf(image);
                // max width is 1200
                const width = dimensions.width > 1200 ? 1200 : dimensions.width;
                const read = await Jimp.read(image);
                const cover = await read.resize(width, Jimp.AUTO).getBufferAsync(Jimp.MIME_JPEG);

                try {
                    await minioClient.putObject('cdn.flowcook.com', 'recipes/' + fields.recipe + '/' + fields.step + '-' + id +'.jpg', cover, {
                        'Content-Type': 'image/jpeg',
                        'x-amz-acl': 'public-read',
                        'x-amz-meta-for': 'recipe'
                    })
                } catch (err) {
                    res.status(500).send({error: true, message: 'Error saving image'});
                    return
                }

                // add image to recipe in db
                let newRow;
                try {
                    newRow = await conn.query(`INSERT INTO recipe_images (recipe_id, step_id, image_id) VALUES ('${fields.recipe}', '${fields.step}', '${id}') RETURNING *`);
                } catch(err) {
                    res.status(500).send({error: true, message: 'Error saving image'});
                    return
                }



                const fakeWait = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true)
                    }, 200)
                })

                res.status(200).send({error: false, message: 'File uploaded successfully', row: newRow.rows[0]})

            }

            if (fields.type === 'recipe') {
                // get recipe
                const recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${fields.recipe}' AND user_id = '${user.id}'`);
                if (recipe.rows.length === 0) {
                    res.status(500).send({error: true, message: 'Recipe not found'});
                    return
                }

                if (files.file.mimetype !== 'image/jpeg' && files.file.mimetype !== 'image/png') {
                    res.status(500).send({error: true, message: 'Invalid file type'});
                    return
                }
                const image = fs.readFileSync(files.file.filepath);
                const id = nanoid(10);
                const dimensions = sizeOf(image);
                // max width is 1200
                const width = dimensions.width > 1200 ? 1200 : dimensions.width;
                const read = await Jimp.read(image);
                const cover = await read.resize(width, Jimp.AUTO).getBufferAsync(Jimp.MIME_JPEG);

                try {
                    // delete existing image
                    await minioClient.removeObject('cdn.flowcook.com', 'recipes/' + fields.recipe + '/' + recipe.rows[0].cover_image +'.jpg');

                    await minioClient.putObject('cdn.flowcook.com', 'recipes/' + fields.recipe + '/' + id +'.jpg', cover, {
                        'Content-Type': 'image/jpeg',
                        'x-amz-acl': 'public-read',
                        'x-amz-meta-for': 'recipe'
                    })
                } catch (err) {
                    res.status(500).send({error: true, message: 'Error saving image'});
                    return
                }

                try {
                    await conn.query(`UPDATE recipes SET cover_image = '${id}' WHERE id = '${fields.recipe}'`);
                } catch(err) {
                    res.status(500).send({error: true, message: 'Error saving image'});
                    return
                }



                const fakeWait = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve(true)
                    }, 200)
                })

                res.status(200).send({error: false, message: 'File uploaded successfully', id: id})

            }
        })
    }

    // if (req.method === "POST") {
    //     const form = new formidable.IncomingForm();
    //     // parse form
    //     form.parse(req, async (err, fields, files) => {
    //         if (err) {
    //             res.status(500).send({error: true, message: 'Error parsing form'});
    //             return
    //         }
    //         // check if file is present
    //         if (!files.file) {
    //             res.status(500).send({error: true, message: 'No file found'});
    //             return
    //         }
    //         // recipe image uploads
    //         if (fields.type === 'recipe') {
    //             // get the file type
    //             let fileType = files.file.mimetype.split('/')[1];
    //             // check if file type is valid
    //             if (fileType !== 'jpg' && fileType !== 'jpeg' && fileType !== 'png') {
    //                 res.status(500).send({error: true, message: 'Invalid file type'});
    //                 return
    //             }
    //             // if png, convert to jpg
    //             let buffer = fs.readFileSync(files.file.filepath);
    //
    //             // if (fileType === 'png') {
    //             //     pngtojpg({quality:90})(buffer)
    //             //         .then(output => fs.writeFileSync('./src/pages/api/temp/' + fields.step + '.jpeg', output))
    //             // } else {
    //             //     fs.writeFileSync('./src/pages/api/temp/' + fields.step + '.jpeg', buffer)
    //             // }
    //
    //         }
    //
    //
    //         res.status(200).send({error: false, message: 'File uploaded successfully'})
    //     });
    // }
}
