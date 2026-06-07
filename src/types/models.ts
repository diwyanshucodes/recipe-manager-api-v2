export interface User {
    id : number;
    email : string;
    password_hash : string;
    created_at : Date
}

export interface Recipe {
    id : number;
    title : string;
    description? : string;
    category : string;
    prep_time? : number;
    user_id : number;
    created_at : Date
}

export interface Ingredient {
    id: number;
    name : string;
    amount : string;
    unit : string;
    recipe_id : number;
    created_at : Date
}

