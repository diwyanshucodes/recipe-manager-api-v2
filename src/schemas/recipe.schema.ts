import { z } from 'zod'

export const RecipeSchema = z.object({
    title : z.string().min(1),
    description : z.string().optional(),
    prep_time : z.coerce.number().positive().optional(),
    category : z.string(),
    ingredients : z.array(z.object({
        name : z.string(),
        amount : z.string(),
        unit : z.string()
    }))
})

export type  RecipeInput = z.infer<typeof RecipeSchema>;