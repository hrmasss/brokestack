const STORAGE_KEY = "brokestack-marketing-signed-in";
const AUTH_EVENT = "brokestack:marketing-auth-changed";

export function isMarketingUserSignedIn() {
	if (typeof window === "undefined") {
		return false;
	}

	return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setMarketingUserSignedIn(signedIn: boolean) {
	if (typeof window === "undefined") {
		return;
	}

	if (signedIn) {
		localStorage.setItem(STORAGE_KEY, "true");
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}

	window.dispatchEvent(new Event(AUTH_EVENT));
}

export function subscribeToMarketingAuth(onChange: () => void) {
	if (typeof window === "undefined") {
		return () => undefined;
	}

	const handleChange = () => onChange();

	window.addEventListener("storage", handleChange);
	window.addEventListener(AUTH_EVENT, handleChange);

	return () => {
		window.removeEventListener("storage", handleChange);
		window.removeEventListener(AUTH_EVENT, handleChange);
	};
}
