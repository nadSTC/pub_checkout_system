/* 
    COMMENTARY

    1.  This class is simply a mock class for a database. It aims to allow functionality
        similar to what you would find with ORM's such as Prisma.  

    2.  In an actual implementation, we should put an index on both the SKU and NAME columns
        as there will be frequent lookups using those columns.
    
    3.  The locking mechanism is a basic implementation of resource locks to prevent race conditions
        on updates. However, thisproject is mostly all synchronous so it it's just for 
        demonstration purposes. (similar to mutexes in C++)

*/
import { ITEMS, PROMOTIONS } from "./data";
import { Item, Promotion, DatabaseTable } from "../../types";

export class DB {
  private inventory: Array<Item> = [];
  private promotions: Array<Promotion> = [];

  private locks: Map<DatabaseTable, boolean> = new Map<
    DatabaseTable,
    boolean
  >();

  constructor() {
    this.init();
  }

  init = () => {
    for (const table of Object.values(DatabaseTable)) {
      this.locks.set(table, false);
    }

    for (const item of ITEMS) {
      this.addItem(item);
    }

    for (const promotion of PROMOTIONS) {
      this.addPromotion(promotion);
    }
  };

  clear = () => {
    this.inventory = [];
    this.promotions = [];
  };

  /**
   * Adds a lock to the specified table. This is used to prevent concurrent updates to shared resources.
   * @param {DatabaseTable} tableName - The name of the table to lock.
   * @returns {boolean} - Returns true if the lock was successfully added, false otherwise.
   */
  private _addLock = (tableName: DatabaseTable): boolean => {
    const LOCK_SET = true;
    if (!this.locks.has(tableName)) {
      this.locks.set(tableName, LOCK_SET);
      return LOCK_SET;
    }

    if (this.locks.get(tableName)) return !LOCK_SET;

    this.locks.set(tableName, LOCK_SET);
    return LOCK_SET;
  };

  /**
   * Removes a lock from the specified table. This is used to allow access to a previously locked resource.
   * @param {DatabaseTable} tableName - The name of the table to unlock.
   */
  private _removeLock = (tableName: DatabaseTable): void => {
    const LOCK_SET = true;

    if (!this.locks.has(tableName)) {
      this.locks.set(tableName, !LOCK_SET);
    }

    this.locks.set(tableName, !LOCK_SET);
  };

  /**
   * Inserts an item into the inventory.
   * @param {Item} item - The item to insert.
   */
  private _insertItem = (item: Item): void => {
    this.inventory.push(item);
  };

  /**
   * Updates an existing item in the inventory.
   * @param {Item} item - The item to update.
   */
  private _updateItem = (item: Item): void => {
    const itemIndex = this.inventory.findIndex((i) => i.sku === item.sku);
    this.inventory[itemIndex] = item;
  };

  /**
   * Inserts a promotion into the promotions list.
   * @param {Promotion} promotion - The promotion to insert.
   */
  private _insertPromotion = (promotion: Promotion): void => {
    this.promotions.push(promotion);
  };

  /**
   * Finds an item in the inventory by SKU.
   * @param {Item["sku"]} sku - The SKU of the item to find.
   * @returns {Item | undefined} - The item if found, undefined otherwise.
   */
  findItemBySku = (sku: Item["sku"]): Item | undefined =>
    this.inventory.find((item) => item.sku === sku);

  /**
   * Adds an item to the inventory. If the item already exists or the inventory is locked, an error is thrown.
   * @param {Item} item - The item to add.
   */
  addItem = (item: Item): void => {
    const safeToOperate = this._addLock(DatabaseTable.INVENTORY);

    if (!safeToOperate) {
      throw new Error(
        `[${DatabaseTable.INVENTORY}] Could not apply lock on resource!`
      );
    }

    const { sku } = item;

    const existingItem = this.findItemBySku(sku);

    if (existingItem) {
      this._removeLock(DatabaseTable.INVENTORY);
      throw new Error(
        `[${DatabaseTable.INVENTORY}] Item with SKU code already exists!`
      );
    }

    this._insertItem(item);
    this._removeLock(DatabaseTable.INVENTORY);
  };

  /**
   * Updates an existing item in the inventory. If the item does not exist or the inventory is locked, an error is thrown.
   * @param {Item} item - The item to update.
   */
  updateItem = (item: Item): void => {
    const safeToOperate = this._addLock(DatabaseTable.INVENTORY);

    if (!safeToOperate) {
      throw new Error(
        `[${DatabaseTable.INVENTORY}] Could not apply lock on resource!`
      );
    }

    const { sku } = item;

    const existingItem = this.findItemBySku(sku);

    if (!existingItem) {
      this._removeLock(DatabaseTable.INVENTORY);
      throw new Error(
        `[${DatabaseTable.INVENTORY}] Item with SKU doesn't exists!`
      );
    }

    this._updateItem(item);
    this._removeLock(DatabaseTable.INVENTORY);
  };

  /**
   * Finds a promotion by the SKU required to qualify for the promotion.
   * @param {Promotion["promotedItemSku"]} sku - The SKU of the promoted item to find the promotion for.
   * @returns {Promotion | undefined} - The promotion if found, undefined otherwise.
   */
  findPromotionBySku = (
    sku: Promotion["promotedItemSku"]
  ): Promotion | undefined =>
    this.promotions.find((p) => p.requiredItemSku === sku);

  /**
   * Adds a promotion to the promotions list. If the promotions list is locked, an error is thrown.
   * @param {Promotion} promotion - The promotion to add.
   */
  addPromotion = (promotion: Promotion) => {
    const TABLE = DatabaseTable.PROMOTION;

    const safeToOperate = this._addLock(TABLE);

    if (!safeToOperate) {
      throw new Error(`[${TABLE}] Could not apply lock on resource!`);
    }

    this._insertPromotion(promotion);
    this._removeLock(TABLE);
  };
}

export const db = new DB();
