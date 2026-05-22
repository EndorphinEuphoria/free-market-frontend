export interface CartItem {
    idProduct: number;
    name: string;
    price: number;
    url: string;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
}