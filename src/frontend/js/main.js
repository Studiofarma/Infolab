'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;
var username = null;
var password = null;

var colors = [
    '#2196F3',
    '#32c787',
    '#00BCD4',
    '#ff5652',
    '#ffc107',
    '#ff85af',
    '#FF9800',
    '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();
    password = document.querySelector('#password').value.trim();
    document.querySelector('#username-title').textContent = username;

    if(username && password) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        let basicAuth = btoa(username + ":" + password);
        $.ajax({
            url: "/csrf",
            headers: {
                "Authorization": "Basic " + basicAuth
            },
            dataType: "json",
            type: "Get",
            async: true,
            success: function(csrf){
                const socket = new SockJS('chat?access_token=' + basicAuth)
                stompClient = Stomp.over(socket);

                let headers = {};
                headers[csrf.headerName] = csrf.token;
                stompClient.connect(headers, onConnected, onError);
            }
        });
    }
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);
    stompClient.subscribe('/user/topic/me', onMessageReceived);
    stompClient.subscribe(`/queue/${username}`, onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.register",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = `Errore in connessione alla pagina: ${error}`;
    connectingElement.style.color = 'red';
}


function send(event) {
    const messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function sendToUser(event) {
    const messageContent = messageInput.value.trim();

    if(messageContent && stompClient) {
        const chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        const usernameTo = event.target.previousSibling.previousSibling.firstChild.textContent
        stompClient.send(`/app/chat.send.${usernameTo}`, {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    if(message.type === 'CHAT'){
        const replyElement = document.createElement('a');
        const replyText = document.createTextNode("reply");
        replyElement.appendChild(replyText);
        replyElement.style.cursor = 'pointer'
        replyElement.addEventListener('click', sendToUser, true)

        messageElement.appendChild(replyElement);
    }

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }

    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', send, true)