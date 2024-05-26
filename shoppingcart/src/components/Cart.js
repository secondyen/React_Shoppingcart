import React, { Component } from "react";
import "./cart.css";
import {
  getInventory,
  getCart,
  addToCart,
  updateCart,
  deleteFromCart,
  checkout,
} from "../APIs/api";

export default class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inventory: [],
      cart: [],
      inputAmounts: {},
    };
  }

  async componentDidMount() {
    try {
      const inventoryData = await getInventory();
      const cartData = await getCart();
      this.setState({ inventory: inventoryData, cart: cartData });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  handleIncrease = (itemId) => {
    this.setState((prevState) => ({
      inputAmounts: {
        ...prevState.inputAmounts,
        [itemId]: (prevState.inputAmounts[itemId] || 0) + 1,
      },
    }));
  };

  handleDecrease = (itemId) => {
    this.setState((prevState) => ({
      inputAmounts: {
        ...prevState.inputAmounts,
        [itemId]: Math.max((prevState.inputAmounts[itemId] || 0) - 1, 0),
      },
    }));
  };

  addToCart = async (item) => {
    const amount = this.state.inputAmounts[item.id] || 0;
    if (amount === 0) return;

    const existingItem = this.state.cart.find(
      (cartItem) => cartItem.id === item.id
    );
    let updatedCart;

    if (existingItem) {
      updatedCart = this.state.cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, amount: cartItem.amount + amount }
          : cartItem
      );
      await updateCart(existingItem.id, {
        amount: updatedCart.find((cartItem) => cartItem.id === existingItem.id)
          .amount,
      });
    } else {
      const newItem = { ...item, amount };
      updatedCart = [...this.state.cart, newItem];
      await addToCart(newItem);
    }

    this.setState({ cart: updatedCart });
  };

  removeFromCart = async (itemToRemove) => {
    await deleteFromCart(itemToRemove.id);
    const updatedCart = this.state.cart.filter(
      (item) => item.id !== itemToRemove.id
    );
    this.setState({ cart: updatedCart });
  };

  handleCheckout = async () => {
    await checkout();
    this.setState({ cart: [] });
  };

  render() {
    return (
      <div className="cart-page">
        <div className="inventory-container">
          <h2>Inventory</h2>
          {this.state.inventory.map((item) => (
            <div key={item.id} className="inventory-item">
              <span>{item.name}</span>
              <div className="inventory-controls">
                <button
                  className="decrease-btn"
                  onClick={() => this.handleDecrease(item.id)}
                >
                  -
                </button>
                <span className="numItemStatement">
                  {this.state.inputAmounts[item.id] || 0}
                </span>
                <button
                  className="increase-btn"
                  onClick={() => this.handleIncrease(item.id)}
                >
                  +
                </button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => this.addToCart(item)}
              >
                add to cart
              </button>
            </div>
          ))}
        </div>

        <div className="cart-container">
          <h2>Shopping Cart</h2>
          {this.state.cart.map((item) => (
            <div key={item.id} className="cart-item">
              <span>
                {item.name} x {item.amount}
              </span>
              <button
                className="delete-btn"
                onClick={() => this.removeFromCart(item)}
              >
                delete
              </button>
            </div>
          ))}
          <button className="checkout-btn" onClick={this.handleCheckout}>
            checkout
          </button>
        </div>
      </div>
    );
  }
}
