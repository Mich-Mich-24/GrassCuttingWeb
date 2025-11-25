const header = document.querySelector("header");
const bookingSection = document.getElementById("booking");
const bookingForm = document.getElementById("booking-form");
const statusEl = document.querySelector(".form-status");
const serviceSelect = bookingForm?.querySelector('select[name="service"]');
const dateInput = bookingForm?.querySelector('input[name="date"]');

window.addEventListener("scroll", () => {
    header.classList.toggle("sticky", window.scrollY > 80);
});

const menu = document.querySelector("#menu-icon");
const navlist = document.querySelector(".navlist");

menu?.addEventListener("click", () => {
    menu.classList.toggle("bx-bx-menu");
    navlist.classList.toggle("open");
});

window.addEventListener("scroll", () => {
    menu?.classList.remove("bx-bx-menu");
    navlist?.classList.remove("open");
});

const sr = ScrollReveal({
    origin: "top",
    distance: "85px",
    duration: 2500,
    reset: true,
});

sr.reveal(".home-text", { delay: 300 });
sr.reveal(".home-img", { delay: 400 });
sr.reveal(".container", { delay: 300 });
sr.reveal(".about-img", {});
sr.reveal(".about-text", { delay: 300 });
sr.reveal(".middle-text", {});
sr.reveal(".row-btn, .shop-content", { delay: 300 });
sr.reveal(".reviews, .booking, .contact", { delay: 300 });

const bookButtons = document.querySelectorAll(".book-trigger");
const smoothScrollToBooking = () => {
    bookingSection?.scrollIntoView({ behavior: "smooth", block: "start" });
};

bookButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const chosenService = button.dataset.service || "Custom Consultation";
        if (serviceSelect) {
            serviceSelect.value = chosenService;
            if (serviceSelect.value !== chosenService) {
                const customOption = document.createElement("option");
                customOption.value = chosenService;
                customOption.textContent = chosenService;
                serviceSelect.appendChild(customOption);
                serviceSelect.value = chosenService;
            }
        }
        smoothScrollToBooking();
    });
});

if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
}

const API_BASE_URL = window.location.hostname === "localhost" ? "http://localhost:4000" : "";

const showStatus = (message, type = "") => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove("success", "error");
    if (type) statusEl.classList.add(type);
};

bookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    showStatus("Submitting your booking...");

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Could not save booking");
        }

        const data = await response.json();
        showStatus(`Booked! Reference: ${data.reference}`, "success");
        bookingForm.reset();
    } catch (error) {
        showStatus(error.message || "Network error. Please try again.", "error");
    }
});
