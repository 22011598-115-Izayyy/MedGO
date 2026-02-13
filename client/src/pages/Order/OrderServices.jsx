import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { db } from "../../firebase/config";

/**
 * Creates ONE order for ONE pharmacy
 * PharmacyId MUST be Pharmacies document ID
 * Order starts as PENDING (pharmacy must accept/reject)
 */
const createSingleOrder = async ({
  pharmacyId,
  customer,
  items,
  totalPrice
}) => {
  // 1️⃣ Create order in global Orders collection
  const orderRef = await addDoc(collection(db, "Orders"), {
    pharmacyId,

    // Flat fields (Pharmacy dashboard)
    customerName: customer.name,
    customerPhone: customer.phone,
    customerAddress: customer.address,

    // Nested object (Rider dashboard)
    customer,

    items,
    totalPrice,

    // ✅ START AS PENDING
    orderStatus: "pending",
    pharmacyStatus: "pending",

    assignedRiderId: null,
    assignedRiderName: null,

    paymentMethod: "Cash on Delivery",
    createdAt: serverTimestamp()
  });

  // 2️⃣ Save orderId inside order document
  await updateDoc(orderRef, {
    orderId: orderRef.id
  });

  // 3️⃣ Create SAME order under Pharmacy
  await setDoc(
    doc(db, "Pharmacies", pharmacyId, "orders", orderRef.id),
    {
      orderId: orderRef.id,
      pharmacyId,

      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customer,

      items,
      itemCount: items.length,
      totalPrice,

      // ✅ SAME STATUS HERE
      orderStatus: "pending",
      pharmacyStatus: "pending",

      assignedRiderId: null,
      assignedRiderName: null,

      paymentMethod: "Cash on Delivery",
      createdAt: serverTimestamp()
    }
  );

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
