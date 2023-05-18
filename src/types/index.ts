/* 
    COMMENTARY

    1.  Usually I would split the types into different folders/files depending on their use-case
        But because we have a small number of types, i'm going to leave them all in here.

    2.  I like to export both a type and interface version of the same structure, allowing 
        the end user to choose what they would like to use
    
    3.  I like to keep enums separated in a single file because I find it easier and cleaner to
        work with. All enums are exported with an associated 'type'
    
    4.  The models below should really have more properties like id, createdAt, updatedAt but
        I'm keeping it simple for this demonstration.

*/

import { PromotionApplication } from "./enums";

export * from "./enums";

// ---------------------------- MODELS ----------------------------
export type Item_LT = {
  sku: string;
  name: string;
  price: number;
  inventoryQty: number;
};
export interface Item extends Item_LT {}

export type Promotion_LT = {
  requiredItemSku: Item_LT["sku"]; // the sku of the item that the promotion is applied on
  requiredQty: number; // the number of sku required in the cart to be eligible for this promotion
  promotedItemSku: Item_LT["sku"]; // the product(sku) that will be affected by this promotion
  discount: number; // the discount applied to the 'promotedItemSku'
  application: PromotionApplication; // indicate if the discount should be applied on the transaction, all items of promotedItemSku or only the qualifying items of promotedItemSku
};
export interface Promotion extends Promotion_LT {}

export type CartItem_LT = Omit<Item_LT, "inventoryQty"> & {
  discount: number;
  quantity: number;
};
export interface CartItem extends CartItem_LT {}
