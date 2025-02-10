import { useState, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button/Button";
import { Textarea } from "../../components/Textarea/Textarea";
import GenreFilter from "../../components/GenreFilter/GenreFilter";
import ParametersSettings from "../../components/ParametersSettings/ParametersSettings";
import { useNavigate } from "react-router-dom";
import { API_URL, reducedGenreGroups, genreGroups } from "../../config";
import VerticalParametersSettings from "../../components/VerticalParametersSettings/VerticalParametersSettings";
import "./MoodForm.scss";

const MoodForm = () => {
  const { t } = useTranslation();
  const [moodText, setMoodText] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["all genres"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 🔹 Para redirigir a /moods

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (moodText.trim() === "") return;
  
    setLoading(true);
    try {
      // Si el usuario seleccionó algún género distinto de "all genres", obtenemos las palabras clave.
      let additionalKeywords: string[] = [];
      if (!selectedGenres.includes("all genres")) {
        additionalKeywords = selectedGenres.flatMap(genre => reducedGenreGroups[genre] || []);
      }
  
      // Concatenamos las palabras clave al texto del usuario
      const finalMoodText = additionalKeywords.length > 0 
        ? `${moodText} ${additionalKeywords.join(" ")}`
        : moodText;
  
      const response = await fetch(`${API_URL}/songs/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodText: finalMoodText }),
      });
  
      if (!response.ok) throw new Error("Error al obtener la playlist");
  
      const recommendedSongs = await response.json();
      localStorage.setItem("moodPlaylist", JSON.stringify(recommendedSongs));
      localStorage.setItem("moodText", moodText);
  
      navigate("/moods");
  
    } catch (error) {
      console.error("Error al obtener las recomendaciones:", error);
    } finally {
      setLoading(false);
    }
  };  

  const handleGetSimilarSongs = async () => {
    setLoading(true);
    try {
      // Obtener preferencias e importancias desde localStorage
      const preferences = JSON.parse(localStorage.getItem("moodtune_preferences") || "{}");
      const importances = JSON.parse(localStorage.getItem("moodtune_settings") || "{}");
  
      if (!Object.keys(preferences).length || !Object.keys(importances).length) {
        throw new Error("No hay preferencias o importancias guardadas.");
      }
  
      // Obtener palabras clave de los géneros seleccionados usando `genreGroups`
      let additionalKeywords: string[] = [];
      if (!selectedGenres.includes("all genres")) {
        additionalKeywords = selectedGenres.flatMap(genre => genreGroups[genre] || []);
      }
  
      const response = await fetch(`${API_URL}/songs/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          importances,
          genres: additionalKeywords,
        }),
      });
  
      if (!response.ok) throw new Error("Error al obtener recomendaciones");
  
      const recommendedSongs = await response.json();
  
      // Guardar las canciones recomendadas en localStorage
      localStorage.setItem("moodPlaylist", JSON.stringify(recommendedSongs.recommended_tracks));
      localStorage.setItem("moodText", "Canciones Similares"); // Un nombre genérico para la playlist
  
      // Redirigir a la página de moods
      navigate("/moods");
  
    } catch (error) {
      console.error("Error al obtener recomendaciones:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <div className="mood-form">
      <form className="mood-form__form-body" onSubmit={handleSubmit}>
        <GenreFilter selectedGenres={selectedGenres} setSelectedGenres={setSelectedGenres} />
        <div className="mood-form__form-main">
          <ParametersSettings />
          <div className="mood-form__form-form">
            <h4 className="mood-form__form-title">{t("mood-form.title")}</h4>
            <Textarea
              id="moodText"
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              placeholder={t("mood-form.textarea-placeholder")}
              className="mood-form__form-textarea"
            />

            <div className="mood-form__form-buttons">
              <Button type="submit" variant="primary" text={loading ? "Cargando..." : t("mood-form.get-playlist-mood")} />
              <span className="mood-form__form-divisor">{t("mood-form.or")}</span>
              <Button type="button" variant="secondary" text={t("mood-form.get-something-like")} onClick={handleGetSimilarSongs} />
            </div>

            <div className="mood-form__block-bottom">
              <VerticalParametersSettings />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MoodForm;
