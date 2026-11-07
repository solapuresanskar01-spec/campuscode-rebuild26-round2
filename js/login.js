const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#login-email");
const passwordInput = document.querySelector("#login-password");
const captchaInput = document.querySelector("#captcha-input");
const captchaDigits = document.querySelector("[data-captcha-digits]");
const captchaDisplay = document.querySelector("[data-captcha-display]");
const captchaRefresh = document.querySelector("[data-captcha-refresh]");
const passwordToggle = document.querySelector("[data-password-toggle]");
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
const formError = document.querySelector("[data-form-error]");
const formSuccess = document.querySelector("[data-form-success]");

let currentCaptcha = "";
let submitTimer;
let hasAttemptedSubmit = false;

const setFieldError = (input, message) => {
  const errorIds = {
    "login-email": "email-error",
    "login-password": "password-error",
    "captcha-input": "captcha-error"
  };
  const error = document.getElementById(errorIds[input.id]);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) {
    error.textContent = message;
  }
};

const clearFeedback = () => {
  formError?.classList.remove("is-visible");
  formSuccess?.classList.remove("is-visible");
  if (formError) formError.textContent = "";
  if (formSuccess) formSuccess.textContent = "";
};

const validateEmail = () => {
  const normalizedEmail = emailInput?.value.trim() ?? "";
  if (!normalizedEmail) {
    setFieldError(emailInput, "Enter your email address.");
    return false;
  }
  if (!emailInput.validity.valid) {
    setFieldError(emailInput, "Enter a valid email address.");
    return false;
  }
  setFieldError(emailInput, "");
  return true;
};

const validatePassword = () => {
  const isValid = Boolean(passwordInput?.value);
  setFieldError(passwordInput, isValid ? "" : "Enter your password.");
  return isValid;
};

const validateCaptcha = () => {
  if (!captchaInput || !/^\d{5}$/.test(captchaInput.value)) {
    setFieldError(captchaInput, "Enter all five digits.");
    return false;
  }
  if (captchaInput.value !== currentCaptcha) {
    setFieldError(captchaInput, "That code doesn't match. Check the digits and try again.");
    return false;
  }
  setFieldError(captchaInput, "");
  return true;
};

const updateSubmitAvailability = () => {
  if (!hasAttemptedSubmit || !submitButton || submitButton.classList.contains("is-loading")) return;
  submitButton.disabled = !(validateEmail() && validatePassword() && validateCaptcha());
};

const generateCaptcha = () => {
  let nextCaptcha = Math.floor(10000 + Math.random() * 90000);
  if (String(nextCaptcha) === currentCaptcha) {
    nextCaptcha = nextCaptcha === 99999 ? 10000 : nextCaptcha + 1;
  }
  currentCaptcha = String(nextCaptcha);
  if (captchaDigits) {
    captchaDigits.innerHTML = [...currentCaptcha].map((digit) => `<span>${digit}</span>`).join("");
    captchaDigits.classList.remove("is-refreshing");
  }
  captchaDisplay?.setAttribute("aria-label", `Generated five-digit demo security code: ${currentCaptcha}`);
  if (captchaInput) {
    captchaInput.value = "";
    if (hasAttemptedSubmit) {
      setFieldError(captchaInput, "Enter all five digits.");
    } else {
      setFieldError(captchaInput, "");
    }
  }
  updateSubmitAvailability();
};

captchaRefresh?.addEventListener("click", () => {
  captchaDigits?.classList.add("is-refreshing");
  clearFeedback();
  window.setTimeout(generateCaptcha, 120);
});

passwordToggle?.addEventListener("click", () => {
  if (!passwordInput) return;
  const showPassword = passwordInput.type === "password";
  passwordInput.type = showPassword ? "text" : "password";
  passwordToggle.setAttribute("aria-pressed", String(showPassword));
  passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
});

captchaInput?.addEventListener("input", () => {
  captchaInput.value = captchaInput.value.replace(/\D/g, "").slice(0, 5);
  if (hasAttemptedSubmit) validateCaptcha();
  else setFieldError(captchaInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

emailInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validateEmail();
  else setFieldError(emailInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

passwordInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validatePassword();
  else setFieldError(passwordInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!emailInput || !passwordInput || !captchaInput || !submitButton) return;

  hasAttemptedSubmit = true;
  clearFeedback();
  const errors = [];
  const normalizedEmail = emailInput.value.trim();

  if (normalizedEmail) emailInput.value = normalizedEmail;
  if (!validateEmail()) errors.push("email");
  if (!validatePassword()) errors.push("password");
  if (!validateCaptcha()) errors.push("captcha");

  if (errors.length > 0) {
    if (formError) {
      formError.textContent = "Check the highlighted fields before signing in.";
      formError.classList.add("is-visible");
    }
    updateSubmitAvailability();
    const firstInvalidInput = errors[0] === "captcha"
      ? captchaInput
      : document.querySelector(`#login-${errors[0]}`);
    firstInvalidInput?.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.setAttribute("aria-busy", "true");
  if (submitLabel) submitLabel.textContent = "CHECKING YOUR DETAILS...";

  window.clearTimeout(submitTimer);
  submitTimer = window.setTimeout(() => {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.removeAttribute("aria-busy");
    if (submitLabel) submitLabel.textContent = "SIGN IN TO CAMPUSCODE";
    if (formSuccess) {
      formSuccess.textContent = "Demo sign-in complete. Authentication isn't connected, and no account data was sent.";
      formSuccess.classList.add("is-visible");
    }
  }, 750);
});

generateCaptcha();