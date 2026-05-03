document.addEventListener('DOMContentLoaded', () => {
    const cartCount = document.getElementById('cart-count');
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total-price');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    let cart = JSON.parse(localStorage.getItem('luxury_cart')) || [];

    function saveCart() {
        localStorage.setItem('luxury_cart', JSON.stringify(cart));
    }

    function updateCartUI() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        // Render items
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">$${item.price} x ${item.quantity}</span>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-remove" data-index="${index}">Remove</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }
        
        if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;

        // Attach remove listeners
        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart.splice(index, 1);
                saveCart();
                updateCartUI();
            });
        });
    }

    function toggleCart() {
        if (cartModal) cartModal.classList.toggle('open');
        if (cartOverlay) {
            if (cartModal.classList.contains('open')) {
                cartOverlay.classList.add('open');
            } else {
                cartOverlay.classList.remove('open');
            }
        }
    }

    // Add to cart events
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            
            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }
            
            saveCart();
            updateCartUI();
            
            // Show cart
            if (cartModal && !cartModal.classList.contains('open')) {
                toggleCart();
            }
        });
    });

    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    if (closeCart) closeCart.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    // Initial render
    updateCartUI();
});
