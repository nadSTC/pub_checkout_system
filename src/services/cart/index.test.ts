/*
    COMMENTARY

    1.  I think the spec/example for the Alexa promotion is wrong. The spec mentions that more than 3
        Alexas give a 10% discount for all, but in the example, only 3 are purchased and a discount is applied.
        I have applied my logic to match the example so (count >= 3) not (count > 3)

*/

import { Cart } from "./";
import { db } from "../db";
import { ITEMS, PROMOTIONS } from "../db/data";
import { Item, CartItem, Promotion } from "../../types";
import { roundToXdp } from "../util.ts/math";

describe("Cart class", () => {
  let cart: Cart;
  let mockItem: Item;
  let mockCartItem: CartItem;
  let mockPromotion: Promotion;

  beforeEach(() => {
    cart = new Cart();
    db.clear();
    db.init();
    mockItem = ITEMS[0];
    mockCartItem = {
      ...mockItem,
      quantity: 2,
      discount: 0,
    };
    mockPromotion = PROMOTIONS[1];
  });

  it("should add an item to the cart", () => {
    cart.addItem(mockItem.sku);
    const items = cart.getCart();
    expect(items.has(mockItem.sku)).toBe(true);
    const cartItem = items.get(mockItem.sku);
    expect(cartItem?.quantity).toBe(1);
  });

  it("should remove an item from the cart", () => {
    cart.addItem(mockItem.sku);
    cart.removeitem(mockItem.sku);
    const items = cart.getCart();
    expect(items.has(mockItem.sku)).toBe(false);
  });

  it("should throw an error when removing an item that is not in the cart", () => {
    expect(() => cart.removeitem(mockItem.sku)).toThrow();
  });

  it("should apply promotions and calculate the total cost correctly", () => {
    cart.addItem(mockItem.sku);
    cart.addItem(mockItem.sku);
    const total = cart.checkout();
    expect(total).toBe(2 * mockItem.price);
  });

  it("should clear the cart", () => {
    cart.addItem(mockItem.sku);
    cart.clearCart();
    const items = cart.getCart();
    expect(items.size).toBe(0);
  });

  it("[Scenario]should apply promotions and calculate the total cost correctly", () => {
    cart.addItem(mockItem.sku);
    cart.addItem(mockItem.sku);
    const total = cart.checkout();
    expect(total).toBe(2 * mockItem.price);
  });
});

describe("Promotion Scenarios", () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
    db.clear();
    db.init();
  });

  describe("[1 free Rasberry Pi with each macbook purchase] ", () => {
    beforeEach(() => {
      cart = new Cart();
      db.clear();
      db.init();
    });

    it("it should give the one rasberry pi free because there is a macbook pro", () => {
      // one mackbook and one rasberry pi
      // the rasberry pi becomes free (100%) since there is one mackbook
      const MBP = ITEMS[1];
      const RASBERRY = ITEMS[3];
      cart.addItem(MBP.sku);
      cart.addItem(RASBERRY.sku);
      const total = cart.checkout();
      expect(total).toBe(5399.99);
    });

    it("it should only give one rasberry pi for free because there is only one macbook pro", () => {
      // one mackbook and two rasberry pi
      // the rasberry pi becomes free (100%) since there is one mackbook
      const MBP = ITEMS[1];
      const RASBERRY = ITEMS[3];
      cart.addItem(MBP.sku);
      cart.addItem(RASBERRY.sku);
      cart.addItem(RASBERRY.sku);
      const total = cart.checkout();
      expect(total).toBe(5429.99);
    });

    it("should give the one rasberry pi for free if there is at least one macbook pro ", () => {
      // 2 mackbook and 1 rasberry pi
      // the rasberry pi becomes free (100%) since there is one mackbook.
      // you are eligible for another free raberry pi.
      // a user should add it to the cart to attain the promo
      const MBP = ITEMS[1];
      const RASBERRY = ITEMS[3];
      cart.addItem(MBP.sku);
      cart.addItem(MBP.sku);
      cart.addItem(RASBERRY.sku);
      const total = cart.checkout();
      expect(total).toBe(2 * MBP.price);
    });

    it("should give both rasberry pi's for free when there is 2 macbooks", () => {
      // 2 mackbook and 2 rasberry pi
      // both rasberry pi's becomes free (100%) since there is 2 mackbook.
      const MBP = ITEMS[1];
      const RASBERRY = ITEMS[3];
      cart.addItem(MBP.sku);
      cart.addItem(MBP.sku);
      cart.addItem(RASBERRY.sku);
      cart.addItem(RASBERRY.sku);
      const total = cart.checkout();
      expect(total).toBe(2 * MBP.price);
    });
  });

  describe("[3 Google Homes for the price of 2]", () => {
    beforeEach(() => {
      cart = new Cart();
      db.clear();
      db.init();
    });

    it("should discount 100% of the 3rd google home if there are 3 in the cart", () => {
      const GOOGLE_HOME = ITEMS[0];
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      const total = cart.checkout();
      expect(total).toBe(99.98);
    });

    it("should discount 100% of 1 google home if there are 4 in the cart", () => {
      const GOOGLE_HOME = ITEMS[0];
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      const total = cart.checkout();
      expect(total).toBe(3 * GOOGLE_HOME.price);
    });

    it("should discount 100% of 1 google home if there are 5 in the cart", () => {
      const GOOGLE_HOME = ITEMS[0];
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      const total = cart.checkout();
      expect(total).toBe(4 * GOOGLE_HOME.price);
    });
    it("should discount 100% of 2 google home if there are 6 in the cart", () => {
      const GOOGLE_HOME = ITEMS[0];
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      cart.addItem(GOOGLE_HOME.sku);
      const total = cart.checkout();
      expect(total).toBe(4 * GOOGLE_HOME.price);
    });
  });

  describe("[More than 3 Alexas gives 10% discount on all Alexas]", () => {
    beforeEach(() => {
      cart = new Cart();
      db.clear();
      db.init();
    });

    it("should apply no discount if there are 2 alexas in the cart", () => {
      const ALEXA = ITEMS[2];
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      const total = cart.checkout();
      expect(total).toBe(2 * ALEXA.price);
    });

    it("should apply at 10% discount to all alexas if there are 3 alexas in the cart", () => {
      const ALEXA = ITEMS[2];
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      const total = cart.checkout();
      const expectedTotal = roundToXdp(3 * ALEXA.price * 0.9, 2);
      expect(total).toBe(expectedTotal);
    });

    it("should apply at 10% discount to all alexas if there are 6 alexas in the cart", () => {
      const ALEXA = ITEMS[2];
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      cart.addItem(ALEXA.sku);
      const total = cart.checkout();
      const expectedTotal = roundToXdp(6 * ALEXA.price * 0.9, 2);
      expect(total).toBe(expectedTotal);
    });
  });
});
