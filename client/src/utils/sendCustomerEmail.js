import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_delka45";
const CONFIRMATION_TEMPLATE_ID = "template_bzhx2xc";
const STATUS_TEMPLATE_ID = "template_rah628b";
const PUBLIC_KEY = "cfvm8au4yx5zF6e3s";

/**
 * Sends order confirmation email to customer when order is placed
 */
export const sendOrderConfirmationEmail = async ({
  customerName,
  customerEmail,
  orderId,
  items,
  totalPrice,
  address,
}) => {
  try {
    const itemsText = items
      .map((i) => `${i.name} x${i.quantity} — Rs. ${i.price * i.quantity}`)
      .join("\n");

    await emailjs.send(
      SERVICE_ID,
      CONFIRMATION_TEMPLATE_ID,
      {
        customer_name: customerName,
        customer_email: customerEmail,
        order_id: orderId,
        items: itemsText,
        total_price: totalPrice,
        address: address,
      },
      PUBLIC_KEY
    );

    console.log("Order confirmation email sent ✅");
  } catch (err) {
    console.error("sendOrderConfirmationEmail error:", err);
  }
};

/**
 * Sends order status update email — reuses STATUS_TEMPLATE_ID for all statuses
 * Covers: accepted, rejected, picked_up, on_the_way, delivered
 */
export const sendOrderStatusEmail = async ({
  customerName,
  customerEmail,
  orderId,
  status,
  totalPrice = "",
  address = "",
}) => {
  const statusLabels = {
    accepted:   "Accepted ✅",
    rejected:   "Rejected ❌",
    picked_up:  "Picked Up 🏍️",
    on_the_way: "On The Way 🚀",
    delivered:  "Delivered ✅",
  };

  const statusMessages = {
    accepted:   "Great news! Your order has been accepted and a rider will be assigned shortly.",
    rejected:   "We're sorry, your order could not be processed. Please try ordering again.",
    picked_up:  "Your order has been picked up by the rider and is on its way!",
    on_the_way: "Your order is on the way to your address! 🚀",
    delivered:  "Your order has been delivered successfully. Thank you for using MedGO!",
  };

  try {
    await emailjs.send(
      SERVICE_ID,
      STATUS_TEMPLATE_ID,
      {
        customer_name:   customerName,
        customer_email:  customerEmail,
        order_id:        orderId,
        status:          statusLabels[status]  || status,
        status_message:  statusMessages[status] || "Your order status has been updated.",
        total_price:     totalPrice,
        address:         address,
      },
      PUBLIC_KEY
    );

    console.log(`Status email sent: ${status} ✅`);
  } catch (err) {
    console.error("sendOrderStatusEmail error:", err);
  }
};