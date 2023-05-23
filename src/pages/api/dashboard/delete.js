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



export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }
    let body = JSON.parse(req.body);

    if (req.method === 'POST') {
            if (body.type === 'avatar') {
                try {
                    await minioClient.removeObject('cdn.flowcook.com', 'avatar/' + user.id +'.jpg')

                    res.status(200).send({error: false, message: 'File deleted successfully'})
                } catch (err) {
                    res.status(500).send({error: true, message: err.message})
                }
            }
            if (body.type === 'step') {
                // check user has access to recipe
                let recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${body.data.recipe_id}' AND user_id = '${user.id}'`)
                if (recipe.rows.length === 0) {
                    res.status(500).send({error: true, message: 'User does not have access to this recipe'})
                    return
                }

                try {
                    await minioClient.removeObject('cdn.flowcook.com', 'recipes/' + body.data.recipe_id + '/' + body.data.step_id + '-' + body.data.image_id +'.jpg')
                    await conn.query(`DELETE FROM recipe_images WHERE recipe_id = '${body.data.recipe_id}' AND step_id = '${body.data.step_id}' AND image_id = '${body.data.image_id}'`)

                    res.status(200).send({error: false, message: 'File deleted successfully'})
                } catch (err) {
                    res.status(500).send({error: true, message: err.message})
                }
            }

            if (body.type === 'recipe') {
                // check user has access to recipe
                let recipe = await conn.query(`SELECT * FROM recipes WHERE id = '${body.data.id}' AND user_id = '${user.id}'`)
                if (recipe.rows.length === 0) {
                    res.status(500).send({error: true, message: 'User does not have access to this recipe'})
                    return
                }
                try {
                    await minioClient.removeObject('cdn.flowcook.com', 'recipes/' + body.data.id + '/' + body.data.cover_image +'.jpg')
                    await conn.query(`UPDATE recipes SET cover_image = null WHERE id = '${body.data.id}'`)

                    res.status(200).send({error: false, message: 'File deleted successfully'})
                } catch (err) {
                    res.status(500).send({error: true, message: err.message})
                }
            }
    }
}
