import React, { useState } from "react";
import { useUserPlaylists } from "./useUserPlaylists";
import { Playlist, Track } from "../../types/userSpotifyData";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import Error from "../Error/Error";
import "./UserPlaylists.scss";

const UserPlaylists: React.FC = () => {
    const { t } = useTranslation();
    const { playlists, moodTuneTracks, expandedPlaylist, togglePlaylist, loading, error, setError } = useUserPlaylists();
    const [iframeErrors, setIframeErrors] = useState<{ [key: string]: boolean }>({});

    return (
        <div className="user-playlists">
            {error && <Error message={error} onClose={() => setError(null)} />}

            {loading ? (
                <LoadingSpinner />
            ) : playlists.length === 0 ? (
                <p>{t("empty-data.playlists")}</p>
            ) : (
                <ul className="user-playlists__list">
                    {playlists.map((playlist: Playlist) => {
                        const isExpanded = expandedPlaylist === playlist.id;
                        const tracks = moodTuneTracks[playlist.id] || [];
                        const previewTracks = tracks.slice(0, 2);

                        return (
                            <li key={playlist.id} className={`user-playlists__item ${isExpanded ? "expanded" : ""}`}>
                                <div className="user-playlists__playlist">
                                    <div className="user-playlists__image">
                                        <img 
                                            src={playlist.images?.[0]?.url || "/default-playlist.png"} 
                                            alt={`Cover of ${playlist.name}`} 
                                            className="user-playlists__image-image"
                                        />
                                    </div>
                                    <div className="user-playlists__details">
                                        <h4 className="user-playlists__title">{playlist.name}</h4>
                                        <ul className="user-playlists__tracklist">
                                            {(isExpanded ? tracks : previewTracks).map((track: Track) => (
                                                <li key={track.id} className="user-playlists__track">
                                                    {!iframeErrors[track.id] && (
                                                        <div className="spotify-player-container">
                                                            <iframe
                                                                src={`https://open.spotify.com/embed/track/${track.external_urls?.spotify?.split("/track/")[1]?.split("?")[0]}`}
                                                                width="100%"
                                                                height="80"
                                                                frameBorder="0"
                                                                sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
                                                                allow="encrypted-media"
                                                                className="spotify-player"
                                                                onError={() => setIframeErrors(prev => ({ ...prev, [track.id]: true }))}
                                                            ></iframe>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>

                                        {tracks.length > 2 && (
                                            <div className="user-playlists__btn-container">
                                                <button className="user-playlists__toggle-btn" onClick={() => togglePlaylist(playlist.id)}>
                                                    {isExpanded ? (
                                                        <>
                                                            {t('common.view-less')}
                                                            <span className="icon icon-arrow-turn-up"></span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {t('common.view-more')}
                                                            <span className="icon icon-arrow-turn-down"></span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default UserPlaylists;
