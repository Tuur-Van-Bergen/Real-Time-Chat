let stompClient;
let User = '';
let chat = 'public';
let sessionId;
let UserData = sessionId + " " + User;
let connection;

connect();

function addUser() {
    const username = document.getElementById("input-username").value;
    User = username;
    if (sessionId !== "") {
        UserData = sessionId + " " + User;
    }
    if (username.trim() !== '') {
        fetch('/api/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: UserData
        })
            .then(response => {
                if (response.ok) {
                    document.getElementById("input-username").style.display = "none";
                    document.getElementById("send-username-btn").style.display = "none";
                    const chosenChat = document.createElement("div");
                    chosenChat.id = "chat-with";
                    chosenChat.innerHTML = "Public chat";
                    document.body.appendChild(chosenChat);
                    const users = document.createElement("div");
                    users.id = "users";
                    document.body.appendChild(users);
                    const messages = document.createElement("div");
                    messages.id = "messages";
                    document.body.appendChild(messages);
                    const messageInput = document.createElement('input');
                    messageInput.type = "text";
                    messageInput.id = "input-msg";
                    messageInput.placeholder = "Type a message";
                    document.body.appendChild(messageInput);
                    const messageButton = document.createElement('button');
                    messageButton.id = "send-msg-btn";
                    messageButton.onclick = function() {SendMessage()};
                    messageButton.innerHTML = "Send message";
                    document.body.appendChild(messageButton);
                    const publicChatButton = document.createElement('button');
                    publicChatButton.id = "public-chat-btn";
                    publicChatButton.onclick = function () {changeChat('public')};
                    publicChatButton.innerHTML = 'Public chat';
                    document.body.appendChild(publicChatButton);
                    loadUsers();
                    loadMessages();
                    console.log(User + ' added successfully');
                } else {
                    console.error('Failed to add user');
                }
            })
            .catch(error => {
                console.error('Error adding user:', error);
            });
    }
}

function connect() {
    let socket = new SockJS('/chat');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function() {
        connection = stompClient.subscribe('/topic/connect', function(message) {
            console.log('Received message from server:', message.body);
            sessionId = message.body;
            console.log(sessionId);
            connection.unsubscribe();
        });
        connectToChat();
    });
}

function connectToChat() {
    stompClient.subscribe(`/topic/newMessage`, function (messageData) {
        const message = JSON.parse(messageData.body);
        const userList = document.getElementById('users');
        let userElement = document.getElementById(message.fromUser);
        if (chat === "public" && message.toUser === "public" || message.fromUser === chat && message.toUser === User|| message.fromUser === User && message.toUser === chat) {
            showMessage(message);
            if (message.toUser !== "public") {
                if (message.fromUser === User) {
                    userElement = document.getElementById(message.toUser);
                }
                userList.removeChild(userElement);
                userList.insertBefore(userElement, userList.firstChild);
            }
        } else if (message.toUser === User) {
            userElement.querySelector(".new-message-counter").innerHTML = String(parseInt(userElement.children[1].innerHTML) + 1);
            userElement.querySelector(".new-message-counter").style.display = "block";
            userList.removeChild(userElement);
            userList.insertBefore(userElement, userList.firstChild);
        }
    });
    stompClient.subscribe("/topic/userConnected", function (username) {
        if (username.body !== User) {
            showUser(username.body);
        }
    });
    stompClient.subscribe("/topic/userDisconnected", function (username) {
        const user = document.getElementById(username.body);
        user.parentNode.removeChild(user);
    });
}

function inputIsEmpty() {
    const message = document.getElementById("input-msg").value;
    return message === '';
}

function SendMessage() {
    if (!inputIsEmpty()) {
        const message = document.getElementById("input-msg");
        console.log("message: " + message.value);
        stompClient.send("/app/chat", {}, JSON.stringify({"fromUser": User, "toUser": chat ,"message": message.value, "date": new Date().toISOString()}));
        message.value = "";
    }
}

function showMessage(message) {
    const messages = document.getElementById("messages");
    const new_message = document.createElement('div');
    new_message.className = "message-container";
    const sender = document.createElement('div');
    sender.innerHTML = message.fromUser;
    sender.className = "sender";
    new_message.appendChild(sender);
    const date = document.createElement('div');
    date.innerHTML = message.date;
    date.className = "date";
    new_message.appendChild(date);
    const content = document.createElement('div');
    content.innerHTML = message.message;
    content.className = "message";
    new_message.appendChild(content);
    messages.appendChild(new_message);
    messages.scrollTop = messages.scrollHeight;
}

function showUser(username) {
    const usersContainer = document.getElementById('users');
    const userContainer = document.createElement('div');
    userContainer.className = "user-container";
    userContainer.id = username;
    userContainer.onclick = function() {
        const child = userContainer.children[0];
        let newChat;
        if (child.innerHTML === "Public chat") {
            newChat = "public";
        } else {
            newChat = child.innerHTML;
        }
        changeChat(newChat);
    };
    const user = document.createElement('div');
    user.className = "user";
    user.innerHTML = username;
    user.onclick = function() {changeChat(username)};
    userContainer.appendChild(user);
    const messageCounter = document.createElement('div');
    messageCounter.className = "new-message-counter";
    messageCounter.innerHTML = "0";
    messageCounter.style.display = "none";
    userContainer.appendChild(messageCounter);
    usersContainer.appendChild(userContainer);
}

function changeChat(userName) {
    const chatHeader = document.getElementById('chat-with');
    if (userName !== chatHeader.innerHTML) {
        if (userName === 'public') {
            chatHeader.innerHTML = 'Public chat';
        } else {
            chatHeader.innerHTML = userName;
            const userElements = document.getElementsByClassName('user-container');
            for (let i = 0; i < userElements.length; i++) {
                if (userElements[i].children[0].innerHTML === userName) {
                    userElements[i].children[1].innerHTML = "0";
                    userElements[i].children[1].style.display = "none";
                }
            }
        }
        chat = userName;
        const messageBox = document.getElementById("messages");
        messageBox.innerHTML = "";
        loadMessages();
    }
}

function loadUsers() {
    fetch('/api/users/list')
        .then(response => response.json())
        .then(users => {
            const usersContainer = document.getElementById('users');
            usersContainer.innerHTML = '';
            for (let i = 0; i < users.length; i++) {
                if (users[i] !== User) {
                    showUser(users[i]);
                }
            }
        })
        .catch(error => {
            console.error('Error retrieving users:', error);
        });
}


function loadMessages() {
    const messageBox = document.getElementById('messages');
    messageBox.innerHTML = "";
    console.log('loading messages');
    fetch(`/topic/messages`)
        .then(response => response.json())
        .then(messages => {
            for (let i = 0; i < messages.length; i++) {
                console.log(messages[i]);
                if (chat === "public" && messages[i].toUser === "public" ||
                    messages[i].fromUser === chat && messages[i].toUser === User ||
                    messages[i].fromUser === User && messages[i].toUser === chat) {
                    showMessage(messages[i]);
                }
            }
        })
        .catch(error => {
            console.error('Error retrieving messages:', error);
        });
}