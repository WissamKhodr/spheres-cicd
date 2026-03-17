"use client";

import { useActionState, useEffect, useState } from "react";
import SphereMap from "@/components/SphereMap";
import { logout } from "@/lib/auth";
import { createSphere, getUserSpheres, joinSphere } from "@/actions/sphere";
import Link from "next/link";


export default function Home() {
  const [, action, pending] = useActionState(logout, null);
  const [userSpheres, setUserSpheres] = useState<Sphere[]>([]);
  const [selectedSphere, setSelectedSphere] = useState<Sphere | null>(null);
  const [showCreateSphere, setShowCreateSphere] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newSphereTitle, setNewSphereTitle] = useState("");
  const [newSphereColor, setNewSphereColor] = useState("#D862FF");
  const [joinCode, setJoinCode] = useState("");

  async function handleCreateSphere() {
    if (newSphereTitle.trim() === "") return;

    await createSphere({
      title: newSphereTitle,
      color: newSphereColor,
    });

    getSpheres();
    setShowCreateSphere(false);
    setNewSphereTitle("");
    setNewSphereColor("#D862FF");
  }

  const getSpheres = () => {
    getUserSpheres().then(spheres => {
      if ('error' in spheres) {
        alert(spheres.error);
        return;
      }
      setUserSpheres(spheres)
    })
  }

  useEffect(() => {
    getSpheres();
  }, [])

  async function handleJoinSphere() {
    await joinSphere(joinCode.toUpperCase());
    getSpheres();

    setShowJoinModal(false);
    setJoinCode("");
  }

  return (
    <div>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 2000,
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <Link
          href="/profile"
          style={{
            padding: '10px 20px',
            background: '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            textDecoration: 'none'
          }}
        >
          Profil
        </Link>

        <form action={action}>
          <button
            disabled={pending}
            type="submit"
            style={{
              padding: '10px 20px',
              background: '#EE875E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Logout
          </button>
        </form>

        <select
          value={selectedSphere?.id || ""}
          onChange={(e) => {
            const sphere = userSpheres.find(s => s.id === Number(e.target.value));
            setSelectedSphere(sphere || null);
          }}
          style={{
            padding: '10px 15px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #ddd',
            background: 'white',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="">Välj sphere...</option>
          {userSpheres.map(sphere => (
            <option key={sphere.id} value={sphere.id}>{sphere.title}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateSphere(true)}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Skapa Sphere
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
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
          Gå med (kod)
        </button>
      </div>

      {showCreateSphere && (
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
            <h2 style={{ color: 'black', marginBottom: '20px' }}>Skapa ny Sphere</h2>

            <p style={{ color: 'black', marginBottom: '5px' }}>Namn:</p>
            <input
              type="text"
              value={newSphereTitle}
              onChange={(e) => setNewSphereTitle(e.target.value)}
              placeholder="Ange namn..."
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            />

            <p style={{ color: 'black', marginBottom: '5px' }}>Färg:</p>
            <input
              type="color"
              value={newSphereColor}
              onChange={(e) => setNewSphereColor(e.target.value)}
              style={{
                width: '100%',
                height: '50px',
                border: 'none',
                borderRadius: '8px',
                marginBottom: '15px',
                cursor: 'pointer'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCreateSphere}
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
                  setShowCreateSphere(false);
                  setNewSphereTitle("");
                  setNewSphereColor("#D862FF");
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

      {showJoinModal && (
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
            minWidth: '300px'
          }}>
            <h2 style={{ color: 'black', marginBottom: '20px' }}>Gå med i Sphere</h2>
            <input
              type="text"
              placeholder="Ange invite-kod"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px',
                boxSizing: 'border-box',
                textTransform: 'uppercase'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleJoinSphere}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Gå med
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode("");
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSphere ? (
        <SphereMap sphere={selectedSphere} />
      ) : (
        <div style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
          color: 'white',
          fontSize: '24px'
        }}>
          Välj eller skapa en sphere för att börja
        </div>
      )}
    </div>
  );
}