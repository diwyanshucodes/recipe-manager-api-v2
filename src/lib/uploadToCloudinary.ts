import cloudinary from "./cloudinary";

export async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string>{
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type : 'image'
            },
            (error, result)=>{
                if(error) reject(error);
                else resolve(result!.secure_url);
            }
        ).end(buffer);
    });
}