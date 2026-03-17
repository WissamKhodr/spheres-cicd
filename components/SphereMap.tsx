"use client";

import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRoot } from "react-dom/client";
import EmojiPicker from "emoji-picker-react";
import { createPin, getPins, votePin, deletePin, reportPin } from "@/actions/pin";

interface Pin {
    id: number;
    coords: [number, number];
    emoji: string;
    body: string;
    createdAt: number;
    creatorId: number;
    creatorName?: string;
    likes: number;
    dislikes: number;
    myVote: 1 | -1 | null;
}

let markers: maplibregl.Marker[] = [];

export default function SphereMap({ sphere }: { sphere: Sphere }) {
    const [pins, setPins] = useState<Pin[]>([]);
    const [showCreatePin, setShowCreatePin] = useState(false);
    const [clickCoords, setClickCoords] = useState<maplibregl.LngLat | null>(null);
    const [selectedEmoji, setSelectedEmoji] = useState("😀");
    const [pinText, setPinText] = useState("");
    const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const fetchPins = () => {
        getPins(sphere.id).then(result => {
            if ('error' in result) {
                alert(result.error);
                return;
            }
            const formattedPins = result.pins.map(pin => ({
                id: pin.id,
                coords: [pin.lng, pin.lat] as [number, number],
                emoji: pin.emoji,
                body: pin.body,
                createdAt: pin.createdAt,
                creatorId: pin.creatorId,
                creatorName: (pin as any).creatorName ?? null,
                likes: pin.likes,
                dislikes: pin.dislikes,
                myVote: pin.myVote as 1 | -1 | null,
            }));
            setCurrentUserId(result.currentUserId);
            setPins(formattedPins)
            deleteDrawnPins();
            formattedPins.forEach(pin => mapInstance && drawPin(mapInstance, pin, sphere, result.currentUserId, fetchPins))
        })
    }

    useEffect(() => {
        const map = new maplibregl.Map({
            container: "map",
            style: {
                name: "MapLibre",
                glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
                layers: [
                    {
                        id: "background",
                        type: "background",
                        paint: { "background-color": sphere.color },
                        layout: { visibility: "visible" },
                        maxzoom: 24,
                    },
                ],
                projection: {
                    type: "globe",
                },
                bearing: 0,
                sources: {},
                version: 8,
            },
            zoom: 1,
            maxZoom: 4,
            center: [0, 0],
        });


        map.on("load", () => {
            setMapInstance(map);
        })

        map.on("click", (e) => {
            if (
                e.originalEvent.target &&
                ((e.originalEvent.target as HTMLDivElement).classList.contains(
                    "spheres-marker"
                ) ||
                    (e.originalEvent.target as HTMLDivElement).classList.contains(
                        "spheres-marker-text"
                    ))
            ) {
                return;
            }

            setClickCoords(e.lngLat);
            setShowCreatePin(true);
        });


        return () => map.remove();
    }, [sphere.color]);

    useEffect(() => {
        fetchPins();
    }, [mapInstance])

    async function handleCreatePin() {
        if (!clickCoords || !mapInstance || pinText.trim() === "") return;

        await createPin({
            sphereId: sphere.id,
            lat: clickCoords.lat,
            lng: clickCoords.lng,
            emoji: selectedEmoji,
            body: pinText
        })

        fetchPins();

        setShowCreatePin(false);
        setPinText("");
        setSelectedEmoji("😀");
        setClickCoords(null);
    }

    return (
        <div>
            <span style={{ position: 'absolute', width: '100%', textAlign: 'center', marginTop: '20px', fontSize: '50px', textShadow: '2px 2px red', zIndex: '2000', pointerEvents: 'none' }}>{sphere.title}</span>

            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2000 }}>
                <button
                    onClick={() => setShowInviteCode(true)}
                    style={{
                        padding: '10px 20px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Visa Invite-kod
                </button>
            </div>

            {showInviteCode && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ color: 'black', marginBottom: '20px' }}>Invite-kod</h2>
                        <p style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#333',
                            background: '#f0f0f0',
                            padding: '15px 30px',
                            borderRadius: '8px',
                            letterSpacing: '3px'
                        }}>
                            {sphere.inviteCode}
                        </p>
                        <button
                            onClick={() => setShowInviteCode(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 30px',
                                background: '#2196F3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Stäng
                        </button>
                    </div>
                </div>
            )}

            {showCreatePin && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 3000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        minWidth: '350px'
                    }}>
                        <h2 style={{ color: 'black', marginBottom: '20px' }}>Skapa Pin</h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <span style={{ color: 'black' }}>Vald emoji:</span>
                            <span style={{ fontSize: '32px' }}>{selectedEmoji}</span>
                        </div>
                        <EmojiPicker onEmojiClick={(emojiData) => setSelectedEmoji(emojiData.emoji)} />

                        <p style={{ color: 'black', marginBottom: '10px' }}>Skriv text:</p>
                        <textarea
                            value={pinText}
                            onChange={(e) => setPinText(e.target.value)}
                            placeholder="Skriv något..."
                            style={{
                                width: '100%',
                                height: '100px',
                                padding: '10px',
                                fontSize: '16px',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                resize: 'none',
                                boxSizing: 'border-box'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button
                                onClick={handleCreatePin}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Skapa
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreatePin(false);
                                    setPinText("");
                                    setSelectedEmoji("😀");
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Avbryt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div id="map" style={{ width: "100vw", height: "100vh" }} />
            <style jsx>{`
                body {
                    margin: 0;
                    padding: 0;
                    background: black;
                }
            `}</style>
        </div>
    );
}

function deleteDrawnPins() {
    markers.forEach(m => m.remove());
    markers = [];
}

function drawPin(map: maplibregl.Map, pin: Pin, sphere: Sphere, currentUserId: number, onRefresh: () => void) {
    const popupContainer = document.createElement("div");
    const root = createRoot(popupContainer);

    function renderPopup(currentPin: Pin) {
        root.render(<PopupComponent
            pin={currentPin}
            isOwner={currentPin.creatorId === currentUserId}
            onLike={async () => {
                await votePin(sphere.id, pin.id, 1);
                if (currentPin.myVote === null || currentPin.myVote === -1) {
                    currentPin.likes = Number(currentPin.likes) + 1;
                    if (currentPin.myVote !== null) currentPin.dislikes = Number(currentPin.dislikes) - 1;
                }
                currentPin.myVote = 1;
                renderPopup(currentPin)
            }}
            onDislike={async () => {
                await votePin(sphere.id, pin.id, -1);
                if (currentPin.myVote === null || currentPin.myVote === 1) {
                    if (currentPin.myVote !== null) currentPin.likes = Number(currentPin.likes) - 1;
                    currentPin.dislikes = Number(currentPin.dislikes) + 1;
                }
                currentPin.myVote = -1;
                renderPopup(currentPin)
            }}
            onDelete={async () => {
                await deletePin(pin.id);
                onRefresh();
            }}
            onReport={async (reason: string) => {
                await reportPin(pin.id, reason);
                alert("Tack för din anmälan!");
            }}
        />);
    }

    renderPopup(pin);

    const newPopup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupContainer);

    const markerContainer = document.createElement("div");
    createRoot(markerContainer).render(<MarkerComponent label={pin.emoji} />);

    const marker = new maplibregl.Marker({ element: markerContainer })
        .setLngLat(pin.coords)
        .setPopup(newPopup)
        .addTo(map);

    markers.push(marker);
}

function MarkerComponent({ label }: { label: string }) {
    return (
        <div
            className="spheres-marker"
            style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b6b, #f0e130)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                cursor: "pointer"
            }}
        >
            <span
                className="spheres-marker-text"
                style={{
                    fontSize: "24px",
                }}
            >
                {label}
            </span>
        </div>
    );
}

function PopupComponent({ pin, isOwner, onLike, onDislike, onDelete, onReport }: { 
    pin: Pin, 
    isOwner: boolean,
    onLike: () => void, 
    onDislike: () => void,
    onDelete: () => void,
    onReport: (reason: string) => void
}) {
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState("");

    const date = new Date(pin.createdAt);
    const formattedTime = date.toLocaleString('sv-SE');

    const likeStyle = {
        padding: "8px 16px",
        background: pin.myVote === 1 ? "#2E7D32" : "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px"
    };

    const dislikeStyle = {
        padding: "8px 16px",
        background: pin.myVote === -1 ? "#B71C1C" : "#f44336",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px"
    };

    if (showReportForm) {
        return (
            <div style={{ color: "black", padding: "10px", minWidth: "200px" }}>
                <h3 style={{ margin: "0 0 10px 0" }}>Anmäl inlägg</h3>
                <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Varför anmäler du?"
                    style={{
                        width: "100%",
                        height: "80px",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        resize: "none",
                        boxSizing: "border-box"
                    }}
                />
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button
                        onClick={() => {
                            if (reportReason.trim()) {
                                onReport(reportReason);
                                setShowReportForm(false);
                                setReportReason("");
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: "8px",
                            background: "#ff9800",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        Skicka
                    </button>
                    <button
                        onClick={() => setShowReportForm(false)}
                        style={{
                            flex: 1,
                            padding: "8px",
                            background: "#999",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        Avbryt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ color: "black", padding: "10px", minWidth: "200px" }}>
            <div style={{ fontSize: "32px", textAlign: "center", marginBottom: "6px" }}>
                {pin.emoji}
            </div>
            {pin.creatorName && (
                <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#333", textAlign: "center" }}>
                    Skapad av: {pin.creatorName}
                </p>
            )}
            <p style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                {pin.body}
            </p>
            <p style={{ margin: "0 0 15px 0", fontSize: "12px", color: "#666" }}>
                {formattedTime}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={onLike} style={likeStyle}>
                    👍 {pin.likes}
                </button>
                <button onClick={onDislike} style={dislikeStyle}>
                    👎 {pin.dislikes}
                </button>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", justifyContent: "center" }}>
                {isOwner && (
                    <button
                        onClick={onDelete}
                        style={{
                            padding: "6px 12px",
                            background: "#d32f2f",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                    >
                        Ta bort
                    </button>
                )}
                <button
                    onClick={() => setShowReportForm(true)}
                    style={{
                        padding: "6px 12px",
                        background: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "12px"
                    }}
                >
                    Anmäl
                </button>
            </div>
        </div>
    );
}
