import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Chatbot.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config.js";
import { askGemini } from "../services/geminiService";

const Chatbot = ({ setCurrentPage, setSelectedProduct, onMedicineSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your MedGO pharmacy assistant.\n\nI can help you:\n🔍 Find & compare medicines\n🏥 Locate nearby pharmacies\n🤒 Suggest medicines for symptoms\n🛒 Place orders\n💊 Give dosage & side effect info\n\nHow can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  // refs so async functions always read latest data without stale closures
  const medicinesRef = useRef([]);
  const pharmaciesRef = useRef([]);
  const dataLoadedRef = useRef(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadAll = async () => {
      setDataLoading(true);
      try {
        const pharmacySnapshot = await getDocs(collection(db, "Pharmacies"));
        const pharmacyList = pharmacySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPharmacies(pharmacyList);
        pharmaciesRef.current = pharmacyList;

        let allMedicines = [];
        for (const pharmacy of pharmacySnapshot.docs) {
          const productSnapshot = await getDocs(
            collection(db, "Pharmacies", pharmacy.id, "products")
          );
          productSnapshot.docs.forEach(doc => {
            allMedicines.push({
              id: doc.id,
              pharmacyId: pharmacy.id,
              pharmacyName: pharmacy.data().name,
              pharmacyAddress: pharmacy.data().address || "Address not available",
              pharmacyPhone: pharmacy.data().phone || "N/A",
              pharmacyRating: pharmacy.data().rating || "N/A",
              ...doc.data()
            });
          });
        }
        setMedicines(allMedicines);
        medicinesRef.current = allMedicines;
        dataLoadedRef.current = true;
      } catch (err) {
        console.error("MedGO chatbot data load error:", err);
      } finally {
        setDataLoading(false);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =============================================
  // SYMPTOM → MEDICINE MAP
  // =============================================
  const symptomMedicineMap = {
    fever: {
      symptoms: ["fever", "temperature", "bukhar", "hot", "sweating", "chills", "pyrexia"],
      medicineKeywords: ["paracetamol", "panadol", "febrol", "calpol", "brufen", "ibuprofen", "acetaminophen", "febric", "pyrexon"],
      advice: "🌡️ For fever, the most commonly recommended medicines are:\n\n• Paracetamol (Panadol) — safest first choice\n• Ibuprofen (Brufen) — also reduces inflammation\n\n⚠️ Dosage: Adults 500mg-1g every 4-6 hours. Max 4g/day.\n🩺 See a doctor if fever exceeds 103°F or lasts more than 3 days."
    },
    headache: {
      symptoms: ["headache", "head pain", "migraine", "sir dard", "head ache", "head hurts"],
      medicineKeywords: ["paracetamol", "panadol", "brufen", "ibuprofen", "aspirin", "diclofenac", "naproxen", "migraine"],
      advice: "💊 For headache/migraine:\n\n• Paracetamol (Panadol) — mild to moderate headache\n• Ibuprofen (Brufen) — tension/migraine headache\n• Aspirin — adults only\n\n⚠️ Dosage: 500mg-1g every 4-6 hours.\n💧 Stay hydrated and rest in a dark, quiet room.\n🩺 See a doctor if headache is severe or sudden."
    },
    cold: {
      symptoms: ["cold", "cough", "flu", "runny nose", "sore throat", "congestion", "sneezing", "zukam", "nazla", "khansi"],
      medicineKeywords: ["panadol cold", "actifed", "rhinokold", "benadryl", "coflin", "flutex", "decongestant", "antihistamine", "dextromethorphan", "guaifenesin"],
      advice: "🤧 For cold & flu:\n\n• Panadol Cold & Flu — relieves all cold symptoms\n• Actifed — decongestant + antihistamine\n• Benadryl syrup — for cough & congestion\n\n⚠️ Rest, stay hydrated, warm liquids help.\n🩺 If symptoms persist more than 7 days, see a doctor."
    },
    stomach: {
      symptoms: ["stomach", "stomach pain", "gastric", "acidity", "ulcer", "nausea", "vomiting", "diarrhea", "loose motion", "constipation", "bloating", "indigestion", "pait dard", "stomache", "tummy", "abdomen"],
      medicineKeywords: ["omeprazole", "antacid", "gaviscon", "pepto", "flagyl", "metronidazole", "buscopan", "loperamide", "lansoprazole", "pantoprazole", "nexium", "gastro"],
      advice: "💊 For stomach issues:\n\n• Omeprazole — acid reflux, ulcers\n• Antacid / Gaviscon — heartburn, acidity\n• Buscopan — stomach cramps, spasms\n• Metronidazole (Flagyl) — infections, diarrhea (needs prescription)\n\n💧 Drink plenty of fluids.\n🩺 See a doctor if pain is severe or lasts more than 2 days."
    },
    pain: {
      symptoms: ["pain", "dard", "body ache", "muscle pain", "joint pain", "back pain", "toothache", "ear pain", "knee pain"],
      medicineKeywords: ["brufen", "ibuprofen", "panadol", "voltaren", "diclofenac", "ponstan", "mefenamic", "naproxen", "pain", "analgesic"],
      advice: "💊 For pain relief:\n\n• Ibuprofen (Brufen) — inflammation + pain\n• Paracetamol (Panadol) — general pain\n• Diclofenac (Voltaren) — joint & muscle pain\n• Mefenamic Acid (Ponstan) — moderate pain\n\n⚠️ Take with food to avoid stomach irritation.\n🩺 See a doctor if pain is severe or chronic."
    },
    allergy: {
      symptoms: ["allergy", "allergic", "itching", "rash", "hives", "skin reaction", "sneezing", "watery eyes", "khujli"],
      medicineKeywords: ["antihistamine", "cetirizine", "loratadine", "benadryl", "clarityn", "zyrtec", "diphenhydramine", "fexofenadine", "allegra"],
      advice: "💊 For allergies:\n\n• Cetirizine (Zyrtec) — 24-hour allergy relief\n• Loratadine (Clarityn) — non-drowsy option\n• Benadryl — fast acting, may cause drowsiness\n\n⚠️ Avoid known allergens.\n🩺 For severe allergic reactions (difficulty breathing, swelling), seek emergency care immediately."
    },
    diabetes: {
      symptoms: ["diabetes", "sugar", "blood sugar", "diabetic", "insulin", "glucose"],
      medicineKeywords: ["metformin", "glucophage", "insulin", "glimepiride", "januvia", "sitagliptin", "gliclazide", "diabetic"],
      advice: "💊 Diabetes management medicines:\n\n• Metformin (Glucophage) — most common Type 2 diabetes medicine\n• Glimepiride — stimulates insulin production\n• Insulin — Type 1 and advanced Type 2\n\n⚠️ These require a prescription from a doctor.\n🩺 Regular blood sugar monitoring and doctor consultation is essential."
    },
    hypertension: {
      symptoms: ["blood pressure", "hypertension", "bp high", "high bp", "bp", "heart", "bp low", "low bp"],
      medicineKeywords: ["amlodipine", "losartan", "atenolol", "lisinopril", "norvasc", "valsartan", "ramipril", "telmisartan"],
      advice: "💊 For blood pressure:\n\n• Amlodipine (Norvasc) — calcium channel blocker\n• Losartan — ARB, kidney protective\n• Atenolol — beta blocker\n\n⚠️ These require a valid prescription.\n🩺 Monitor BP regularly. Do not stop medication without doctor's advice."
    },
    anxiety: {
      symptoms: ["anxiety", "stress", "depression", "sleep", "insomnia", "tension", "nervous", "mental health", "panic"],
      medicineKeywords: ["alprazolam", "diazepam", "melatonin", "sertraline", "escitalopram", "clonazepam", "sedative", "sleep"],
      advice: "💊 For anxiety & sleep:\n\n• Melatonin — safe, non-prescription sleep aid\n• Alprazolam / Diazepam — require prescription, short-term only\n\n⚠️ Prescription medicines require doctor authorization.\n🩺 Please consult a doctor or mental health professional for proper diagnosis and treatment.\n💚 You're not alone — help is available."
    }
  };

  // =============================================
  // BUILD FIRESTORE CONTEXT FOR GEMINI
  // =============================================
  const buildFirestoreContext = useCallback(() => {
    const meds = medicinesRef.current;
    const pharms = pharmaciesRef.current;
    if (meds.length === 0 && pharms.length === 0) return "";
    const pharmacyList = pharms.map(p =>
      `Pharmacy: ${p.name} | Address: ${p.address || "N/A"} | Phone: ${p.phone || "N/A"} | Rating: ${p.rating || "N/A"} | City: ${p.city || "N/A"}`
    ).join("\n");
    const medicineList = meds.slice(0, 150).map(m =>
      `Medicine: ${m.productName || m.name} | Price: Rs ${m.price} | Stock: ${m.stock > 0 ? "In Stock" : "Out of Stock"} | Pharmacy: ${m.pharmacyName} | Formula: ${m.formula || "N/A"} | Category: ${m.category || "N/A"} | Description: ${m.description || "N/A"}`
    ).join("\n");
    return `=== MedGO PHARMACY DATA ===\n\nPHARMACIES IN SYSTEM:\n${pharmacyList}\n\nMEDICINES IN INVENTORY:\n${medicineList}\n\n=== END OF DATA ===`;
  }, []);

  // =============================================
  // DISTANCE CALCULATOR
  // =============================================
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // =============================================
  // LEVENSHTEIN FOR FUZZY SEARCH
  // =============================================
  const levenshteinDistance = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );
    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    return track[str2.length][str1.length];
  };

  const containsKeyword = (text, keywords) =>
    keywords.some(k => text.toLowerCase().includes(k));

  const containsWholeWord = (text, words) =>
    words.some(w => new RegExp(`(^|\\s|[^a-zA-Z])${w}(\\s|$|[^a-zA-Z])`, "i").test(text));

  // =============================================
  // SEARCH MEDICINES — always reads from ref
  // =============================================
  const searchMedicines = useCallback((query) => {
    const meds = medicinesRef.current;
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery || lowerQuery.length < 2 || meds.length === 0) return [];

    const exact = meds.filter(m => {
      const name = (m.productName || m.name || "").toLowerCase();
      const formula = (m.formula || "").toLowerCase();
      const category = (m.category || "").toLowerCase();
      const description = (m.description || "").toLowerCase();
      return (
        name.includes(lowerQuery) ||
        formula.includes(lowerQuery) ||
        category.includes(lowerQuery) ||
        description.includes(lowerQuery)
      );
    });

    if (exact.length > 0) return exact.slice(0, 6);

    return meds
      .map(m => {
        const name = (m.productName || m.name || "").toLowerCase();
        return { m, dist: levenshteinDistance(lowerQuery, name) };
      })
      .filter(item => item.dist <= 3)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map(item => item.m);
  }, []);

  const searchMedicinesByKeywords = useCallback((keywordList) => {
    const meds = medicinesRef.current;
    const found = [];
    keywordList.forEach(keyword => {
      const matches = meds.filter(m => {
        const name = (m.productName || m.name || "").toLowerCase();
        const formula = (m.formula || "").toLowerCase();
        const category = (m.category || "").toLowerCase();
        const description = (m.description || "").toLowerCase();
        return (
          name.includes(keyword.toLowerCase()) ||
          formula.includes(keyword.toLowerCase()) ||
          category.includes(keyword.toLowerCase()) ||
          description.includes(keyword.toLowerCase())
        );
      });
      found.push(...matches);
    });
    return found.filter((m, i, arr) =>
      arr.findIndex(x =>
        (x.productName || x.name) === (m.productName || m.name) &&
        x.pharmacyName === m.pharmacyName
      ) === i
    ).slice(0, 8);
  }, []);

  const formatMedicineResults = (results) => {
    if (results.length === 0) return "❌ No medicines found. Try a different name or spelling.";
    return results.map((m, i) =>
      `${i + 1}. ${m.productName || m.name}\n` +
      `   💰 Price: Rs ${m.price || "N/A"}\n` +
      `   🏪 Pharmacy: ${m.pharmacyName}\n` +
      `   📦 Stock: ${m.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}\n` +
      `   💊 Formula: ${m.formula || "N/A"}\n` +
      `   📍 ${m.pharmacyAddress}\n` +
      `   📞 ${m.pharmacyPhone}`
    ).join("\n\n");
  };

  const compareTwoMedicines = (name1, name2) => {
    const results1 = searchMedicines(name1);
    const results2 = searchMedicines(name2);

    if (results1.length === 0 && results2.length === 0) {
      return `❌ No medicines found for "${name1}" or "${name2}". Check the spelling or browse the products page.`;
    }

    let response = `📊 Medicine Comparison:\n\n`;

    if (results1.length > 0) {
      response += `🔵 ${name1.toUpperCase()}:\n`;
      results1.slice(0, 3).forEach((m, i) => {
        response += `  ${i + 1}. ${m.productName || m.name}\n`;
        response += `     💰 Rs ${m.price || "N/A"} | 🏪 ${m.pharmacyName}\n`;
        response += `     📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n`;
        response += `     💊 Formula: ${m.formula || "N/A"}\n\n`;
      });
    } else {
      response += `🔵 "${name1}" — ❌ Not found in inventory\n\n`;
    }

    if (results2.length > 0) {
      response += `🟢 ${name2.toUpperCase()}:\n`;
      results2.slice(0, 3).forEach((m, i) => {
        response += `  ${i + 1}. ${m.productName || m.name}\n`;
        response += `     💰 Rs ${m.price || "N/A"} | 🏪 ${m.pharmacyName}\n`;
        response += `     📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n`;
        response += `     💊 Formula: ${m.formula || "N/A"}\n\n`;
      });
    } else {
      response += `🟢 "${name2}" — ❌ Not found in inventory\n\n`;
    }

    if (results1.length > 0 && results2.length > 0) {
      const price1 = Math.min(...results1.map(m => Number(m.price) || Infinity));
      const price2 = Math.min(...results2.map(m => Number(m.price) || Infinity));
      if (price1 !== Infinity && price2 !== Infinity) {
        response += `💡 Better Price: ${price1 <= price2 ? name1.toUpperCase() : name2.toUpperCase()} (Rs ${Math.min(price1, price2)})`;
      }
    }

    return response;
  };

  const compareMedicinePrices = (query) => {
    const results = searchMedicines(query);
    if (results.length === 0) return `❌ No medicines found matching "${query}".\n\nThe medicine might not be in our inventory yet. Try browsing the products page.`;
    const sorted = [...results].sort((a, b) => (a.price || 0) - (b.price || 0));
    const cheapest = sorted[0];
    let response = `📊 Price Comparison for "${query}":\n\n`;
    sorted.forEach((m, i) => {
      response += `${i + 1}. ${m.productName || m.name}\n`;
      response += `   💰 Rs ${m.price || "N/A"} — 🏪 ${m.pharmacyName}\n`;
      response += `   📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n`;
      response += `   📍 ${m.pharmacyAddress}\n\n`;
    });
    response += `💡 Best Price: ${cheapest.productName || cheapest.name} at ${cheapest.pharmacyName} for Rs ${cheapest.price}`;
    return response;
  };

  const getCheapestPharmacy = () => {
    const meds = medicinesRef.current;
    const pharms = pharmaciesRef.current;
    if (meds.length === 0 || pharms.length === 0) return "⏳ Data is still loading, please try again in a moment.";
    const pharmacyPrices = {};
    meds.forEach(m => {
      if (!m.pharmacyName || !m.price) return;
      if (!pharmacyPrices[m.pharmacyName]) pharmacyPrices[m.pharmacyName] = { total: 0, count: 0 };
      pharmacyPrices[m.pharmacyName].total += Number(m.price);
      pharmacyPrices[m.pharmacyName].count += 1;
    });
    const ranked = Object.entries(pharmacyPrices)
      .map(([name, data]) => ({ name, avg: (data.total / data.count).toFixed(0) }))
      .sort((a, b) => a.avg - b.avg);
    if (ranked.length === 0) return "❌ Could not calculate pharmacy prices.";
    const cheapest = ranked[0];
    const pharmacyInfo = pharms.find(p => p.name === cheapest.name);
    let response = `💰 Cheapest Pharmacy (by average medicine price):\n\n`;
    ranked.forEach((p, i) => {
      response += `${i + 1}. ${p.name} — Avg Rs ${p.avg}/medicine\n`;
    });
    if (pharmacyInfo) {
      response += `\n📍 ${cheapest.name}\n   📍 ${pharmacyInfo.address || "N/A"}\n   📞 ${pharmacyInfo.phone || "N/A"}`;
    }
    return response;
  };

  const comparePharmacyRatings = () => {
    const pharms = pharmaciesRef.current;
    if (pharms.length === 0) return "⏳ Data is still loading, please try again in a moment.";
    const sorted = [...pharms].filter(p => p.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sorted.length === 0) return "❌ Rating data not available for pharmacies.";
    let response = "⭐ Pharmacy Ratings (Best to Lowest):\n\n";
    sorted.forEach((p, i) => {
      response += `${i + 1}. ${p.name}\n   ⭐ ${p.rating}/5\n   📍 ${p.address || "N/A"}\n   📞 ${p.phone || "N/A"}\n\n`;
    });
    return response;
  };

  const findNearestPharmacy = () => {
    const pharms = pharmaciesRef.current;
    setCurrentPage("nearby-pharmacy");

    if (pharms.length === 0) {
      return "🗺️ Opening the nearby pharmacies map!\n\n⏳ Pharmacy data is loading, please wait a moment.";
    }
    if (!userLocation) {
      return "🗺️ Opening the nearby pharmacies map!\n\n📍 Please enable location access in your browser to see distances automatically.";
    }

    const sorted = pharms
      .filter(p => p.lat && p.lng)
      .map(p => ({ ...p, distance: getDistance(userLocation.lat, userLocation.lng, Number(p.lat), Number(p.lng)) }))
      .sort((a, b) => a.distance - b.distance);

    if (sorted.length === 0) {
      return "🗺️ Opened the nearby pharmacies map!\n\nNo pharmacies with GPS coordinates found in the system yet.";
    }

    const nearest = sorted[0];
    let response = `📍 Nearest Pharmacy:\n\n🏥 ${nearest.name}\n📍 ${nearest.address || "N/A"}\n📏 Distance: ${nearest.distance.toFixed(2)} km away\n📞 ${nearest.phone || "N/A"}\n⭐ Rating: ${nearest.rating || "N/A"}\n\n`;
    if (sorted.length > 1) {
      response += `Other nearby:\n`;
      sorted.slice(1, 3).forEach((p, i) => {
        response += `${i + 2}. ${p.name} — ${p.distance.toFixed(2)} km\n`;
      });
    }
    response += `\n🗺️ Map is now open for full details!`;
    return response;
  };

  const listAllPharmacies = () => {
    const pharms = pharmaciesRef.current;
    if (pharms.length === 0) return "⏳ Data is still loading, please try again in a moment.";
    return pharms.map((p, i) =>
      `${i + 1}. ${p.name}\n   📍 ${p.address || "N/A"}\n   📞 ${p.phone || "N/A"}\n   ⭐ ${p.rating || "N/A"}`
    ).join("\n\n");
  };

  // =============================================
  // SYMPTOM DETECTION → MEDICINE SUGGESTION
  // =============================================
  const detectSymptomAndSuggest = (text) => {
    for (const [, data] of Object.entries(symptomMedicineMap)) {
      if (data.symptoms.some(s => text.toLowerCase().includes(s))) {
        const availableMeds = searchMedicinesByKeywords(data.medicineKeywords);
        let response = data.advice + "\n\n";

        if (availableMeds.length > 0) {
          response += `✅ Available in our pharmacies (${availableMeds.length} found):\n\n`;
          availableMeds.forEach((m, i) => {
            response += `${i + 1}. ${m.productName || m.name}\n`;
            response += `   💰 Rs ${m.price || "N/A"}\n`;
            response += `   🏪 ${m.pharmacyName}\n`;
            response += `   📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n`;
            response += `   📍 ${m.pharmacyAddress}\n`;
            response += `   📞 ${m.pharmacyPhone}\n\n`;
          });
          response += `💡 Type "order ${availableMeds[0].productName || availableMeds[0].name}" to place an order!`;
        } else {
          response += "ℹ️ No exact matches in our current inventory, but these are the recommended medicines to ask your pharmacist about.\n🔍 Try browsing the products page or ask me to search by name!";
        }

        return response;
      }
    }
    return null;
  };

  // =============================================
  // ORDER HANDLING
  // =============================================
  const handleOrderIntent = (text) => {
    const lowerText = text.toLowerCase();
    const orderKeywords = ["order", "buy", "purchase", "i want", "get me", "add to cart"];
    const hasOrderKeyword = orderKeywords.some(k => lowerText.includes(k));
    if (!hasOrderKeyword) return null;

    let medicineName = "";

    const patterns = [
      /(?:order|buy|purchase|get me)\s+(?:for\s+)?([a-zA-Z0-9\s]+)/i,
      /(?:place\s+(?:an?\s+)?order\s+(?:for|of)\s+)([a-zA-Z0-9\s]+)/i,
      /(?:i\s+want\s+to\s+(?:order|buy)\s+)([a-zA-Z0-9\s]+)/i,
      /(?:i\s+want\s+(?:to\s+order|to\s+buy)\s+)([a-zA-Z0-9\s]+)/i,
    ];

    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match && match[1]) {
        medicineName = match[1].trim();
        break;
      }
    }

    medicineName = medicineName
      .replace(/\b(to|place|an|a|the|please|now|some|medicine|tablet|syrup|capsule|drug|order|for|of|and|i|want)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!medicineName || medicineName.length < 2) {
      setCurrentPage("products");
      return "🛒 Opening the products page for you! Browse all available medicines and add them to your cart.";
    }

    const results = searchMedicines(medicineName);
    if (results.length > 0) {
      const medicine = results[0];
      if (setSelectedProduct) setSelectedProduct(medicine);
      if (onMedicineSearch) onMedicineSearch(medicine.productName || medicine.name);
      setCurrentPage("products");
      return `🛒 Taking you to order "${medicine.productName || medicine.name}"!\n\n💰 Price: Rs ${medicine.price}\n🏪 Available at: ${medicine.pharmacyName}\n📍 ${medicine.pharmacyAddress}\n📞 ${medicine.pharmacyPhone}\n📦 Status: ${medicine.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}\n\nYou can add it to cart from the products page!`;
    }

    setCurrentPage("products");
    return `🔍 Searching for "${medicineName}" on our products page...\n\nCouldn't find an exact match but you can search there!`;
  };

  // =============================================
  // MEDICINE INFO (dosage / side effects)
  // =============================================
  const medicineInfoMap = {
    paracetamol: "💊 Paracetamol / Panadol\n\n📌 Uses: Fever, headache, mild-moderate pain\n⚖️ Dosage: 500mg-1g every 4-6 hours. Max 4g/day\n⚠️ Side effects: Rare at normal doses. Overdose causes liver damage\n🍽️ Take with or without food\n❌ Avoid alcohol",
    ibuprofen: "💊 Ibuprofen / Brufen\n\n📌 Uses: Pain, fever, inflammation\n⚖️ Dosage: 200-400mg every 6-8 hours. Max 1200mg/day\n⚠️ Side effects: Stomach upset, nausea, ulcers with long use\n🍽️ Always take with food\n❌ Avoid if kidney disease or stomach ulcers",
    omeprazole: "💊 Omeprazole\n\n📌 Uses: Acidity, GERD, stomach ulcers\n⚖️ Dosage: 20-40mg once daily before meal\n⚠️ Side effects: Headache, diarrhea, nausea\n🍽️ Take 30 min before breakfast",
    amoxicillin: "💊 Amoxicillin\n\n📌 Uses: Bacterial infections\n⚖️ Dosage: 250-500mg every 8 hours (prescribed)\n⚠️ Side effects: Diarrhea, rash, nausea\n📋 Requires prescription\n⚠️ Complete the full course even if you feel better",
    cetirizine: "💊 Cetirizine / Zyrtec\n\n📌 Uses: Allergies, hay fever, urticaria\n⚖️ Dosage: 10mg once daily\n⚠️ Side effects: Drowsiness, dry mouth\n🌙 Best taken at night",
    metformin: "💊 Metformin / Glucophage\n\n📌 Uses: Type 2 Diabetes\n⚖️ Dosage: 500mg-1g twice daily with meals (as prescribed)\n⚠️ Side effects: Nausea, diarrhea, stomach upset initially\n📋 Requires prescription\n🍽️ Always take with food"
  };

  const getMedicineInfo = (text) => {
    const infoKeywords = ["dosage", "how to take", "side effect", "uses of", "information about", "tell me about", "what is", "info on"];
    const hasInfoKeyword = infoKeywords.some(k => text.toLowerCase().includes(k));
    if (!hasInfoKeyword) return null;

    for (const [med, info] of Object.entries(medicineInfoMap)) {
      if (text.toLowerCase().includes(med)) return info;
    }

    const meds = medicinesRef.current;
    const foundMed = meds.find(m =>
      text.toLowerCase().includes((m.productName || m.name || "").toLowerCase()) &&
      (m.productName || m.name || "").length > 2
    );
    if (foundMed) {
      return `💊 ${foundMed.productName || foundMed.name}\n\n📌 Formula: ${foundMed.formula || "N/A"}\n💰 Price: Rs ${foundMed.price}\n📦 Stock: ${foundMed.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n🏪 Available at: ${foundMed.pharmacyName}\n📍 ${foundMed.pharmacyAddress}\n\n🩺 For detailed dosage instructions, please consult your pharmacist or doctor.`;
    }

    return null;
  };

  const extractCompareNames = (text) => {
    const vsPattern = /compare\s+(.+?)\s+(?:and|vs|versus|or)\s+(.+)/i;
    const match = text.match(vsPattern);
    if (match) return [match[1].trim(), match[2].trim()];
    const vsOnly = /(.+?)\s+(?:vs|versus)\s+(.+)/i;
    const matchVs = text.match(vsOnly);
    if (matchVs) return [matchVs[1].trim(), matchVs[2].trim()];
    return null;
  };

  // =============================================
  // MAIN BOT RESPONSE LOGIC
  // =============================================
  const getBotResponse = async (message) => {
    const text = message.toLowerCase().trim();

    if (!dataLoadedRef.current && medicinesRef.current.length === 0) {
      const isDataQuery = containsKeyword(text, [
        "medicine", "pharmacy", "nearest", "fever", "pain", "compare", "price", "order", "stock"
      ]);
      if (isDataQuery) {
        return "⏳ Still loading pharmacy data, please wait a moment and try again. Our database is warming up!";
      }
    }

    // Greetings
    if (containsWholeWord(text, ["hello", "hi", "hey", "salaam", "salam", "assalam"]) ||
        containsKeyword(text, ["good morning", "good evening", "good afternoon", "helo", "hii"])) {
      return "👋 Hello! Welcome to MedGO!\n\nHow can I help you today?\n\n💊 Search medicines\n🤒 Tell me your symptoms\n🏥 Find nearby pharmacies\n🛒 Place an order\n\nJust type what you need!";
    }

    // Help
    if (containsKeyword(text, ["help", "what can you do", "features", "options", "menu"])) {
      return "🤖 Here's what I can do:\n\n🔍 Search medicines by name\n💰 Compare medicine prices\n🆚 Compare two medicines (e.g. 'compare panadol vs brufen')\n💰 Find cheapest pharmacy\n⭐ Compare pharmacy ratings\n📍 Find nearest pharmacy\n🤒 Suggest medicines for symptoms\n🛒 Help you place orders\n💊 Give dosage & side effect info\n🧠 Answer any medical question\n\nJust ask naturally!";
    }

    // Thank you
    if (containsKeyword(text, ["thank", "thanks", "shukriya", "thank you", "great", "perfect", "awesome"])) {
      return "😊 You're welcome! Stay healthy! 💚\n\nIs there anything else I can help you with?";
    }

    // Navigation
    if (containsKeyword(text, ["show pharmacies", "all pharmacies", "list pharmacies", "open pharmacies"])) {
      setCurrentPage("pharmacies");
      return "🔄 Opening all pharmacies page for you!";
    }
    if (containsKeyword(text, ["nearby", "near me", "closest", "nearby pharmacy", "map", "pharmacy map"])) {
      setCurrentPage("nearby-pharmacy");
      return "🗺️ Opening the nearby pharmacies map!";
    }
    if (containsKeyword(text, ["all products", "browse medicines", "product page", "show products", "see medicines"])) {
      setCurrentPage("products");
      return "📋 Opening the products page!";
    }

    // Order intent
    const orderResponse = handleOrderIntent(text);
    if (orderResponse) return orderResponse;

    // General place order
    if (containsKeyword(text, ["place order", "want to order", "how to order", "i want to buy", "make order"])) {
      setCurrentPage("products");
      return "🛒 Taking you to our products page!\n\nBrowse medicines, add to cart, and place your order. We deliver across Pakistan! 🇵🇰";
    }

    // Cheapest pharmacy
    if (containsKeyword(text, [
      "cheapest pharmacy", "cheapest pharm", "which pharmacy is cheap",
      "lowest price pharmacy", "cheap pharmacy", "affordable pharmacy",
      "which pharmacy has lowest", "best price pharmacy", "which pharm"
    ])) {
      return getCheapestPharmacy();
    }

    // Pharmacy ratings
    if (containsKeyword(text, ["rating", "best pharmacy", "top pharmacy", "highest rated", "best rated", "which pharmacy is best", "highest rating", "pharmacy have highest", "pharmacy has highest"])) {
      return comparePharmacyRatings();
    }

    // Nearest pharmacy
    if (containsKeyword(text, ["nearest pharmacy", "closest pharmacy", "where is pharmacy", "nearest", "closest to me"])) {
      return findNearestPharmacy();
    }

    // List pharmacies
    if (containsKeyword(text, ["list pharmacy", "all pharmacy", "pharmacies available", "how many pharmacy"])) {
      return listAllPharmacies();
    }

    // Compare two medicines
    const compareNames = extractCompareNames(text);
    if (compareNames) {
      return compareTwoMedicines(compareNames[0], compareNames[1]);
    }

    // Compare prices for single medicine
    if (containsKeyword(text, ["compare", "price comparison", "cheapest medicine", "which is cheaper", "lowest price"])) {
      const cleaned = text
        .replace(/compare|price|comparison|cheapest|cheaper|lowest|find|medicine|drug|for|the|of/g, "")
        .trim().split(/\s+/).filter(w => w.length > 2).join(" ");
      if (cleaned.length > 1) return compareMedicinePrices(cleaned);
    }

    // Symptom detection
    const symptomResponse = detectSymptomAndSuggest(text);
    if (symptomResponse) return symptomResponse;

    // Medicine info / dosage
    const infoResponse = getMedicineInfo(text);
    if (infoResponse) return infoResponse;

    // Direct medicine search
    const directSearch = searchMedicines(text);
    if (directSearch.length > 0) {
      if (onMedicineSearch) {
        onMedicineSearch(text);
        setCurrentPage("products");
      }
      return `🔍 Found ${directSearch.length} result(s):\n\n${formatMedicineResults(directSearch)}\n\n💡 Results shown on the products page!\nType "order [medicine name]" to place an order.`;
    }

    // Keyword medicine search
    if (containsKeyword(text, ["search", "find", "look for", "do you have", "available", "stock", "price of", "medicine", "drug", "tablet", "syrup", "capsule", "medication", "antibiotic", "vitamin", "painkiller"])) {
      const cleaned = text
        .replace(/search|find|look for|do you have|medicine|drug|is there|available|stock|price|medication|for|the|a |an |tablet|syrup|capsule|antibiotic|vitamin|painkiller/g, "")
        .trim().split(/\s+/).filter(w => w.length > 2).join(" ");
      if (cleaned.length > 1) {
        const results = searchMedicines(cleaned);
        if (results.length > 0) {
          if (onMedicineSearch) {
            onMedicineSearch(cleaned);
            setCurrentPage("products");
          }
          return `🔍 Found ${results.length} result(s):\n\n${formatMedicineResults(results)}\n\n💡 Results shown on the products page!\nType "order [medicine name]" to place an order.`;
        } else {
          return `❌ No medicines found for "${cleaned}".\n\nTry a different name or type "show products" to browse everything.`;
        }
      }
    }

    // Visit store
    if (containsKeyword(text, ["visit", "go to store", "open store", "pharmacy store"])) {
      setCurrentPage("pharmacies");
      return "🏪 Taking you to the pharmacies page!";
    }

    // AI FALLBACK — Gemini answers everything else
    const firestoreContext = buildFirestoreContext();
    const conversationHistory = messages.slice(-12);
    const aiResponse = await askGemini(message, conversationHistory, firestoreContext);
    return aiResponse;
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;
    const userMessage = { id: Date.now(), text: inputMessage, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    const response = await getBotResponse(inputMessage);
    const botResponse = { id: Date.now() + 1, text: response, sender: "bot", timestamp: new Date() };
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleQuickQuestion = (question) => {
    const userMessage = { id: Date.now(), text: question, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    getBotResponse(question).then(response => {
      const botResponse = { id: Date.now() + 1, text: response, sender: "bot", timestamp: new Date() };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    });
  };

  const quickQuestions = [
    { label: "📍 Nearest Pharmacy", query: "nearest pharmacy" },
    { label: "🤒 I have fever", query: "I have fever" },
    { label: "💰 Compare Prices", query: "compare paracetamol prices" },
    { label: "🛒 Place Order", query: "I want to place an order" }
  ];

  const getMedicineCount = () => medicinesRef.current.length || medicines.length;
  const getPharmacyCount = () => pharmaciesRef.current.length || pharmacies.length;

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`medgo-chat-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        <span className="medgo-toggle-icon">{isOpen ? "✕" : "💬"}</span>
        {!isOpen && <span className="medgo-toggle-pulse" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="medgo-chatbot">
          {/* Header */}
          <div className="medgo-header">
            <div className="medgo-header-left">
              <div className="medgo-avatar">🏥</div>
              <div className="medgo-header-info">
                <span className="medgo-header-title">MedGO Assistant</span>
                <span className="medgo-header-status">
                  {dataLoading
                    ? <><span className="medgo-dot loading" />Loading data...</>
                    : <><span className="medgo-dot online" />{getMedicineCount()} medicines · {getPharmacyCount()} pharmacies</>
                  }
                </span>
              </div>
            </div>
            <button className="medgo-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="medgo-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`medgo-message ${msg.sender}`}>
                {msg.sender === "bot" && <div className="medgo-bot-icon">🤖</div>}
                <div className="medgo-bubble">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="medgo-message bot">
                <div className="medgo-bot-icon">🤖</div>
                <div className="medgo-bubble medgo-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="medgo-quick">
              <p className="medgo-quick-label">Quick actions</p>
              <div className="medgo-quick-grid">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="medgo-quick-btn"
                    onClick={() => handleQuickQuestion(q.query)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSendMessage} className="medgo-input-row">
            <input
              className="medgo-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything — symptoms, medicines..."
              disabled={isTyping}
              autoComplete="off"
            />
            <button
              type="submit"
              className="medgo-send-btn"
              disabled={isTyping || !inputMessage.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;