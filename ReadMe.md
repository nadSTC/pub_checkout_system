# Checkout System [BE Only]

A simple checkout system built in TypeScript.

## Testing

You can run the test suite using:

```
yarn test
```

If you'd like to add your own test cases in, feel free to add them in the `src/services/cart/index.test.ts` file.

## Logging

All logging done in this demonstration has used the `console` object. Ideally, in a real world application, you would route your logging to a destination such as AWS CloudWatch or Azure Logs.

More specifically, most logs only dump information but that is only useful in isolated scenarios. In a real world application, you would most likely have a profile table and possibly a cart table (to handle a long-lived cart). In all the logs, you would prepend the log item with either the profile or cart ID to help with debugging any issues.

## Installation

### Docker

You must have Docker installed on your system. Then in the root of the project, run the following.

```
docker build -t checkout-system .
docker run -p 3000:3000 checkout-system
```

### Other

If you're system is already set up with the correct version of Node and yarn, you can try running the following in the root of the project.

```
yarn install
yarn start
```

## Usage

### Data

All data is stored in the `src/services/db/data.ts` file. You may add your own data to this file to use when testing the cart functionality. However, please keep in mind that if you remove or re-order the existing data that is there, you may break the test cases as they are dependant on the data file. My suggestion is to append any items you'd like to add to the end of the arrays and keep the original data as is.

### Cart

There is no front-end or CLI tool for this project. If you want to experiment with the logic of the shopping cart system, you can add items to your cart in `src/index.ts`. Below is all the information you'll need.

- Add item [`.addItem()`]

  You can add an item by call the `.addItem()` method on the `cart` object. This method takes an Item SKU.

- Remove item [`.removeItem()`]

  You can remove an item from your cart by calling the `.removeItem()` method on the `cart` object. This method takes an Item SKU.

- Clear cart [`.clearCart()`]

  To clear your cart, use the `.clearCart()` method.

- Describe cart [`.getCart()`]

  To describe/view the current state of your cart, you can use the `.getCart()` method.

- Checkout [`.checkout()`]

  To checkout, you can call the `.checkout()` method. This will return the $ amount of your cart bill.

## Future State

This is only a basic implementation of a checkout system. In reality much more functionality is required to handle complex scenarios. Some thoughts on extra features to add are below.

1. CHAINING PROMOS:

   I buy a MBP and the promo gives me a Raspberry Pi for free, so i add the raspberry pi to my cart. If there is a promo on the raspberry pi, i shouldn't be able to access that because the Raspberry Pi in my cart is the outcome of another promo.

2. LIMITING PROMOS:

   Ideally, there should be functionality to limit promos based on different indicators. For example, one promo per customer, or one promo per transaction. In the current data structure, there is no room for that.

3. PROMO SCHEDULES:

   In a real world implementation, you'll often see promotions which have a scheduled date or are a limited time offer. This functionality can easily be built in using keys on the promotion called `scheduledFrom` and `scheduledTo`. Before applying promotions on products, you need to ensure that the promotion currently scheduled.
