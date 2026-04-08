import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { createNotification } from "../../utils/createNotification";
import { sendOrderConfirmationEmail } from "../../utils/sendCustomerEmail";

/**
 * Creates ONE order for ONE pharmacy
 * PharmacyId MUST be Pharmacies document ID
 * Order starts as PENDING
 */
const createSingleOrder = async ({
  pharmacyId,
  customer,
  items,
  totalPrice
}) => {

  // ✅ Create order ONLY under Pharmacy
  const orderRef = await addDoc(
    collection(db, "Pharmacies", pharmacyId, "orders"),
    {
      pharmacyId,

      // Flat fields (Pharmacy dashboard)
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,

      // Nested object (Rider dashboard)
      customer,

      items,
      itemCount: items.length,
      totalPrice,

      // ✅ SINGLE STATUS SYSTEM
      orderStatus: "pending",

      assignedRiderId: null,
      assignedRiderName: null,

      paymentMethod: "Cash on Delivery",
      createdAt: serverTimestamp()
    }
  );

  // ✅ Save orderId inside same document
  await updateDoc(orderRef, {
    orderId: orderRef.id
  });

  // 🔔 Notify admin about new order
  await createNotification({
    pharmacyId,
    type: "new_order",
    title: "New Order Received",
    message: `New order from ${customer.name} — Rs. ${totalPrice}`,
    orderId: orderRef.id,
    recipientRole: "admin",
    recipientId: null,
  });

  // 📧 Send confirmation email to customer
  await sendOrderConfirmationEmail({
    customerName: customer.name,
    customerEmail: customer.email,
    orderId: orderRef.id,
    items,
    totalPrice,
    address: customer.address,
  });

  return orderRef.id;
};

/**
 * MAIN FUNCTION
 * Splits cart by pharmacy DOC ID
 * ⚠️ EXPORT STYLE SAME AS BEFORE
 */
export const createOrdersFromCart = async ({ cart, customer }) => {
  const pharmacyGroups = {};

  cart.forEach(item => {
    const pharmacyId = item.pharmacyId;

    if (!pharmacyId) {
      throw new Error("Missing pharmacyId (docId) in cart item");
    }

    if (!pharmacyGroups[pharmacyId]) {
      pharmacyGroups[pharmacyId] = [];
    }

    pharmacyGroups[pharmacyId].push({
      productId: String(item.id),
      name: String(item.name || item.productName),
      price: Number(item.price),
      quantity: Number(item.quantity)
    });
  });

  const orderPromises = Object.entries(pharmacyGroups).map(
    ([pharmacyId, items]) => {
      const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      return createSingleOrder({
        pharmacyId,
        customer,
        items,
        totalPrice
      });
    }
  );

  return Promise.all(orderPromises);
};