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
 * Also creates a pharmacy-side reference
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
    customer,
    items,
    totalPrice,
    orderStatus: "pending",
    assignedRiderId: null,
    paymentMethod: "Cash on Delivery",
    createdAt: serverTimestamp()
  });

  // 2️⃣ Save orderId inside order document
  await updateDoc(orderRef, {
    orderId: orderRef.id
  });

  // 3️⃣ Create lightweight reference under Pharmacy
  const pharmacyOrderRef = doc(
    db,
    "Pharmacies",
    pharmacyId,
    "orders",
    orderRef.id
  );
await setDoc(pharmacyOrderRef, {
  orderId: orderRef.id,
  orderStatus: "pending",
  totalPrice,
  itemCount: items.length,
  customerName: customer.name,
  createdAt: serverTimestamp()
});

  

  return orderRef.id;
};

/**
 * MAIN FUNCTION
 * Splits cart into multiple orders (one per pharmacy)
 */
export const createOrdersFromCart = async ({ cart, customer }) => {
  // Group cart items by pharmacyId
  const pharmacyGroups = {};

  cart.forEach(item => {
    const pharmacyId = item.pharmacyId;

    if (!pharmacyGroups[pharmacyId]) {
      pharmacyGroups[pharmacyId] = [];
    }

    pharmacyGroups[pharmacyId].push({
      productId: String(item.id),
      name: String(item.productName),
      price: Number(item.price),
      quantity: Number(item.quantity)
    });
  });

  // Create orders per pharmacy
  const orderPromises = Object.entries(pharmacyGroups).map(
    async ([pharmacyId, items]) => {
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
