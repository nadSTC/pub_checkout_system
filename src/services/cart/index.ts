/* 
    COMMENTARY

    1.  This is a simple implementation of a shopping cart. You can add/remove items and ask to checkout

    2.  The basic flow is to
        1. Check each item in the cart and see if there is a promotion on it
        2. Apply promotion discounts
        3. Calculate the total cart cost (round to 2dp)

    3.  This isn't a perfect solution. There are alot of scenarios which should be accounted for
        to improve the solution. For example 
        1. CHAINING PROMOS:
            I buy a MBP and the promo gives me a Rasberry Pi for free, so i add the rasberry pi to my cart
            If there is a promo on the rasberry pi, i shouldn't be able to access that because the Rasberry
            Pi in my cart is the outcome of another promo.
        2. LIMITING PROMOS:
            Ideally, there should be functionality to limit promos based on different indicators. For example,
            one promo per customer, or one promo per transaction. In the current data strucutre, there
            is no room for that.
*/

import { Promotion, CartItem, Item, PromotionApplication } from "../../types";
import { db } from "../db";
import { roundToXdp } from "../util.ts/math";

/**
 * Class representing a Shopping Cart
 */
export class Cart {
  /**
   * A map of cart items, where each entry consists of an SKU and a CartItem.
   * @private
   * @type {Map<Item["sku"], CartItem>}
   */
  private items: Map<Item["sku"], CartItem> = new Map<Item["sku"], CartItem>();

  constructor() {}

  /**
   * Calculate the total value of the cart after discounts.
   * @private
   * @returns {number} - Total value.
   */
  private _calculateTotal = (): number => {
    let total = 0;
    for (const [sku, cartItem] of this.items.entries()) {
      const totalBeforeDiscount = cartItem.price * cartItem.quantity;
      const totalAfterDiscount = totalBeforeDiscount - cartItem.discount;
      total += totalAfterDiscount;
    }
    return total;
  };

  /**
   * Apply a discount to a specific cart item.
   * @private
   * @param {CartItem} cartItem - The cart item to apply the discount to.
   * @param {Promotion} promotion - The promotion being applied.
   * @param {number} numApplications - The number of times the promotion is applied.
   */
  private _applyDiscount = (
    cartItem: CartItem,
    promotion: Promotion,
    numApplications: number
  ) => {
    const { discount: promoDiscount } = promotion;
    const { sku } = cartItem;
    const discountValueToApply =
      (promoDiscount / 100) * cartItem.price * numApplications;

    const updatedCartItem: CartItem = {
      ...cartItem,
      discount: cartItem.discount + discountValueToApply,
    };

    this.items.set(sku, updatedCartItem);
  };

  /**
   * Resolves the quantity ratio for the promotion application.
   * @private
   * @param {CartItem} cartItem - The cart item the promotion is applied to.
   * @param {Promotion} promotion - The promotion being applied.
   * @returns {number} - The quantity ratio for the promotion.
   */
  private _resolveCartRatio = (
    cartItem: CartItem,
    promotion: Promotion
  ): number => {
    switch (promotion.application) {
      case PromotionApplication.ITEMS_QUALIFIED:
        return Math.floor(cartItem.quantity / promotion.requiredQty);
      case PromotionApplication.ITEMS_ALL:
        return cartItem.quantity;
      default:
        return 0;
    }
  };

  /**
   * Check if a cart item is eligible for a promotion.
   * @private
   * @param {CartItem} cartItem - The cart item to check.
   * @param {Promotion} promotion - The promotion to check against.
   * @returns {boolean} - Whether the cart item is eligible for the promotion.
   */
  private _checkEligibility = (
    cartItem: CartItem,
    promotion: Promotion
  ): boolean =>
    cartItem.sku === promotion.requiredItemSku &&
    cartItem.quantity >= promotion.requiredQty;

  /**
   * Apply promotions to a cart item if eligible.
   * @private
   * @param {CartItem} cartItem - The cart item to apply promotions to.
   * @param {Promotion} promotion - The promotion to apply.
   */
  private _applyPromotions = (
    cartItem: CartItem,
    promotion: Promotion
  ): void => {
    const promotedInventoryItem = db.findItemBySku(promotion.promotedItemSku);

    if (!promotedInventoryItem) {
      throw new Error(
        `[UNKNOWN ERROR] Invalid SKU ${promotion.promotedItemSku} on promotion!`
      );
    }

    const promotedItemInCart = this.items.get(promotion.promotedItemSku);

    if (!promotedItemInCart) {
      console.warn("Promoted Item not found in cart!");
      return;
    }

    const { quantity: promoQty } = promotedItemInCart;
    const cartRatio = this._resolveCartRatio(cartItem, promotion);
    const actualIterations = Math.min(cartRatio, promoQty);
    this._applyDiscount(promotedItemInCart, promotion, actualIterations);
  };

  /**
   * Checkout the cart, applying any eligible promotions and returning the total.
   * @returns {number} - The total checkout cost after applying promotions.
   */
  checkout = (): number => {
    for (const [sku, cartItem] of this.items.entries()) {
      const promotion = db.findPromotionBySku(cartItem.sku);
      if (!promotion) continue;
      const isEligible = this._checkEligibility(cartItem, promotion);
      if (!isEligible) continue;

      try {
        this._applyPromotions(cartItem, promotion);
      } catch (err) {
        console.error(err);
      }
    }

    const total = this._calculateTotal();
    return roundToXdp(total, 2);
  };

  /**
   * Clears all items from the cart.
   */
  clearCart = (): void => {
    this.items = new Map<string, CartItem>();
  };

  /**
   * Removes an item from the cart by SKU.
   * If the item is not in the cart, or does not exist in the inventory, an error will be thrown.
   * If the item exists in the cart and inventory, the quantity will be decreased.
   * @param {Item["sku"]} sku - The SKU of the item to remove.
   */
  removeItem = (sku: Item["sku"]) => {
    const inventoryItem = db.findItemBySku(sku);

    if (!inventoryItem) {
      throw new Error(`[NOT FOUND] Item SKU (${sku}) not found!`);
    }

    const existingitem = this.items.get(sku);

    if (!existingitem) {
      throw new Error("[ERROR] Item doesn't exist in your cart");
    }

    const updatedInventoryItem: Item = {
      ...inventoryItem,
      inventoryQty: inventoryItem.inventoryQty + 1,
    };
    db.updateItem(updatedInventoryItem);

    if (existingitem.quantity === 1) {
      this.items.delete(sku);
      return;
    }

    const newItem: CartItem = {
      ...existingitem,
      quantity: existingitem.quantity - 1,
    };

    this.items.set(sku, newItem);
  };

  /**
   * Adds an item to the cart by SKU.
   * If the item does not exist in the inventory, or is out of stock, an error will be thrown.
   * If the item exists in the inventory, the quantity will be decreased in the inventory and increased in the cart.
   * @param {Item["sku"]} sku - The SKU of the item to add.
   */
  addItem = (sku: Item["sku"]) => {
    const inventoryItem = db.findItemBySku(sku);

    if (!inventoryItem) {
      throw new Error(`[NOT FOUND] Item SKU (${sku}) not found!`);
    }

    const { inventoryQty, ...rest } = inventoryItem;

    if (inventoryQty === 0) {
      throw new Error(`[INSUFFICIENT STOCK] Cannot purchase (${sku})!`);
    }

    const updatedInventoryItem: Item = {
      ...inventoryItem,
      inventoryQty: inventoryItem.inventoryQty - 1,
    };

    db.updateItem(updatedInventoryItem);

    const existingItem = this.items.get(sku);

    if (existingItem) {
      this.items.set(sku, {
        ...existingItem,
        quantity: existingItem.quantity + 1,
      });
    } else {
      const item: CartItem = {
        ...rest,
        quantity: 1,
        discount: 0,
      };
      this.items.set(sku, item);
    }
  };

  getCart = (): Map<Item["sku"], CartItem> => this.items;
}
