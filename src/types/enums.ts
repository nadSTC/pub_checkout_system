/* 
    COMMENTARY

    1.  When defining enums I like to also export an equivalent 'type' denoted by an _LT
        in the suffix. This allows for maximum compatability and usabililty. 
    
    2.  [DatabaseTable] - An enum to define the tables in our database

    3.  [Promotion Application] -  An enum to specify if the promotion should be applied once to
        all items of the promotedSku each time to the group of items that qualified for the promotion
        based on the requiredQty field (in the Promotion type)

*/

export enum DatabaseTable {
  INVENTORY = "INVENTORY",
  PROMOTION = "PROMOTION",
}
export type DatabaseTable_LT = `${DatabaseTable}`;

export enum PromotionApplication {
  ITEMS_ALL = "ITEMS_ALL",
  ITEMS_QUALIFIED = "ITEMS_QUALIFIED",
}
export type PromotionApplication_LT = `${PromotionApplication}`;
