/*
    DO NOT DELETE OR UPDATE EXISTING DATA BELOW
    They are used for the test cases. If you want to add your own data, append them to the
    end of the arrays.
*/
import { Item, Promotion, PromotionApplication } from "../../types";

export const ITEMS: Array<Item> = [
  {
    sku: "120P90",
    name: "Google Home",
    price: 49.99,
    inventoryQty: 10,
  },

  {
    sku: "43N23P",
    name: "MacBook Pro",
    price: 5399.99,
    inventoryQty: 5,
  },
  {
    sku: "A304SD",
    name: "Alexa Speaker",
    price: 109.5,
    inventoryQty: 10,
  },
  {
    sku: "234234",
    name: "Raspberry Pi B",
    price: 30.0,
    inventoryQty: 2,
  },
];

export const PROMOTIONS: Array<Promotion> = [
  {
    requiredItemSku: "43N23P",
    requiredQty: 1,
    promotedItemSku: "234234",
    discount: 100,
    application: PromotionApplication.ITEMS_QUALIFIED,
  },
  {
    requiredItemSku: "120P90",
    requiredQty: 3,
    promotedItemSku: "120P90",
    discount: 100,
    application: PromotionApplication.ITEMS_QUALIFIED,
  },
  {
    requiredItemSku: "A304SD",
    requiredQty: 3,
    promotedItemSku: "A304SD",
    discount: 10,
    application: PromotionApplication.ITEMS_ALL,
  },
];
