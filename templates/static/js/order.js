const pricing = {
    essay: { base: 5, perPage: 15 },
    exam: { flat: 50 },
    test: { flat: 35 },
    quiz: { flat: 25 },
    powerpoint: { base: 50, perSlide: 5 },
    project: { base: 100, perPage: 20 }
};

function calculatePrice() {
    const service = document.getElementById('service').value;
    const pages = parseInt(document.getElementById('pages').value) || 0;
    const slides = parseInt(document.getElementById('slides')?.value) || 0; // Fixed slides reference
    const deadline = new Date(document.getElementById('deadline').value);
    const now = new Date();

    const servicePricing = pricing[service];

    if (!servicePricing) {
        console.error(`No pricing for: ${service}`);
        document.getElementById('price-amount').textContent = "$0.00";
        return 0;
    }

    let price = 0;

    // Handle flat pricing
    if (typeof servicePricing.flat !== 'undefined') {
        price = servicePricing.flat;
    }
    // Handle base + variable pricing
    else if (servicePricing.base) {
        price = servicePricing.base;
        if (servicePricing.perPage) price += servicePricing.perPage * pages;
        if (servicePricing.perSlide) price += servicePricing.perSlide * slides;
    }

    // Urgency premium
    if (deadline && !isNaN(deadline)) {
        const hoursLeft = (deadline - now) / 3_600_000; // hours
        if (hoursLeft < 48) price *= 1.5;
    }

    const displayPrice = price.toFixed(2);
    document.getElementById('price-amount').textContent = `$${displayPrice}`;
    return price;
}

// Initialize form
document.addEventListener('DOMContentLoaded', function () {
    // Show/hide slides field
    document.getElementById('service').addEventListener('change', function () {
        const showSlides = this.value === 'powerpoint';
        document.getElementById('slides-field').style.display = showSlides ? 'block' : 'none';
    });

    // Set initial minimum deadline
    const deadlineField = document.getElementById('deadline');
    const minDate = new Date(Date.now() + 86400000); // 24h from now
    deadlineField.min = minDate.toISOString().slice(0, 16);

    // Update price on any change
    ['service', 'pages', 'slides', 'deadline'].forEach(id => {
        document.getElementById(id).addEventListener('change', calculatePrice);
    });

    // Initial calculation
    calculatePrice();

    // Form submission
    document.getElementById('order-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const orderMethod = document.getElementById('order-method').value;

        if (!orderMethod) {
            alert('Please select an order method');
            return;
        }
        // Add your logic to handle different order methods
        alert(`You've selected to order via: ${orderMethod.toUpperCase()}`);

        const finalPrice = calculatePrice();

        if (finalPrice <= 0) {
            alert('Please complete the order form correctly');
            return;
        }

        // ... rest of your submission code ...
        // Collect form data
        const formData = {
            service: document.getElementById('service').value,
            subject: document.getElementById('subject').value,
            pages: document.getElementById('pages').value,
            slides: document.getElementById('slides').value || 'N/A',
            deadline: document.getElementById('deadline').value,
            email: document.getElementById('email').value,
            instructions: document.getElementById('instructions').value,
            method: document.getElementById('order-method').value
        };

        // Validate required fields
        if (!formData.method || !formData.email || !formData.deadline) {
            alert('Please fill all required fields');
            return;
        }

        // Create message template
        const message = `New Order Request:
                            Service: ${formData.service}
                            Subject: ${formData.subject}
                            Pages: ${formData.pages}
                            Slides: ${formData.slides}
                            Deadline: ${new Date(formData.deadline).toLocaleString()}
                            Client Email: ${formData.email}
                            Instructions: ${formData.instructions}`;

        // Handle different order methods
        switch (formData.method) {
            case 'whatsapp':
                window.open(`https://wa.me/+15708136189?text=${encodeURIComponent(message)}`, '_blank');
                break;

            case 'instagram':
                window.open('https://ig.me/m/avrilwriters', '_blank');
                break;

            case 'email':
                window.location.href = `mailto:wanyamak884@gmail.com?subject=New Order - ${formData.service}&body=${encodeURIComponent(message)}`;
                break;

            case 'snapchat':
                window.open('https://www.snapchat.com/add/avrilthewriter', '_blank');
                break;

            case 'facebook':
                window.open('https://www.facebook.com/avrilthewriter/', '_blank');
                break;

            case 'imessage':
                const imessageEmail = 'wanyamak884@icloud.com'; // REPLACE WITH YOUR iCLOUD EMAIL
                window.open(
                    `imessage:?address=${encodeURIComponent(imessageEmail)}&body=${encodeURIComponent(message)}`,
                    '_blank'
                );
                break;

            default:
                alert('Invalid order method selected');
                return;
        }

        // Reset form and show confirmation
        this.reset();
        document.getElementById('price-amount').textContent = '$0';

        // Show success message
        const confirmation = document.createElement('div');
        confirmation.className = 'form-confirmation';
        confirmation.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <p>Your order request has been initiated! Please complete the conversation on the selected platform.</p>
    `;
        this.parentNode.insertBefore(confirmation, this.nextSibling);

        setTimeout(() => confirmation.remove(), 5000);
    });

});
document.addEventListener('DOMContentLoaded', function () {
    const serviceSelect = document.getElementById('service');
    const pagesField = document.getElementById('pages');
    const slidesField = document.getElementById('slides-field');

    serviceSelect.addEventListener('change', function () {
        const isPowerpoint = this.value === 'powerpoint';

        // Toggle pages field
        pagesField.disabled = isPowerpoint;
        pagesField.required = !isPowerpoint;

        // Toggle slides field
        slidesField.style.display = isPowerpoint ? 'block' : 'none';
        document.getElementById('slides').required = isPowerpoint;
    });

    // Initialize state on page load
    const initializeIsPowerpoint = serviceSelect.value === 'powerpoint';
    pagesField.disabled = initializeIsPowerpoint;
    pagesField.required = !initializeIsPowerpoint;
    document.getElementById('slides').required = initializeIsPowerpoint;
});

