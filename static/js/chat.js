document.addEventListener('DOMContentLoaded', () => {
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input-field');
    const chatSendBtn = document.getElementById('chat-send-btn');

    function toggleChat() {
        if (!chatWindow) return;
        if (chatWindow.classList.contains('open')) {
            chatWindow.classList.remove('open');
        } else {
            chatWindow.classList.add('open');
            chatInput.focus();
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;
        msgDiv.textContent = text;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        chatInput.value = '';

        // Simulate typing
        const typingMsg = document.createElement('div');
        typingMsg.className = 'chat-message bot typing';
        typingMsg.innerHTML = '<i>Typing...</i>';
        chatBody.appendChild(typingMsg);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            // Remove typing indicator
            chatBody.removeChild(typingMsg);
            
            // Add bot response
            addMessage(data.reply, 'bot');
        } catch (error) {
            chatBody.removeChild(typingMsg);
            addMessage('My apologies, Guest. The Atelier connection was interrupted.', 'bot');
        }
    }

    if (chatBubble) chatBubble.addEventListener('click', toggleChat);
    if (closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);
    
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});
