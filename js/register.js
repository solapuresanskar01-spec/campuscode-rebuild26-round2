const registerForm = document.querySelector("#register-form");
const nameInput = document.querySelector("#register-name");
const emailInput = document.querySelector("#register-email");
const collegeInput = document.querySelector("#register-college");
const passwordInput = document.querySelector("#register-password");
const confirmInput = document.querySelector("#register-confirm");
const captchaInput = document.querySelector("#register-captcha-input");
const captchaDigits = document.querySelector("[data-captcha-digits]");
const captchaDisplay = document.querySelector("[data-captcha-display]");
const captchaRefresh = document.querySelector("[data-captcha-refresh]");
const termsInput = document.querySelector("#register-terms");
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
const formError = document.querySelector("[data-form-error]");
const formSuccess = document.querySelector("[data-form-success]");

let currentCaptcha = "";
let submitTimer;
let hasAttemptedSubmit = false;

const fieldErrorIds = {
  "register-name": "name-error",
  "register-email": "email-error",
  "register-college": "college-error",
  "register-password": "password-error",
  "register-confirm": "confirm-error",
  "register-captcha-input": "captcha-error"
};

const setFieldError = (input, message) => {
  const error = document.getElementById(fieldErrorIds[input.id]);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
};

const clearFeedback = () => {
  formError?.classList.remove("is-visible");
  formSuccess?.classList.remove("is-visible");
  if (formError) formError.textContent = "";
  if (formSuccess) formSuccess.textContent = "";
};

const getPasswordRules = () => ({
  length: (passwordInput?.value.length ?? 0) >= 8,
  uppercase: /[A-Z]/.test(passwordInput?.value ?? ""),
  lowercase: /[a-z]/.test(passwordInput?.value ?? ""),
  number: /\d/.test(passwordInput?.value ?? "")
});

const updatePasswordStrength = () => {
  const rules = getPasswordRules();
  document.querySelectorAll("[data-password-rule]").forEach((item) => {
    const rule = item.getAttribute("data-password-rule");
    item.classList.toggle("is-met", Boolean(rules[rule]));
    item.setAttribute("aria-checked", String(Boolean(rules[rule])));
  });
  return Object.values(rules).every(Boolean);
};

const validateName = () => {
  const value = nameInput?.value.trim() ?? "";
  if (!value) {
    setFieldError(nameInput, "Enter your full name.");
    return false;
  }
  if (value.length < 2 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(value)) {
    setFieldError(nameInput, "Enter a name using letters and common name punctuation.");
    return false;
  }
  setFieldError(nameInput, "");
  return true;
};

const validateEmail = () => {
  const value = emailInput?.value.trim() ?? "";
  if (!value) {
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

const validateCollege = () => {
  const value = collegeInput?.value.trim() ?? "";
  if (!value) {
    setFieldError(collegeInput, "Enter your college or institution.");
    return false;
  }
  if (value.length < 2) {
    setFieldError(collegeInput, "Enter at least two characters.");
    return false;
  }
  setFieldError(collegeInput, "");
  return true;
};

const validatePassword = () => {
  const valid = updatePasswordStrength();
  setFieldError(passwordInput, valid ? "" : "Meet all four password requirements.");
  return valid;
};

const validateConfirmation = () => {
  const value = confirmInput?.value ?? "";
  if (!value) {
    setFieldError(confirmInput, "Re-enter your password.");
    return false;
  }
  if (value !== (passwordInput?.value ?? "")) {
    setFieldError(confirmInput, "Passwords don't match.");
    return false;
  }
  setFieldError(confirmInput, "");
  return true;
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

const validateTerms = () => {
  const accepted = Boolean(termsInput?.checked);
  termsInput?.setAttribute("aria-invalid", String(!accepted));
  const error = document.querySelector("#terms-error");
  if (error) error.textContent = accepted ? "" : "Accept the Terms & Conditions and Privacy Policy to continue.";
  return accepted;
};

const updateSubmitAvailability = () => {
  if (!hasAttemptedSubmit || !submitButton || submitButton.classList.contains("is-loading")) return;
  const valid = validateName()
    && validateEmail()
    && validateCollege()
    && validatePassword()
    && validateConfirmation()
    && validateCaptcha()
    && validateTerms();
  submitButton.disabled = !valid;
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
    if (hasAttemptedSubmit) setFieldError(captchaInput, "Enter all five digits.");
    else setFieldError(captchaInput, "");
  }
  updateSubmitAvailability();
};

captchaRefresh?.addEventListener("click", () => {
  captchaDigits?.classList.add("is-refreshing");
  clearFeedback();
  window.setTimeout(generateCaptcha, 120);
});

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const target = toggle.getAttribute("data-password-toggle") === "confirm" ? confirmInput : passwordInput;
    if (!target) return;
    const showPassword = target.type === "password";
    target.type = showPassword ? "text" : "password";
    toggle.setAttribute("aria-pressed", String(showPassword));
    toggle.setAttribute("aria-label", `${showPassword ? "Hide" : "Show"}${target === confirmInput ? " confirm" : ""} password`);
  });
});

document.querySelectorAll("[data-icon]").forEach((icon) => {
  icon.addEventListener("error", () => {
    icon.hidden = true;
    const fallback = icon.parentElement?.querySelector(".register-input-icon-fallback, .register-terms__icon-fallback");
    if (fallback) fallback.style.display = "block";
  }, { once: true });
});

document.querySelectorAll("[data-password-icon]").forEach((icon) => {
  icon.addEventListener("error", () => {
    icon.hidden = true;
  }, { once: true });
});

emailInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validateEmail();
  else setFieldError(emailInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

nameInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validateName();
  else setFieldError(nameInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

collegeInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validateCollege();
  else setFieldError(collegeInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

passwordInput?.addEventListener("input", () => {
  updatePasswordStrength();
  if (hasAttemptedSubmit) {
    validatePassword();
    if (confirmInput?.value) validateConfirmation();
  } else {
    setFieldError(passwordInput, "");
    setFieldError(confirmInput, "");
  }
  clearFeedback();
  updateSubmitAvailability();
});

confirmInput?.addEventListener("input", () => {
  if (hasAttemptedSubmit) validateConfirmation();
  else setFieldError(confirmInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

captchaInput?.addEventListener("input", () => {
  captchaInput.value = captchaInput.value.replace(/\D/g, "").slice(0, 5);
  if (hasAttemptedSubmit) validateCaptcha();
  else setFieldError(captchaInput, "");
  clearFeedback();
  updateSubmitAvailability();
});

termsInput?.addEventListener("change", () => {
  if (hasAttemptedSubmit) validateTerms();
  clearFeedback();
  updateSubmitAvailability();
});

document.querySelectorAll("[data-policy-link]").forEach((link) => {
  link.addEventListener("click", () => {
    const policy = document.querySelector(link.getAttribute("href"));
    if (policy instanceof HTMLDetailsElement) policy.open = true;
  });
});

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!nameInput || !emailInput || !collegeInput || !passwordInput || !confirmInput || !captchaInput || !termsInput || !submitButton) return;

  hasAttemptedSubmit = true;
  clearFeedback();
  nameInput.value = nameInput.value.trim();
  emailInput.value = emailInput.value.trim();
  collegeInput.value = collegeInput.value.trim();

  const errors = [];
  if (!validateName()) errors.push(nameInput);
  if (!validateEmail()) errors.push(emailInput);
  if (!validateCollege()) errors.push(collegeInput);
  if (!validatePassword()) errors.push(passwordInput);
  if (!validateConfirmation()) errors.push(confirmInput);
  if (!validateCaptcha()) errors.push(captchaInput);
  if (!validateTerms()) errors.push(termsInput);

  if (errors.length > 0) {
    if (formError) {
      formError.textContent = "Review the highlighted fields to continue.";
      formError.classList.add("is-visible");
    }
    updateSubmitAvailability();
    errors[0].focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.setAttribute("aria-busy", "true");
  if (submitLabel) submitLabel.textContent = "SETTING UP YOUR PROFILE...";

  window.clearTimeout(submitTimer);
  submitTimer = window.setTimeout(() => {
    submitButton.classList.remove("is-loading");
    submitButton.removeAttribute("aria-busy");
    if (submitLabel) submitLabel.textContent = "CREATE MY ACCOUNT";
    if (formSuccess) {
      formSuccess.textContent = "Mock registration complete. No account was created and no personal information was sent.";
      formSuccess.classList.add("is-visible");
    }
    updateSubmitAvailability();
  }, 800);
});

generateCaptcha();