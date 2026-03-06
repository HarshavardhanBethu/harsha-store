const API_URL = "http://localhost:4000";

export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  return res.json();
};

export const getProducts = async () => {
  const res = await fetch(`${API_URL}/api/products`);
  return res.json();
};

export const getStats = async () => {
  const res = await fetch(`${API_URL}/api/stats`);
  return res.json();
};