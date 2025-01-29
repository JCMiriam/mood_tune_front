import React from "react";
import { useUserData } from "./hooks/useUserData";
import { Playlist, Track, Artist, SavedTrack } from "./types";

const Profile: React.FC = () => {
    const { playlists, topTracks, topArtists, favoriteTracks, loading } = useUserData();

    if (loading) return <div>Cargando datos...</div>;

    return (
        <div>
            <h1>Welcome to MoodTune 🎵</h1>

            <h2>🎶 Your Playlists</h2>
            <ul>
                {playlists.map((playlist: Playlist) => (
                    <li key={playlist.id}>{playlist.name}</li>
                ))}
            </ul>

            <h2>🔥 Your Most Listened Songs</h2>
            <ul>
                {topTracks.map((track: Track) => (
                    <li key={track.id}>
                        {track.name} - {track.artists?.map((artist) => artist.name).join(", ") || "Unknown artist"}
                    </li>
                ))}
            </ul>

            <h2>🎤 Your Favorite Artists</h2>
            <ul>
                {topArtists.map((artist: Artist) => (
                    <li key={artist.id}>{artist.name}</li>
                ))}
            </ul>

            <h2>💖 Your Saved Songs</h2>
            <ul>
                {favoriteTracks.map((savedTrack: SavedTrack) => (
                    <li key={savedTrack.track.id}>
                        <img
                            src={savedTrack.track.album.images[0]?.url}
                            alt={savedTrack.track.name}
                            style={{ width: "50px", height: "50px", borderRadius: "5px" }}
                        />
                        <strong>{savedTrack.track.name}</strong> -{" "}
                        {savedTrack.track.artists.map((artist) => artist.name).join(", ") || "Unknown artist"} 
                        ({savedTrack.track.album.name})
                        <br />
                        <small>📅 Saved on: {new Date(savedTrack.added_at).toLocaleDateString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Profile;
