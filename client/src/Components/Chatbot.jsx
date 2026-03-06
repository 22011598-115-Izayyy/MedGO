import React, { useState, useRef, useEffect } from "react";
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
  const [dataLoaded, setDataLoaded] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadPharmacies = async () => {
      const snapshot = await getDocs(collection(db, "Pharmacies"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPharmacies(list);
    };
    loadPharmacies();
  }, []);

  useEffect(() => {
    const loadMedicines = async () => {
      const pharmacySnapshot = await getDocs(collection(db, "Pharmacies"));
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
      setDataLoaded(true);
    };
    loadMedicines();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      });
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
      medicines: ["paracetamol", "panadol", "febrol", "calpol", "brufen", "ibuprofen"],
      advice: "💊 For fever, the most commonly recommended medicines are:\n\n• Paracetamol (Panadol) — safest first choice\n• Ibuprofen (Brufen) — also reduces inflammation\n\n⚠️ Dosage: Adults 500mg-1g every 4-6 hours. Max 4g/day.\n🩺 See a doctor if fever exceeds 103°F or lasts more than 3 days."
    },
    headache: {
      symptoms: ["headache", "head pain", "migraine", "sir dard", "head ache", "head hurts"],
      medicines: ["paracetamol", "panadol", "brufen", "ibuprofen", "aspirin", "diclofenac"],
      advice: "💊 For headache/migraine:\n\n• Paracetamol (Panadol) — mild to moderate headache\n• Ibuprofen (Brufen) — tension/migraine headache\n• Aspirin — adults only\n\n⚠️ Dosage: 500mg-1g every 4-6 hours.\n💧 Stay hydrated and rest in a dark, quiet room.\n🩺 See a doctor if headache is severe or sudden."
    },
    cold: {
      symptoms: ["cold", "cough", "flu", "runny nose", "sore throat", "congestion", "sneezing", "zukam", "nazla", "khansi"],
      medicines: ["panadol cold", "actifed", "rhinokold", "benadryl", "coflin", "flutex"],
      advice: "💊 For cold & flu:\n\n• Panadol Cold & Flu — relieves all cold symptoms\n• Actifed — decongestant + antihistamine\n• Benadryl syrup — for cough & congestion\n\n⚠️ Rest, stay hydrated, warm liquids help.\n🩺 If symptoms persist more than 7 days, see a doctor."
    },
    stomach: {
      symptoms: ["stomach", "stomach pain", "gastric", "acidity", "ulcer", "nausea", "vomiting", "diarrhea", "loose motion", "constipation", "bloating", "indigestion", "pait dard", "stomache", "tummy", "abdomen"],
      medicines: ["omeprazole", "antacid", "gaviscon", "pepto", "flagyl", "metronidazole", "buscopan"],
      advice: "💊 For stomach issues:\n\n• Omeprazole — acid reflux, ulcers\n• Antacid / Gaviscon — heartburn, acidity\n• Buscopan — stomach cramps, spasms\n• Metronidazole (Flagyl) — infections, diarrhea (needs prescription)\n\n💧 Drink plenty of fluids.\n🩺 See a doctor if pain is severe or lasts more than 2 days."
    },
    pain: {
      symptoms: ["pain", "dard", "body ache", "muscle pain", "joint pain", "back pain", "toothache", "ear pain", "knee pain"],
      medicines: ["brufen", "ibuprofen", "panadol", "voltaren", "diclofenac", "ponstan"],
      advice: "💊 For pain relief:\n\n• Ibuprofen (Brufen) — inflammation + pain\n• Paracetamol (Panadol) — general pain\n• Diclofenac (Voltaren) — joint & muscle pain\n• Mefenamic Acid (Ponstan) — moderate pain\n\n⚠️ Take with food to avoid stomach irritation.\n🩺 See a doctor if pain is severe or chronic."
    },
    allergy: {
      symptoms: ["allergy", "allergic", "itching", "rash", "hives", "skin reaction", "sneezing", "watery eyes", "khujli"],
      medicines: ["antihistamine", "cetirizine", "loratadine", "benadryl", "clarityn", "zyrtec"],
      advice: "💊 For allergies:\n\n• Cetirizine (Zyrtec) — 24-hour allergy relief\n• Loratadine (Clarityn) — non-drowsy option\n• Benadryl — fast acting, may cause drowsiness\n\n⚠️ Avoid known allergens.\n🩺 For severe allergic reactions (difficulty breathing, swelling), seek emergency care immediately."
    },
    diabetes: {
      symptoms: ["diabetes", "sugar", "blood sugar", "diabetic", "insulin", "glucose"],
      medicines: ["metformin", "glucophage", "insulin", "glimepiride", "januvia"],
      advice: "💊 Diabetes management medicines:\n\n• Metformin (Glucophage) — most common Type 2 diabetes medicine\n• Glimepiride — stimulates insulin production\n• Insulin — Type 1 and advanced Type 2\n\n⚠️ These require a prescription from a doctor.\n🩺 Regular blood sugar monitoring and doctor consultation is essential."
    },
    hypertension: {
      symptoms: ["blood pressure", "hypertension", "bp high", "high bp", "bp", "heart", "bp low", "low bp"],
      medicines: ["amlodipine", "losartan", "atenolol", "lisinopril", "norvasc"],
      advice: "💊 For blood pressure:\n\n• Amlodipine (Norvasc) — calcium channel blocker\n• Losartan — ARB, kidney protective\n• Atenolol — beta blocker\n\n⚠️ These require a valid prescription.\n🩺 Monitor BP regularly. Do not stop medication without doctor's advice."
    },
    anxiety: {
      symptoms: ["anxiety", "stress", "depression", "sleep", "insomnia", "tension", "nervous", "mental health", "panic"],
      medicines: ["alprazolam", "diazepam", "melatonin", "sertraline"],
      advice: "💊 For anxiety & sleep:\n\n• Melatonin — safe, non-prescription sleep aid\n• Alprazolam / Diazepam — require prescription, short-term only\n\n⚠️ Prescription medicines require doctor authorization.\n🩺 Please consult a doctor or mental health professional for proper diagnosis and treatment.\n💚 You're not alone — help is available."
    }
  };

  // =============================================
  // BUILD FIRESTORE CONTEXT FOR GEMINI
  // =============================================
  const buildFirestoreContext = () => {
    if (!dataLoaded) return "";
    const pharmacyList = pharmacies.map(p =>
      `Pharmacy: ${p.name} | Address: ${p.address || "N/A"} | Phone: ${p.phone || "N/A"} | Rating: ${p.rating || "N/A"}`
    ).join("\n");
    const medicineList = medicines.slice(0, 80).map(m =>
      `Medicine: ${m.productName || m.name} | Price: Rs ${m.price} | Stock: ${m.stock > 0 ? "In Stock" : "Out of Stock"} | Pharmacy: ${m.pharmacyName} | Formula: ${m.formula || "N/A"} | Category: ${m.category || "N/A"}`
    ).join("\n");
    return `PHARMACIES:\n${pharmacyList}\n\nMEDICINES:\n${medicineList}`;
  };

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

  // ✅ FIX: containsKeyword for general use (substring match)
  const containsKeyword = (text, keywords) =>
    keywords.some(k => text.toLowerCase().includes(k));

  // ✅ FIX: Word-boundary match — prevents "hi" inside "which", "hey" inside "they", etc.
  const containsWholeWord = (text, words) =>
    words.some(w => new RegExp(`(^|\\s|[^a-zA-Z])${w}(\\s|$|[^a-zA-Z])`, "i").test(text));

  // =============================================
  // SEARCH MEDICINES
  // =============================================
  const searchMedicines = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery || lowerQuery.length < 2) return [];

    const exact = medicines.filter(m => {
      const name = (m.productName || m.name || "").toLowerCase();
      const formula = (m.formula || "").toLowerCase();
      const category = (m.category || "").toLowerCase();
      return name.includes(lowerQuery) || formula.includes(lowerQuery) || category.includes(lowerQuery);
    });

    if (exact.length > 0) return exact.slice(0, 6);

    return medicines
      .map(m => {
        const name = (m.productName || m.name || "").toLowerCase();
        return { m, dist: levenshteinDistance(lowerQuery, name) };
      })
      .filter(item => item.dist <= 3)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 5)
      .map(item => item.m);
  };

  const formatMedicineResults = (results) => {
    if (results.length === 0) return "❌ No medicines found. Try a different name or spelling.";
    return results.map((m, i) =>
      `${i + 1}. ${m.productName || m.name}\n` +
      `   💰 Price: Rs ${m.price || "N/A"}\n` +
      `   🏪 Pharmacy: ${m.pharmacyName}\n` +
      `   📦 Stock: ${m.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}\n` +
      `   💊 Formula: ${m.formula || "N/A"}\n` +
      `   📍 ${m.pharmacyAddress}`
    ).join("\n\n");
  };

  const compareMedicinePrices = (query) => {
    const results = searchMedicines(query);
    if (results.length === 0) return `❌ No medicines found matching "${query}".`;
    const sorted = [...results].sort((a, b) => (a.price || 0) - (b.price || 0));
    const cheapest = sorted[0];
    let response = `📊 Price Comparison for "${query}":\n\n`;
    sorted.forEach((m, i) => {
      response += `${i + 1}. ${m.productName || m.name}\n`;
      response += `   💰 Rs ${m.price || "N/A"} — 🏪 ${m.pharmacyName}\n`;
      response += `   📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n\n`;
    });
    response += `💡 Best Price: ${cheapest.productName || cheapest.name} at ${cheapest.pharmacyName} for Rs ${cheapest.price}`;
    return response;
  };

  const getCheapestPharmacy = () => {
    if (medicines.length === 0 || pharmacies.length === 0) return "❌ Data not loaded yet.";
    const pharmacyPrices = {};
    medicines.forEach(m => {
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
    const pharmacyInfo = pharmacies.find(p => p.name === cheapest.name);
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
    if (pharmacies.length === 0) return "❌ No pharmacy data available.";
    const sorted = [...pharmacies].filter(p => p.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sorted.length === 0) return "❌ Rating data not available for pharmacies.";
    let response = "⭐ Pharmacy Ratings (Best to Lowest):\n\n";
    sorted.forEach((p, i) => {
      response += `${i + 1}. ${p.name}\n   ⭐ ${p.rating}/5\n   📍 ${p.address || "N/A"}\n   📞 ${p.phone || "N/A"}\n\n`;
    });
    return response;
  };

  const findNearestPharmacy = () => {
    if (!userLocation) return "📍 Please enable location access to find nearby pharmacies.";
    if (pharmacies.length === 0) return "❌ No pharmacies found.";
    const sorted = pharmacies
      .filter(p => p.lat && p.lng)
      .map(p => ({ ...p, distance: getDistance(userLocation.lat, userLocation.lng, Number(p.lat), Number(p.lng)) }))
      .sort((a, b) => a.distance - b.distance);
    if (sorted.length === 0) return "❌ No pharmacies with location data found.";
    const nearest = sorted[0];
    let response = `📍 Nearest Pharmacy:\n\n🏥 ${nearest.name}\n📍 ${nearest.address || "N/A"}\n📏 Distance: ${nearest.distance.toFixed(2)} km away\n📞 ${nearest.phone || "N/A"}\n⭐ Rating: ${nearest.rating || "N/A"}\n\n`;
    if (sorted.length > 1) {
      response += `Other nearby:\n`;
      sorted.slice(1, 3).forEach((p, i) => {
        response += `${i + 2}. ${p.name} — ${p.distance.toFixed(2)} km\n`;
      });
    }
    return response;
  };

  const listAllPharmacies = () => {
    if (pharmacies.length === 0) return "❌ No pharmacies available.";
    return pharmacies.map((p, i) =>
      `${i + 1}. ${p.name}\n   📍 ${p.address || "N/A"}\n   📞 ${p.phone || "N/A"}\n   ⭐ ${p.rating || "N/A"}`
    ).join("\n\n");
  };

  // =============================================
  // SYMPTOM DETECTION → MEDICINE SUGGESTION
  // =============================================
  const detectSymptomAndSuggest = (text) => {
    for (const [, data] of Object.entries(symptomMedicineMap)) {
      if (data.symptoms.some(s => text.toLowerCase().includes(s))) {
        const availableMeds = [];
        data.medicines.forEach(medName => {
          const found = medicines.filter(m => {
            const name = (m.productName || m.name || "").toLowerCase();
            const formula = (m.formula || "").toLowerCase();
            const category = (m.category || "").toLowerCase();
            return (
              name.includes(medName.toLowerCase()) ||
              formula.includes(medName.toLowerCase()) ||
              category.includes(medName.toLowerCase())
            );
          });
          availableMeds.push(...found);
        });

        const uniqueMeds = availableMeds.filter((m, i, arr) =>
          arr.findIndex(x =>
            (x.productName || x.name) === (m.productName || m.name) &&
            x.pharmacyName === m.pharmacyName
          ) === i
        ).slice(0, 5);

        let response = data.advice + "\n\n";

        if (uniqueMeds.length > 0) {
          response += "✅ Available in our pharmacies:\n\n";
          uniqueMeds.forEach((m, i) => {
            response += `${i + 1}. ${m.productName || m.name} — Rs ${m.price}\n`;
            response += `   🏪 ${m.pharmacyName} | 📦 ${m.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n\n`;
          });
          response += `💡 Type "order ${uniqueMeds[0].productName || uniqueMeds[0].name}" to place an order!`;
        } else {
          response += "❌ No matching medicines found in our inventory right now.\n🔍 Try browsing the products page!";
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
      return `🛒 Taking you to order "${medicine.productName || medicine.name}"!\n\n💰 Price: Rs ${medicine.price}\n🏪 Available at: ${medicine.pharmacyName}\n📦 Status: ${medicine.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}\n\nYou can add it to cart from the products page!`;
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

    const foundMed = medicines.find(m =>
      text.toLowerCase().includes((m.productName || m.name || "").toLowerCase()) &&
      (m.productName || m.name || "").length > 2
    );
    if (foundMed) {
      return `💊 ${foundMed.productName || foundMed.name}\n\n📌 Formula: ${foundMed.formula || "N/A"}\n💰 Price: Rs ${foundMed.price}\n📦 Stock: ${foundMed.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}\n🏪 Available at: ${foundMed.pharmacyName}\n\n🩺 For detailed dosage instructions, please consult your pharmacist or doctor.`;
    }

    return null;
  };

  // =============================================
  // MAIN BOT RESPONSE LOGIC
  // =============================================
  const getBotResponse = async (message) => {
    const text = message.toLowerCase().trim();

    // ✅ FIX: Use word-boundary match for greetings
    // Prevents "which" triggering "hi", "they" triggering "hey", etc.
    if (containsWholeWord(text, ["hello", "hi", "hey", "salaam", "salam", "assalam"]) ||
        containsKeyword(text, ["good morning", "good evening", "good afternoon", "helo", "hii"])) {
      return "👋 Hello! Welcome to MedGO!\n\nHow can I help you today?\n\n💊 Search medicines\n🤒 Tell me your symptoms\n🏥 Find nearby pharmacies\n🛒 Place an order\n\nJust type what you need!";
    }

    // --- Help ---
    if (containsKeyword(text, ["help", "what can you do", "features", "options", "menu"])) {
      return "🤖 Here's what I can do:\n\n🔍 Search medicines by name\n💰 Compare medicine prices\n💰 Find cheapest pharmacy\n⭐ Compare pharmacy ratings\n📍 Find nearest pharmacy\n🤒 Suggest medicines for symptoms\n🛒 Help you place orders\n💊 Give dosage & side effect info\n🗺️ Navigate to pages\n\nJust ask naturally — like 'I have fever' or 'find panadol' or 'which pharmacy is cheapest'!";
    }

    // --- Thank you ---
    if (containsKeyword(text, ["thank", "thanks", "shukriya", "thank you", "great", "perfect", "awesome"])) {
      return "😊 You're welcome! Stay healthy! 💚\n\nIs there anything else I can help you with?";
    }

    // --- Navigation ---
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

    // --- Order intent ---
    const orderResponse = handleOrderIntent(text);
    if (orderResponse) return orderResponse;

    // --- General place order ---
    if (containsKeyword(text, ["place order", "want to order", "how to order", "i want to buy", "make order"])) {
      setCurrentPage("products");
      return "🛒 Taking you to our products page!\n\nBrowse medicines, add to cart, and place your order. We deliver across Pakistan! 🇵🇰";
    }

    // --- Cheapest pharmacy ---
    if (containsKeyword(text, [
      "cheapest pharmacy", "cheapest pharm", "which pharmacy is cheap",
      "lowest price pharmacy", "cheap pharmacy", "affordable pharmacy",
      "which pharmacy has lowest", "best price pharmacy", "which pharm"
    ])) {
      return getCheapestPharmacy();
    }

    // --- Pharmacy ratings ---
    if (containsKeyword(text, ["rating", "best pharmacy", "top pharmacy", "highest rated", "best rated", "which pharmacy is best", "highest rating", "pharmacy have highest", "pharmacy has highest"])) {
      return comparePharmacyRatings();
    }

    // --- Nearest pharmacy ---
    if (containsKeyword(text, ["nearest pharmacy", "closest pharmacy", "where is pharmacy", "nearest", "closest to me"])) {
      return findNearestPharmacy();
    }

    // --- List pharmacies ---
    if (containsKeyword(text, ["list pharmacy", "all pharmacy", "pharmacies available", "how many pharmacy"])) {
      return listAllPharmacies();
    }

    // --- Compare prices ---
    if (containsKeyword(text, ["compare", "price comparison", "cheapest medicine", "which is cheaper", "lowest price"])) {
      const cleaned = text
        .replace(/compare|price|comparison|cheapest|cheaper|lowest|find|medicine|drug|for|the|of/g, "")
        .trim().split(/\s+/).filter(w => w.length > 2).join(" ");
      if (cleaned.length > 1) return compareMedicinePrices(cleaned);
    }

    // --- Symptom detection ---
    const symptomResponse = detectSymptomAndSuggest(text);
    if (symptomResponse) return symptomResponse;

    // --- Medicine info / dosage ---
    const infoResponse = getMedicineInfo(text);
    if (infoResponse) return infoResponse;

    // --- Direct medicine search ---
    const directSearch = searchMedicines(text);
    if (directSearch.length > 0) {
      if (onMedicineSearch) {
        onMedicineSearch(text);
        setCurrentPage("products");
      }
      return `🔍 Found ${directSearch.length} result(s):\n\n${formatMedicineResults(directSearch)}\n\n💡 Results shown on the products page!\nType "order [medicine name]" to place an order.`;
    }

    // --- Keyword medicine search ---
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

    // --- Visit store ---
    if (containsKeyword(text, ["visit", "go to store", "open store", "pharmacy store"])) {
      setCurrentPage("pharmacies");
      return "🏪 Taking you to the pharmacies page!";
    }

    // ✅ AI FALLBACK
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

  return (
    <>
      <style>{`
        .chat-toggle {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(22, 163, 74, 0.4);
          transition: all 0.3s ease;
          z-index: 999;
        }
        .chat-toggle:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(22, 163, 74, 0.6); }
        .chatbot-container {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 420px;
          height: 650px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
          display: flex;
          flex-direction: column;
          z-index: 998;
          animation: slideUp 0.3s ease;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 16px 18px;
          border-radius: 16px 16px 0 0;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .chatbot-header-left { display: flex; align-items: center; gap: 10px; }
        .chatbot-status { font-size: 11px; font-weight: 400; opacity: 0.85; margin-top: 2px; }
        .chatbot-close-btn { background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 2px 6px; border-radius: 4px; }
        .chatbot-close-btn:hover { background: rgba(255,255,255,0.2); }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f8f9fa;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .chatbot-messages::-webkit-scrollbar { width: 6px; }
        .chatbot-messages::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 10px; }
        .message { display: flex; margin-bottom: 4px; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message.user { justify-content: flex-end; }
        .message.bot { justify-content: flex-start; }
        .message-content {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.65;
          word-wrap: break-word;
          white-space: pre-wrap;
        }
        .message.user .message-content {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message.bot .message-content {
          background: white;
          color: #333;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px 14px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          width: fit-content;
        }
        .typing-indicator span { width: 8px; height: 8px; background: #16a34a; border-radius: 50%; animation: bounce 1.4s infinite; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        .quick-questions {
          padding: 10px 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          border-top: 1px solid #e5e7eb;
          background: #fafafa;
        }
        .quick-question-btn {
          padding: 9px 10px;
          background: white;
          border: 1.5px solid #16a34a;
          color: #16a34a;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
          font-weight: 500;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .quick-question-btn:hover { background: #16a34a; color: white; }
        .chatbot-input {
          display: flex;
          padding: 12px;
          border-top: 1px solid #e5e7eb;
          gap: 8px;
          background: white;
          border-radius: 0 0 16px 16px;
        }
        .chatbot-input input {
          flex: 1;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .chatbot-input input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1); }
        .chatbot-input button {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          border: none;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chatbot-input button:hover { transform: scale(1.05); }
        .chatbot-input button:disabled { background: #9ca3af; cursor: not-allowed; transform: none; }
        @media (max-width: 600px) {
          .chatbot-container { width: 90vw; height: 70vh; right: 5vw; bottom: 80px; }
          .message-content { max-width: 90%; font-size: 12px; }
        }
      `}</style>

      <button className={`chat-toggle ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <span>🏥</span>
              <div>
                <div>MedGO Pharmacy Assistant</div>
                <div className="chatbot-status">
                  {dataLoaded ? `✅ ${medicines.length} medicines · ${pharmacies.length} pharmacies` : "⏳ Loading data..."}
                </div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {messages.length <= 2 && (
            <div className="quick-questions">
              {quickQuestions.map((q, i) => (
                <button key={i} className="quick-question-btn" onClick={() => handleQuickQuestion(q.query)}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything — symptoms, medicines, orders..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !inputMessage.trim()}>➤</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;