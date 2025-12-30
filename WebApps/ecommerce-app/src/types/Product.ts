export interface Product {
    id: string;
    name: string;
    category: string;
    summary: number;
    imageFile: string;
    description: string;
    price: number;
    pictureUrl?: string;
    units?: number;
}

export interface NewProduct {
    Name: string;
    Description: string;
    Price: number;
    PictureUri: string;
    Category: string;
    Stock: number;
}