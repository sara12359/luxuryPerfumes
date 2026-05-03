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

window.filterCategory = function(category) {
    const cards = document.querySelectorAll('.product-card');
    const tabs = document.querySelectorAll('.tab-btn');
    const headers = document.querySelectorAll('.category-header');
    const grids = document.querySelectorAll('.grid');

    tabs.forEach(tab => {
        const tabText = tab.textContent.toLowerCase();
        if (category === 'all') {
            tab.classList.toggle('active', tabText.includes('all'));
        } else if (category === 'uni') {
            tab.classList.toggle('active', tabText.includes('private') || tabText.includes('uni'));
        } else {
            tab.classList.toggle('active', tabText.includes(category));
        }
    });

    if (category === 'all') {
        cards.forEach(card => card.style.display = 'block');
        headers.forEach(h => h.style.display = 'block');
        grids.forEach(g => g.style.display = 'grid');
    } else {
        cards.forEach(card => {
            const isMatch = card.getAttribute('data-category') === category;
            card.style.display = isMatch ? 'block' : 'none';
        });
        
        headers.forEach(h => {
            const isMatch = h.classList.contains(`${category}-header`);
            h.style.display = isMatch ? 'block' : 'none';
        });

        grids.forEach(g => {
            const isMatch = g.classList.contains(`${category}-grid`);
            g.style.display = isMatch ? 'grid' : 'none';
        });
    }
};

window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
});
