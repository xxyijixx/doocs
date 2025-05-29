const CONVERSATION_UUID_KEY = 'conversation_uuid';
let conversationUuid = localStorage.getItem(CONVERSATION_UUID_KEY);
let API_BASE_URL = '';
let socket = null; // WebSocket连接

async function createNewConversation() {
    try {
        const source = "widget"
        const response = await fetch(API_BASE_URL + '/api/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ source })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.uuid) {
            localStorage.setItem(CONVERSATION_UUID_KEY, data.data.uuid);
            return data.data.uuid;
        } else {
            console.error('Failed to create conversation:', data.msg);
            return null;
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
    }
}

async function getMessages(uuid) {
    try {
        // 后端现在默认返回最新的消息，不再需要分页参数
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/${uuid}/messages`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200 && data.data && data.data.items) {
            return data.data.items;
        } else {
            console.error('Failed to get messages:', data.msg);
            return [];
        }
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
}

async function sendMessage(uuid, content) {
    try {
        const sender = "customer";
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uuid, content, sender })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.code === 200 && data.data) {
            return data.data;
        } else {
            console.error('Failed to send message:', data.msg);
            return null;
        }
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
}

async function initializeChatWidget(options) {
    if (options && options.baseUrl) {
        API_BASE_URL = options.baseUrl;
    }

    if (!conversationUuid) {
        console.log('No conversation UUID found, creating a new one...');
        conversationUuid = await createNewConversation();
        if (!conversationUuid) {
            console.error('Could not initialize chat widget: Failed to create conversation.');
            return;
        }
    }
    console.log('Conversation UUID:', conversationUuid);
    
    // 初始化WebSocket连接
    initWebSocket();

    // Here you would typically render your chat widget UI
    // For now, let's just add a simple indicator
    // Check if the chat container already exists to prevent multiple creations
    let chatContainer = document.getElementById('chat-widget-container');
    if (!chatContainer) {
        chatContainer = document.createElement('div');
        chatContainer.id = 'chat-widget-container';
        chatContainer.style.position = 'fixed';
        chatContainer.style.bottom = '20px';
        chatContainer.style.right = '20px';
        chatContainer.style.width = '320px';
        chatContainer.style.height = '450px';
        chatContainer.style.backgroundColor = '#ffffff';
        chatContainer.style.border = 'none';
        chatContainer.style.borderRadius = '12px';
        chatContainer.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        chatContainer.style.zIndex = '1000';
        chatContainer.style.display = 'flex';
        chatContainer.style.flexDirection = 'column';
        chatContainer.style.overflow = 'hidden';
        chatContainer.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(chatContainer);

        // Add a button to toggle chat visibility
        const toggleButton = document.createElement('button');
        toggleButton.innerText = '💬';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '30px';
        toggleButton.style.right = '30px';
        toggleButton.style.width = '60px';
        toggleButton.style.height = '60px';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.backgroundColor = '#007bff';
        toggleButton.style.color = 'white';
        toggleButton.style.fontSize = '24px';
        toggleButton.style.border = 'none';
        toggleButton.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '1001';
        toggleButton.onclick = () => {
            chatContainer.style.display = 'flex';
            toggleButton.style.display = 'none';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };
        document.body.appendChild(toggleButton);

        // Initially hide the chat window
        chatContainer.style.display = 'none';
        toggleButton.innerText = 'Open Chat';
    }

    chatContainer.innerHTML = `
        <div style="padding: 15px; background-color: #007bff; color: white; border-bottom: 1px solid #0056b3; font-weight: bold; text-align: center; font-size: 16px; position: relative;">
            Support Chat
            <button id="close-button" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; color: white; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <div id="messages-container" style="flex-grow: 1; padding: 15px; overflow-y: auto; background-color: #f8f9fa;"></div>
        <div style="padding: 15px; border-top: 1px solid #e9ecef; display: flex; align-items: center; background-color: #f0f2f5;">
            <input type="text" id="message-input" style="flex-grow: 1; padding: 10px; border: 1px solid #ced4da; border-radius: 20px; font-size: 14px; outline: none;" placeholder="Type your message...">
            <button id="send-button" style="margin-left: 10px; padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; transition: background-color 0.2s;">Send</button>
        </div>
    `;

    const messagesContainer = chatContainer.querySelector('#messages-container');
    const messageInput = chatContainer.querySelector('#message-input');
    const sendButton = chatContainer.querySelector('#send-button');
    const closeButton = chatContainer.querySelector('#close-button');

    closeButton.onclick = () => {
        chatContainer.style.display = 'none';
        toggleButton.style.display = 'block';
    };

    function addMessageToChat(message) {
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '10px';
        messageElement.style.display = 'flex';
        messageElement.style.justifyContent = message.sender === 'customer' ? 'flex-end' : 'flex-start';
        messageElement.innerHTML = `
            <div style="background-color: ${message.sender === 'customer' ? '#dcf8c6' : '#e9ecef'}; color: ${message.sender === 'customer' ? '#333' : '#333'}; padding: 10px 15px; border-radius: 18px; max-width: 75%; word-wrap: break-word; box-shadow: 0 1px 1px rgba(0,0,0,0.05);">
                ${message.content}
            </div>
        `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendButton.onclick = async () => {
        const content = messageInput.value.trim();
        if (content && conversationUuid) {
            // Display user's message immediately
            addMessageToChat({ content: content, sender: 'customer' });
            messageInput.value = '';
            const sentMessage = await sendMessage(conversationUuid, content);
            // if (sentMessage && sentMessage.content) {
            //     // Display agent's response
            //     addMessageToChat({ content: sentMessage.content, sender: 'agent' });
            // }
        }
    };

    messageInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    };

    // Load existing messages
    if (conversationUuid) {
        const messages = await getMessages(conversationUuid);
        messages.forEach(msg => {
            addMessageToChat(msg);
        });
        // 确保加载消息后滚动到最底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 初始化WebSocket连接
    function initWebSocket() {
        // 如果已经有连接，先关闭
        if (socket) {
            socket.close();
        }

        // 创建WebSocket连接
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/api/v1/chat/ws?conv_uuid=${conversationUuid}&client_type=customer`;
        
        try {
            socket = new WebSocket(wsUrl);
            
            // 连接打开时
            socket.onopen = () => {
                console.log('WebSocket连接已建立');
            };
            
            // 接收消息
            socket.onmessage = (event) => {
                try {
                    const fullMessage = JSON.parse(event.data);
                    // 只处理消息类型的数据
                    if (fullMessage.type === 'message') {
                        const messageData = JSON.parse(fullMessage.data);
                        // 如果是客服发送的消息，显示在聊天窗口中
                        if (fullMessage.sender === 'agent') {
                            addMessageToChat({ content: messageData.content, sender: 'agent' });
                        }
                    }
                } catch (e) {
                    console.error('解析WebSocket消息失败:', e);
                }
            };
            
            // 连接关闭
            socket.onclose = () => {
                console.log('WebSocket连接已关闭');
                // 可以在这里添加重连逻辑
                setTimeout(() => {
                    if (conversationUuid) {
                        initWebSocket();
                    }
                }, 5000); // 5秒后尝试重连
            };
            
            // 连接错误
            socket.onerror = (error) => {
                console.error('WebSocket错误:', error);
            };
            
        } catch (error) {
            console.error('创建WebSocket连接失败:', error);
        }
    }

    // Expose functions globally for external access
    window.SupportChatWidget = {
        init: initializeChatWidget,
        getMessages: getMessages,
        sendMessage: sendMessage
    };
}

// If the script is loaded asynchronously, initialize it when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Always initialize the chat widget when DOM is ready
    initializeChatWidget({ baseUrl: 'http://localhost:8888' });

});