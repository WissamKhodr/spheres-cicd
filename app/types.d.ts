
interface Pin {
    id: string;
    coords: maplibregl.LngLat;
    emoji: string;
    body: string;
    createdAt: number;
    likes: number;
    dislikes: number;
}

interface Sphere {
    id: number;
    title: string;
    color: string;
    inviteCode: string;
    creatorId: number;
}

interface User {
    id: string;
    name: string;
    joinedSpheres: Sphere[];
}
