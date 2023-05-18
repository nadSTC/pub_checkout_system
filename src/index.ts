/*
    COMMENTARY:

    1.  If you want to test your own combination of items in the cart, add more cart.addItem() calls
        below (before the .checkout()) call. Use any items you like from the test data (or you can create your own).

*/

import { Cart } from "./services/cart";
import { ITEMS } from "./services/db/data";

const cart = new Cart();
cart.addItem(ITEMS[0].sku);
cart.addItem(ITEMS[0].sku);
cart.addItem(ITEMS[0].sku);
console.log(cart.checkout());
