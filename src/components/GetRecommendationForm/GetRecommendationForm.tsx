import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button/Button";
import GenreFilter from "../../components/GenreFilter/GenreFilter";
import ParametersSettings from "../../components/ParametersSettings/ParametersSettings";
import { useNavigate } from "react-router-dom";
import { API_URL, genreGroups } from "../../config";
import VerticalParametersSettings from "../../components/VerticalParametersSettings/VerticalParametersSettings";
import "./GetRecommendationForm.scss";

export const GetRecommendationForm = () => {
    const { t } = useTranslation();
    const [selectedGenres, setSelectedGenres] = useState<string[]>(["all genres"]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleGetSimilarSongs = async () => {
      setLoading(true);
      try {
        const preferences = JSON.parse(localStorage.getItem("moodtune_preferences") || "{}");
        const importances = JSON.parse(localStorage.getItem("moodtune_settings") || "{}");
  
        if (!Object.keys(preferences).length || !Object.keys(importances).length) {
          throw new Error("No hay preferencias o importancias guardadas.");
        }
  
        let additionalKeywords: string[] = [];
        if (!selectedGenres.includes("all genres")) {
          additionalKeywords = selectedGenres.flatMap(genre => genreGroups[genre] || []);
        }
  
        const response = await fetch(`${API_URL}/songs/recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences, importances, genres: additionalKeywords }),
        });
  
        if (!response.ok) throw new Error("Error al obtener recomendaciones");
  
        const recommendedSongs = await response.json();
        localStorage.setItem("moodPlaylist", JSON.stringify(recommendedSongs.recommended_tracks));
        localStorage.setItem("moodText", "Canciones Similares");
        navigate("/moods");
      } catch (error) {
        console.error("Error al obtener recomendaciones:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="mood-form">
        <GenreFilter selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
        <div className="mood-form__form-main">
          <ParametersSettings />
          <div className="mood-form__block-bottom">
            <VerticalParametersSettings />
          </div>
          <Button type="button" variant="secondary" text={loading ? "Cargando..." : t("mood-form.get-something-like")} onClick={handleGetSimilarSongs} />
        </div>
      </div>
    );
};