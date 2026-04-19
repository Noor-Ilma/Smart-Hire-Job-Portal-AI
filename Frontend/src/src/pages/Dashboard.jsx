const handleUpload = async () => {
  try {
    if (!file) {
      alert("Upload resume");
      return;
    }

    // ✅ STEP 1: Upload resume
    const res = await uploadResume(file);
    console.log("Resume response:", res);

    // ✅ SHOW SKILLS
    setSkills(res.extracted_skills || []);

    // ✅ IMPORTANT FIX: USE MATCHES FROM RESUME API
    if (res.matches && res.matches.length > 0) {
      setMatches(res.matches);
    } else {
      console.warn("No matches received from backend");
      setMatches([]);
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};