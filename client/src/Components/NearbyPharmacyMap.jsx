import React, { useEffect, useState, useRef } from "react";
import './NearbyPharmacyMap.css';

import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  Autocomplete
} from "@react-google-maps/api";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const containerStyle = {
  width: "100%",
  height: "620px",
  borderRadius: "18px"
};

const libraries = ["places"];

function NearbyPharmacyMap({ setCurrentPage, setSelectedPharmacy }) {

  const [userLocation, setUserLocation] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);
  const [searchBox, setSearchBox] = useState(null);
  const [nearest, setNearest] = useState(null);
  const [eta, setEta] = useState(null);

  const [medicineQuery,setMedicineQuery] = useState("");
  const [medicineResults,setMedicineResults] = useState([]);
  const [cheapestPharmacy,setCheapestPharmacy] = useState(null);
  const [sortBy,setSortBy] = useState("distance");

  const [pharmaciesWithMedicine,setPharmaciesWithMedicine] = useState([]);

  const mapRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    });
  }, []);

  useEffect(() => {

    const fetchPharmacies = async () => {

      const snapshot = await getDocs(collection(db, "Pharmacies"));

      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        rating: doc.data().rating || (Math.random()*1+4).toFixed(1),
        deliveryTime: Math.floor(Math.random()*15+15)
      }));

      setPharmacies(list);
    };

    fetchPharmacies();

  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {

    if (!userLocation || pharmacies.length === 0) return;

    const sorted = pharmacies.map(p => {

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(p.lat),
        Number(p.lng)
      );

      return { ...p, distance };

    }).sort((a, b) => a.distance - b.distance);

    setPharmacies(sorted);
    setNearest(sorted[0]);

  }, [userLocation, pharmacies.length]);

  useEffect(() => {

    if (!mapRef.current || pharmacies.length === 0 || !userLocation) return;

    const bounds = new window.google.maps.LatLngBounds();

    bounds.extend(userLocation);

    pharmacies.forEach(p => {
      bounds.extend({
        lat: Number(p.lat),
        lng: Number(p.lng)
      });
    });

    mapRef.current.fitBounds(bounds);

  }, [pharmacies, userLocation]);

  const getDirections = (pharmacy) => {

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: Number(pharmacy.lat),
          lng: Number(pharmacy.lng)
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === "OK") {

          setDirections(result);

          const duration =
            result.routes[0].legs[0].duration.text;

          setEta(duration);
        }
      }
    );
  };

  const visitStore = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setCurrentPage("store");
  };

  const onPlaceChanged = () => {

    if (!searchBox) return;

    const place = searchBox.getPlace();

    if (place.geometry) {

      mapRef.current.panTo({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });

    }
  };

  const getOpenStatus = (pharmacy)=>{

    if(!pharmacy.openTime || !pharmacy.closeTime) return "Open";

    const now = new Date().getHours();

    if(now >= pharmacy.openTime && now < pharmacy.closeTime)
      return "Open";
    else
      return "Closed";
  }

  const searchMedicine = async ()=>{

    if(!medicineQuery) return;

    const pharmaciesSnap = await getDocs(collection(db,"Pharmacies"));

    let results = [];
    let availablePharmacies = [];

    for(const p of pharmaciesSnap.docs){

      const productsSnap = await getDocs(
        collection(db,"Pharmacies",p.id,"products")
      );

      productsSnap.forEach(prod=>{

        const data = prod.data();

        if(data.productName?.toLowerCase().includes(medicineQuery.toLowerCase())){

          results.push({
            pharmacy:p.data().name,
            price:data.price,
            pharmacyId:p.id
          });

          availablePharmacies.push(p.id);

        }

      });

    }

    const sorted = results.sort((a,b)=>a.price-b.price);

    setMedicineResults(sorted);
    setCheapestPharmacy(sorted[0]);
    setPharmaciesWithMedicine(availablePharmacies);

  }

  const sortedPharmacies = [...pharmacies].sort((a,b)=>{

    if(sortBy==="distance") return a.distance-b.distance;
    if(sortBy==="rating") return (b.rating||0)-(a.rating||0);
    if(sortBy==="delivery") return (a.distance*3)-(b.distance*3);

    return 0;

  });

  return (

    <LoadScript
      googleMapsApiKey="AIzaSyCrGaktjQzMGKjFdJ-a-cCgxn6huo8XbKc"
      libraries={libraries}
    >

      {userLocation && (

        <div className="nearby-wrapper">

          <div className="map-card">

            {/* SEARCH BAR WITH EXTRA SPACE */}
            <div className="search-bar">

              <Autocomplete
                onLoad={(ref) => setSearchBox(ref)}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  className="search-input"
                  type="text"
                  placeholder="🔍 Search pharmacy..."
                />
              </Autocomplete>

              <div className="medicine-search">

                <input
                  className="search-input"
                  placeholder="💊 Search medicine..."
                  value={medicineQuery}
                  onChange={(e)=>setMedicineQuery(e.target.value)}
                  onKeyDown={(e)=>{
                    if(e.key === "Enter"){
                      searchMedicine();
                    }
                  }}
                />

                <button
                  className="search-btn"
                  onClick={searchMedicine}
                >
                  Search
                </button>

              </div>

            </div>

            <GoogleMap
              mapContainerStyle={containerStyle}
              center={userLocation}
              zoom={14}
              onLoad={(map) => (mapRef.current = map)}
            >

              <Marker
                position={userLocation}
                label="You"
                animation={window.google?.maps?.Animation?.DROP}
              />

              {pharmacies.map((pharmacy) => (

                <Marker
                  key={pharmacy.id}
                  position={{
                    lat: Number(pharmacy.lat),
                    lng: Number(pharmacy.lng)
                  }}
                  animation={window.google?.maps?.Animation?.BOUNCE}
                  onClick={() => setSelected(pharmacy)}
                  icon={
                    nearest && pharmacy.id === nearest.id
                      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                      : pharmaciesWithMedicine.includes(pharmacy.id)
                      ? "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                      : undefined
                  }
                />

              ))}

              {selected && (

                <InfoWindow
                  position={{
                    lat: Number(selected.lat),
                    lng: Number(selected.lng)
                  }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div className="info-card">

                    <h4>{selected.name}</h4>

                    <p>⭐ {selected.rating}</p>
                    <p>⏱ {selected.deliveryTime} min delivery</p>
                    <p>📍 {selected.distance?.toFixed(2)} km</p>
                    <p>Status: {getOpenStatus(selected)}</p>

                    {eta && <p>🚗 ETA {eta}</p>}

                    <div className="info-buttons">

                      <button
                        className="navigate-btn"
                        onClick={() => getDirections(selected)}
                      >
                        Navigate
                      </button>

                      <button
                        className="visit-btn"
                        onClick={() => visitStore(selected)}
                      >
                        Visit Store
                      </button>

                    </div>

                  </div>
                </InfoWindow>

              )}

              {directions && (
                <DirectionsRenderer directions={directions} />
              )}

            </GoogleMap>

          </div>

          {/* SPACE BETWEEN MAP AND CARDS */}
          <div className="pharmacy-list">

            {/* HEADER WITH SORT FILTER */}
            <div className="pharmacy-header">

              <h3>Nearby Pharmacies</h3>

              <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e)=>setSortBy(e.target.value)}
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="delivery">Sort by Delivery Time</option>
              </select>

            </div>

            {medicineResults.length > 0 && (

              <div className="medicine-result">

                <b>Medicine Availability</b>

                {medicineResults.slice(0,3).map((m,i)=>(
                  <div key={i}>
                    {m.pharmacy} — Rs {m.price}
                  </div>
                ))}

              </div>

            )}

            {sortedPharmacies.map((pharmacy) => (

              <div
                key={pharmacy.id}
                className={`pharmacy-card ${selected?.id === pharmacy.id ? "active" : ""}`}
                style={{
                  background: pharmaciesWithMedicine.includes(pharmacy.id)
                  ? "#e9fff1"
                  : "#f9f9f9"
                }}
                onClick={() => {

                  setSelected(pharmacy);

                  mapRef.current.panTo({
                    lat: Number(pharmacy.lat),
                    lng: Number(pharmacy.lng)
                  });

                }}
              >

                <div className="pharmacy-top">

                  <strong>{pharmacy.name}</strong>

                  <button
                    className="visit-btn"
                    onClick={(e)=>{
                      e.stopPropagation();
                      visitStore(pharmacy);
                    }}
                  >
                    Visit
                  </button>

                </div>

                <div className="pharmacy-details">

                  <span>⭐ {pharmacy.rating}</span>
                  <span>📍 {pharmacy.distance?.toFixed(2)} km</span>
                  <span>⏱ {pharmacy.deliveryTime} min</span>

                  <span className={
                    getOpenStatus(pharmacy)==="Open"
                    ? "badge-open"
                    : "badge-closed"
                  }>
                    {getOpenStatus(pharmacy)}
                  </span>

                </div>

                {nearest && pharmacy.id === nearest.id && (
                  <div className="nearest-badge">
                    ⭐ Nearest Pharmacy
                  </div>
                )}

                {pharmaciesWithMedicine.includes(pharmacy.id) && (
                  <div className="nearest-badge">
                    ✔ Medicine Available
                  </div>
                )}

                {cheapestPharmacy &&
                  cheapestPharmacy.pharmacy === pharmacy.name &&
                  (
                    <div className="cheapest-badge">
                      💰 Cheapest Medicine
                    </div>
                  )
                }

              </div>

            ))}

          </div>

        </div>

      )}

    </LoadScript>

  );
}

export default NearbyPharmacyMap;