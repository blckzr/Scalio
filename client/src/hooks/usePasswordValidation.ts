import { useState, useEffect } from "react";

export const usePasswordValidation = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation States
  const [validations, setValidations] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    isMatching: false,
    minLength: false, // Good practice to add this too
  });

  useEffect(() => {
    setValidations({
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      minLength: password.length >= 8,
      isMatching: password.length > 0 && password === confirmPassword,
    });
  }, [password, confirmPassword]);

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validations,
    // Helper to check if everything is perfect
    isFormValid:
      validations.hasUppercase &&
      validations.hasLowercase &&
      validations.hasNumber &&
      validations.minLength &&
      validations.isMatching,
  };
};
