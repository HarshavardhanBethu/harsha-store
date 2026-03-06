import { createOrder } from "../services/api";

const handleCheckout = async () => {
  const orderData = {
    designName: "Custom Shirt",
    shirtPrice: 999,
    fabric: "Premium Cotton",
    features: ["Pocket Logo", "Side Stripe"]
  };

  const order = await createOrder(orderData);

  alert("Order placed! Order ID: " + order.id);
};