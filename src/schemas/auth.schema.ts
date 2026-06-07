import {z} from 'zod';


// register needs: email (valid email), password (min 6 chars)
export const RegisterSchema = z.object({
    email : z.email(),
    password : z.string().min(6)
})
// login needs: email, password
export const LoginSchema = z.object({
    email : z.email(),
    password : z.string()
})

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;