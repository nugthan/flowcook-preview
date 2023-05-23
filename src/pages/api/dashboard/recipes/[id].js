import conn from "@/lib/db";
import {verifyRequest} from "@/lib/utils";
import badwords from 'bad-words'
import minioClient from "@/lib/minio";
// get all recipes by author, and author information
export default async (req, res) => {
    let user = await verifyRequest(req, res, conn);
    if (!user) {
        res.status(500).send({error: true, message: 'User not found'});
    }

    // get a single recipe
    if (req.method === 'GET') {
        try {
            let recipe = await conn.query(`
            SELECT * FROM recipes
            WHERE user_id = '${user.id}' AND id = '${req.query.id}'
            `);
            recipe = recipe.rows[0];
            for (let i in recipe.rows) {
                if (recipe.rows[i].prepTime) {
                    recipe.rows[i].prepTime = recipe.rows[i].steps.reduce((a, b) => a + b.time, 0);
                }
            }

            // get all images
            let images = await conn.query(`SELECT * FROM recipe_images WHERE recipe_id = '${recipe.id}'`);
            recipe.images = images.rows;

            // get all steps
            let steps = await conn.query(`SELECT * FROM recipe_steps WHERE recipe_id = '${recipe.id}'`);
            recipe.steps = steps.rows.map((row) => {
                return {
                    i: row.id,
                    title: row.title,
                    x: 0,
                    y: row.y,
                    w: 1,
                    h: 1,
                    description: row.description,
                };
            });

            // get all tags
            let tags = await conn.query(`
                SELECT recipe_tags.*, tags.name 
                FROM recipe_tags 
                INNER JOIN tags
                ON tags.id = recipe_tags.tag_id
                WHERE recipe_id = '${recipe.id}'`);

            recipe.tags = tags.rows.map((row) => {
                return {
                    id: row.tag_id,
                    value: row.name,
                    label: row.name,
                };
            });

            // get all cooking methods
            let cookingMethods = await conn.query(`
                SELECT recipe_cooking_methods.*, cooking_methods.name
                FROM recipe_cooking_methods 
                INNER JOIN cooking_methods
                ON cooking_methods.id = recipe_cooking_methods.method_id
                WHERE recipe_id = '${recipe.id}'`);
            let methods = []
            cookingMethods.rows.forEach((method) => {
                methods.push({value: method.name, label: method.name, id: method.method_id})
            })

            recipe.cooking_methods = methods;

            // get all groups
            let groups = await conn.query(`SELECT * FROM recipe_ingredient_groups WHERE recipe_id = '${recipe.id}'`);
            recipe.groups = groups.rows


            // get all ingredients
            let getIngredients = await conn.query(`
                SELECT recipe_ingredients.*, ingredients.name, ingredients.id as ingredient_id, units.name as unit_name, units.symbol as unit_symbol
                FROM recipe_ingredients
                LEFT JOIN ingredients
                ON ingredients.id = recipe_ingredients.ingredient_id
                LEFT JOIN units
                ON units.id = recipe_ingredients.unit_id
                WHERE recipe_id = '${recipe.id}'
            `)

            const ingredients = getIngredients.rows.map((row) => {
                return {
                    i: row.id,
                    ingredient: {
                        id: row.ingredient_id,
                        value: row.name,
                        label: row.name,
                    },
                    quantity: row.quantity,
                    unit: {
                        id: row.unit_id,
                        value: row.unit_name,
                        label: row.unit_name,
                        symbol: row.unit_symbol
                    },
                    x: 0,
                    y: row.y,
                    w: 1,
                    h: 1,
                    group_id: row.group_id,
                };
            });
            recipe.ingredients = ingredients;


            res.status(200).json({error: false, data: recipe});

        } catch(err) {
            res.status(500).json({error: true, message: err.message});
        }
    }
    if (req.method === 'PUT') {
        const recipe = JSON.parse(req.body);
        let errors = [];
        try {
            // RECIPE CHECKS
            // check if recipe exists
            try {
                let dbRecipe = await conn.query(`
                SELECT * FROM recipes
                WHERE id = '${recipe.id}' AND user_id = '${user.id}'
            `);
                if (!dbRecipe.rows[0]) {
                    errors.push({
                        message: 'Recipe not found',
                    });
                    return
                }
            } catch {
                errors.push({
                    message: 'Recipe not found',
                });
                return
            }
            // check the recipe title for profanity and if is the same as other recipes by the author
            let filter = new badwords();
            if (filter.isProfane(recipe.title)) {
                errors.push({
                    input: 'title',
                    message: 'Recipe title cannot contain profanity',
                });
            }
            let titleCheck = await conn.query(`SELECT * FROM recipes WHERE LOWER(title) = '${recipe.title.toLowerCase()}' AND user_id = '${user.id}' AND id != '${recipe.id}'`);
            if (titleCheck.rows.length > 0) {
                errors.push({
                    input: 'title',
                    message: 'You already have a recipe with this name',
                });
            }
            // check the description for profanity
                if (filter.isProfane(recipe.description)) {
                    errors.push({
                        input: 'description',
                        message: 'Recipe description cannot contain profanity',
                    });
                }
            // check the instructions for profanity
            for (let i in recipe.steps) {
                if (filter.isProfane(recipe.steps[i].title)) {
                    errors.push({
                        input: 'steps',
                        message: 'Instructions cannot contain profanity',
                    });
                }
            }

            if (errors.length > 0) {
                res.status(400).send({error: true, message: 'Recipe not updated', errors: errors});
                return;
            }

            // set url value
            let url;
            if (recipe.title) {
                url = recipe.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }
            try {
                const query = await conn.query(`
                    UPDATE recipes SET
                    title = '${recipe.title}',
                    description = '${recipe.description ? recipe.description : ''}',
                    timeline_data = '${JSON.stringify(recipe.timeline_data)}',
                    status = '${recipe.status}',
                    url = '${url}'
                    WHERE id = '${recipe.id}' AND user_id = '${user.id}'
            `)
            } catch (err) {
                console.log('error doing main query')
            }

            try {
                // INGREDIENTS CHECKS
                // remove all ingredients from recipe and add new ones
                await conn.query(`DELETE FROM recipe_ingredients WHERE recipe_id = '${recipe.id}'`);
                let dbIngredients = await conn.query(`SELECT * FROM ingredients`);
                for (let i in recipe.ingredients) {
                    let ingredient = recipe.ingredients[i];
                    let validIngredient = dbIngredients.rows.filter(i => i.id === ingredient.ingredient.id);
                    if (validIngredient.length > 0) {
                        await conn.query(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit_id, y) VALUES ('${recipe.id}', '${ingredient.ingredient.id}', '${ingredient.quantity}', '${ingredient.unit.id}', '${ingredient.y}')`);
                    }
                }
            } catch (err) {
                console.log('error updating ingredients')
            }

            try {
                // remove all cooking methods from recipe and add new ones
                await conn.query(`DELETE FROM recipe_cooking_methods WHERE recipe_id = '${recipe.id}'`);
                // add recipe cooking methods to recipe_cooking_methods table
                let dbCookingMethods = await conn.query(`SELECT * FROM cooking_methods`);

                for (let i in recipe.cooking_methods) {
                    let method = recipe.cooking_methods[i];
                    // check the method is valid
                    let validMethod = dbCookingMethods.rows.filter(m => m.id === method.id);
                    if (validMethod.length > 0) {
                        await conn.query(`INSERT INTO recipe_cooking_methods (recipe_id, method_id) VALUES ('${recipe.id}', '${method.id}')`);
                    }
                }
            } catch (err) {
                console.log('error updating cooking methods')
            }

            try {
                // remove all tags from recipe and add new ones
                await conn.query(`DELETE FROM recipe_tags WHERE recipe_id = '${recipe.id}'`);
                let dbTags = await conn.query(`SELECT * FROM tags`);
                // add recipe tags to recipe_tags table
                for (let i in recipe.tags) {
                    let tag = recipe.tags[i];
                    // check the tag is valid
                    let validTag = dbTags.rows.filter(t => t.id === tag.id);
                    if (validTag.length > 0) {
                        await conn.query(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ('${recipe.id}', '${tag.id}')`);
                    }
                }
            } catch (err) {
                console.log('error updating tags')
            }

            try {
                let currentSteps = await conn.query(`SELECT * FROM recipe_steps WHERE recipe_id = '${recipe.id}'`);
                let currentStepIDs = currentSteps.rows.map(step => step.id);

                let newStepIDs = recipe.steps.map(step => step.i);
                let stepsToDelete = currentStepIDs.filter(id => !newStepIDs.includes(id));
                // delete any steps & images that are not present in recipe
                for (let i in stepsToDelete) {
                    let imagesToDelete = await conn.query(`SELECT * FROM recipe_images WHERE step_id = '${stepsToDelete[i]}'`);
                    for (let i in imagesToDelete.rows) {
                        await conn.query(`DELETE FROM recipe_images WHERE step_id = '${imagesToDelete.rows[i].step_id}'`);
                        await minioClient.removeObject('cdn.flowcook.com', 'recipes/' + recipe.id + '/' + imagesToDelete.rows[i].step_id + '-' + imagesToDelete.rows[i].image_id +'.jpg')
                    }
                    await conn.query(`DELETE FROM recipe_steps WHERE id = '${stepsToDelete[i]}' AND recipe_id = '${recipe.id}'`);
                }


            } catch (err) {
                console.log('error deleting unused steps')
            }

            try {
                for (let i in recipe.steps) {
                    let step = recipe.steps[i];
                    try {
                        await conn.query(`
                    UPDATE recipe_steps SET
                    title = '${step.title}',
                    description = '${step.description || ''}',
                    y = '${step.y}'
                    WHERE id = '${step.i}' AND recipe_id = '${recipe.id}'
                `)
                    } catch (err) {
                        console.log('error updating step')
                    }
                }
            } catch(err) {
                console.log('error adding / updating steps')
            }

            // try {
            //
            //     // find any steps that are present in dbRecipe that are not present in recipe
            //     let dbSteps = await conn.query(`SELECT * FROM recipe_steps WHERE recipe_id = '${recipe.id}'`);
            //     let dbStepIds = dbSteps.rows.map(step => step.i);
            //     let stepIds = recipe.steps.map(step => step.i);
            //     let stepsToDelete = dbStepIds.filter(id => !stepIds.includes(id));
            //     // delete any steps that are not present in recipe
            //     for (let i in stepsToDelete) {
            //         // delete any images associated with the step
            //         let images = await conn.query(`SELECT * FROM recipe_images WHERE step_id = '${stepsToDelete[i]}'`);
            //         for (let i in images.rows) {
            //             await conn.query(`DELETE FROM recipe_images WHERE step_id = '${images.rows[i].step_id}'`);
            //             await minioClient.removeObject('cdn.flowcook.com', 'recipes/' + recipe.id + '/' + images.rows[i].step_id + '-' + images.rows[i].image_id +'.jpg')
            //         }
            //         // delete step after otherwise it causes cascade error
            //         await conn.query(`DELETE FROM recipe_steps WHERE i = '${stepsToDelete[i]}' AND recipe_id = '${recipe.id}'`);
            //     }
            //
            //     // update recipe steps
            //     for (let i in recipe.steps) {
            //         let step = recipe.steps[i];
            //
            //         if (step.i) {
            //             try {
            //                 await conn.query(`
            //             UPDATE recipe_steps SET
            //             title = '${step.title}',
            //             description = '${step.description || ''}',
            //             y = '${step.y}'
            //             WHERE i = '${step.i}' AND recipe_id = '${recipe.id}'
            //         `)
            //             } catch (err) {
            //                 console.log(err);
            //             }
            //         }
            //     }
            // } catch (err) {
            //     console.log('error updating steps')
            // }

            res.status(200).json({error: false, message: 'Recipe updated'});

        } catch (err) {
            // console.log(err);
            res.status(500).json({error: true, message: err.message});
        }

    }
}
