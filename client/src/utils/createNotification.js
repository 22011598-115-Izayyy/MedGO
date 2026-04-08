import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config"; // ← correct path from src/utils/

/**
 * Creates a notification document under Pharmacies/{pharmacyId}/notifications
 *
 * recipientRole: "admin" | "rider"
 * recipientId: null for admin, riderId string for rider
 */
export const createNotification = async ({
  pharmacyId,
  type,
  title,
  message,
  orderId,
  recipientRole,
  recipientId = null,
}) => {
  try {
    await addDoc(
      collection(db, "Pharmacies", pharmacyId, "notifications"),
      {
        type,
        title,
        message,
        orderId: orderId || null,
        pharmacyId,
        recipientRole,
        recipientId,
        isRead: false,
        createdAt: serverTimestamp(),
      }
    );
  } catch (err) {
    console.error("createNotification error:", err);
  }
};