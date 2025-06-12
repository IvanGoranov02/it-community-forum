export const handleAuthError = (
  error: any,
  captchaRef: any,
  setCaptchaToken: (token: string) => void,
  setErrorMessage: (msg: string) => void,
  stopLoading: () => void
) => {
  setErrorMessage(error.message || "An error occurred")
  stopLoading()
  if (captchaRef.current) captchaRef.current.reset()
  setCaptchaToken("")
} 