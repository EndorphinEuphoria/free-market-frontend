export interface CartItem {
    idProduct: number;
    name: string;
    price: number;
    url: string;
    quantity: number;
    stock:number;
}

export interface CartState {
    items: CartItem[];
}