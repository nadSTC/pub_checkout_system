import { DB } from "./"; // Update with your actual import path
import { Item, Promotion, PromotionApplication } from "../../types"; // Update with your actual import paths

// Mock data to use in tests
const mockItem: Item = {
  sku: "test_sku",
  name: "test item",
  price: 100,
  inventoryQty: 10,
};

const mockPromotion: Promotion = {
  requiredItemSku: "test_sku",
  requiredQty: 2,
  promotedItemSku: "test_promo_sku",
  discount: 10,
  application: PromotionApplication.ITEMS_QUALIFIED,
};

describe("DB class", () => {
  let db: DB;

  beforeEach(() => {
    db = new DB();
  });

  it("should add an item", () => {
    db.addItem(mockItem);
    expect(db.findItemBySku(mockItem.sku)).toEqual(mockItem);
  });

  it("should update an item", () => {
    db.addItem(mockItem);
    const updatedItem = { ...mockItem, inventoryQty: 20 };
    db.updateItem(updatedItem);
    expect(db.findItemBySku(mockItem.sku)).toEqual(updatedItem);
  });

  it("should throw an error when updating a non-existing item", () => {
    expect(() => db.updateItem(mockItem)).toThrow();
  });

  it("should add a promotion", () => {
    db.addPromotion(mockPromotion);
    expect(db.findPromotionBySku(mockPromotion.requiredItemSku)).toEqual(
      mockPromotion
    );
  });
});
