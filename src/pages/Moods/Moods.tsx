import { useEffect, useState } from "react";
import { RecommendedSong } from "../../types/userSpotifyData";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button/Button";
import { Artist } from "../../types/userSpotifyData";
import "./Moods.scss";

const Moods = () => {
  const { t } = useTranslation();
  const [playlist, setPlaylist] = useState<RecommendedSong[]>([]);
  const [showTranslation, setShowTranslation] = useState<{ [key: string]: boolean }>({});
  const [expandedSong, setExpandedSong] = useState<string | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [playlistName, setPlaylistName] = useState("My MoodList");
  const [likedSongs, setLikedSongs] = useState<{ [key: string]: boolean }>({});
  const [dislikedSongs, setDislikedSongs] = useState<{ [key: string]: boolean }>({});
  const [trackDetails, setTrackDetails] = useState<{ [key: string]: { title: string; artist: string } }>({});

  useEffect(() => {
    const savedPlaylist = localStorage.getItem("moodPlaylist");
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist) as RecommendedSong[]);
    }
  }, []);

  const getSpotifyId = (url: string): string => {
    const match = url.match(/track\/(\w+)/);
    return match ? match[1] : "";
  };

  const fetchTrackDetails = async (trackId: string) => {
    const accessToken = localStorage.getItem("access_token");
    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) {
        console.error(`Error fetching details for track ${trackId}`);
        return null;
      }
      const data = await response.json();
      return {
        title: data.name,
        artist: data.artists.map((artist: Artist) => artist.name).join(", "),
      };
    } catch (error) {
      console.error("Error fetching track details", error);
      return null;
    }
  };

  const toggleTranslation = (id: string) => {
    setShowTranslation((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = async (id: string) => {
    if (likedSongs[id]) {
      setLikedSongs((prev) => ({ ...prev, [id]: false }));
      setTrackDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[id];
        return newDetails;
      });
    } else {
      setLikedSongs((prev) => ({ ...prev, [id]: true }));
      setDislikedSongs((prev) => ({ ...prev, [id]: false }));
      const details = await fetchTrackDetails(id);
      if (details) {
        setTrackDetails((prev) => ({ ...prev, [id]: details }));
      }
    }
  };

  const toggleDislike = (id: string) => {
    if (dislikedSongs[id]) {
      setDislikedSongs((prev) => ({ ...prev, [id]: false }));
    } else {
      setDislikedSongs((prev) => ({ ...prev, [id]: true }));
      setLikedSongs((prev) => ({ ...prev, [id]: false }));
      setTrackDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[id];
        return newDetails;
      });
    }
  };

  const createSpotifyPlaylist = async () => {
    setCreatingPlaylist(true);
    setErrorMessage("");

    // Definir la lista de URIs: si hay canciones con like, se usan; sino se crean con todas.
    const likedSongsList = playlist.filter((song) => likedSongs[getSpotifyId(song.spotify_url)]);
    let trackUris: string[] = [];
    if (playlist.length === 0) {
      setErrorMessage("No hay canciones en la lista.");
      setCreatingPlaylist(false);
      return;
    } else if (likedSongsList.length > 0) {
      trackUris = likedSongsList.map((song) => `spotify:track:${getSpotifyId(song.spotify_url)}`);
    } else {
      trackUris = playlist.map((song) => `spotify:track:${getSpotifyId(song.spotify_url)}`);
    }

    try {
      const accessToken = localStorage.getItem("access_token");

      const userResponse = await fetch(`https://api.spotify.com/v1/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        setErrorMessage(`Error: ${errorData.error.message}`);
        return;
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: "Playlist generada por MoodTune",
          public: false,
        }),
      });

      if (!createPlaylistResponse.ok) {
        const errorData = await createPlaylistResponse.json();
        console.error("❌ Error al crear la playlist en Spotify", errorData);
        setErrorMessage(`Error: ${errorData.error.message}`);
        return;
      }

      const playlistData = await createPlaylistResponse.json();
      const playlistId = playlistData.id;

      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: trackUris }),
      });

      if (!addTracksResponse.ok) {
        const errorData = await addTracksResponse.json();
        setErrorMessage(`Error al añadir canciones: ${errorData.error.message}`);
        return;
      }

      console.log("🎶 Canciones añadidas con éxito.");
      window.open(playlistData.external_urls.spotify, "_blank");

    } catch (error) {
      console.error("❌ Error inesperado:", error);
      setErrorMessage("Error inesperado. Revisa la consola.");
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const likedSongsList = playlist.filter((song) => likedSongs[getSpotifyId(song.spotify_url)]);

  return (
    <div className="playlist__container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <ul className="playlist__list">
        {playlist.map((song, index) => {
          const songId = getSpotifyId(song.spotify_url);
          return (
            <li key={index} className="playlist__song">
              <div className="playlist__song--container">
                <div className="playlist__song--song">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${songId}?theme=0`}
                    width="100%"
                    height="80"
                    allow="encrypted-media"
                    className="spotify-player"
                  />
                </div>

                <div className="playlist__song--buttons">
                  <button className="playlist__song--button" onClick={() => toggleLike(songId)}>
                    <span className={likedSongs[songId] ? "icon icon-like-filled" : "icon icon-like"} />
                  </button>
                  <button className="playlist__song--button" onClick={() => toggleDislike(songId)}>
                    <span className={dislikedSongs[songId] ? "icon icon-dislike-filled" : "icon icon-dislike"} />
                  </button>
                </div>
              </div>

              {song.processed_lyrics && song.translated_lyrics && (
                <div className="playlist__song--lyrics">
                  <Button
                    variant="secondary"
                    text={expandedSong === songId ? t('mood-form.hide-lyrics') : t('mood-form.view-lyrics')}
                    onClick={() =>
                      setExpandedSong(expandedSong === songId ? null : songId)
                    }
                  />
                  {expandedSong === songId && (
                    <div className="playlist__song--lyrics--content">
                      <p className="lyrics">
                        {showTranslation[songId]
                          ? song.translated_lyrics
                            ? `${song.translated_lyrics.slice(0, 499)}...`
                            : "No translation available"
                          : song.processed_lyrics
                          ? `${song.processed_lyrics.slice(0, 499)}...`
                          : "No lyrics available"}
                      </p>
                      <button className="translate-button" onClick={() => toggleTranslation(songId)}>
                        {showTranslation[songId]
                          ? t('mood-form.view-original-lyrics')
                          : t('mood-form.translate-lyrics-to-spanish')}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="playlist__data">
        <h4 className="playlist__data--title">{t('mood-form.mood-list')}</h4>
        <div className="playlist__data--title-input">
          <label className="playlist__data--label">{t('mood-form.mood-list-tile')}</label>
          <input
            type="text"
            className="playlist__data--input"
            placeholder="Nombre de tu playlist"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </div>

        {likedSongsList.length > 0 && (
          <div className="playlist__data--added-songs">
            <h5 className="playlist__data--label">{t('mood-form.added-songs')}</h5>
            <ul className="playlist__data--added-list">
              {likedSongsList.map((song) => {
                const songId = getSpotifyId(song.spotify_url);
                const details = trackDetails[songId];
                return (
                  <li className="playlist__data--added-songs--song" key={songId}>
                    <span className="icon icon-play-otlined"></span>
                    {details
                      ? `${details.title} - ${details.artist}`
                      : `${song.song_name} - ${song.artist_name}`}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          text={t('mood-form.go-to-spotify')}
          iconPosition="right"
          onClick={createSpotifyPlaylist}
          disabled={creatingPlaylist}
        />
      </div>
    </div>
  );
};

export default Moods;
