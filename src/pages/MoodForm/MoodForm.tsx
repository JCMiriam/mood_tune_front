import { useState } from "react";
import { GetMoodForm } from "../../components/GetMoodForm/GetMoodForm";
import { GetRecommendationForm } from "../../components/GetRecommendationForm/GetRecommendationForm";
import Button from "../../components/Button/Button";
import "./MoodForm.scss";

const MoodForm = () => {
  const [showMoodForm, setShowMoodForm] = useState(true);

  return (
    <div className="mood-form">
      <div className="mood-form__toggle">
        <Button 
          type="button" 
          variant={showMoodForm ? "primary" : "secondary"} 
          text="MyMood" 
          onClick={() => setShowMoodForm(true)}
        />
        <Button 
          type="button" 
          variant={!showMoodForm ? "primary" : "secondary"} 
          text="MyPreferences" 
          onClick={() => setShowMoodForm(false)}
        />
      </div>
      {showMoodForm ? <GetMoodForm /> : <GetRecommendationForm />}
    </div>
  );
};

export default MoodForm;