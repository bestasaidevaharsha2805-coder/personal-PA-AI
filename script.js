/* =========================================================
   PERSONAL AI ASSISTANT
   FRONTEND APPLICATION
========================================================= */

"use strict";


/* =========================================================
   APPLICATION STATE
========================================================= */

const DEFAULT_STATE = {
    assistantName: "Your Assistant",

    assistantPersonality:
        "Friendly, calm, professional and concise.",

    userName: "You",

    speakResponses: true,

    selectedVoice: "",

    memories: [],

    tasks: [],

    conversation: []
};


let state = loadState();

let recognition = null;

let isListening = false;

let mediaRecorder = null;

let recordedChunks = [];

let recordingStream = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const appLoader = $("#appLoader");
const app = $("#app");

const sidebar = $("#sidebar");
const mobileMenuBtn = $("#mobileMenuBtn");

const pageTitle = $("#pageTitle");

const chatMessages = $("#chatMessages");
const chatForm = $("#chatForm");
const messageInput = $("#messageInput");

const typingIndicator = $("#typingIndicator");

const assistantStatus = $("#assistantStatus");

const assistantGreeting = $("#assistantGreeting");
const assistantSubtitle = $("#assistantSubtitle");

const messageAssistantName =
    $("#messageAssistantName");

const profileName = $("#profileName");
const profileAvatar = $("#profileAvatar");

const menuProfileName =
    $("#menuProfileName");

const menuProfileAvatar =
    $("#menuProfileAvatar");

const settingsModal =
    $("#settingsModal");

const confirmationModal =
    $("#confirmationModal");

const profileMenu =
    $("#profileMenu");

const notificationPanel =
    $("#notificationPanel");

const toastContainer =
    $("#toastContainer");

const memoryList =
    $("#memoryList");

const taskList =
    $("#taskList");

const voiceSelect =
    $("#voiceSelect");

const speechToggle =
    $("#speechToggle");

const settingsSpeechToggle =
    $("#settingsSpeechToggle");

const voiceStatus =
    $("#voiceStatus");

const recordingStatus =
    $("#recordingStatus");

const assistantNameInput =
    $("#assistantNameInput");

const assistantPersonalityInput =
    $("#assistantPersonalityInput");

const userNameInput =
    $("#userNameInput");

const connectionText =
    $("#connectionText");


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadState() {

    try {

        const saved =
            localStorage.getItem(
                "personalAIState"
            );

        if (!saved) {
            return structuredClone(DEFAULT_STATE);
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...structuredClone(DEFAULT_STATE),
            ...parsed
        };

    } catch (error) {

        console.error(
            "Could not load saved state:",
            error
        );

        return structuredClone(DEFAULT_STATE);
    }
}


function saveState() {

    try {

        localStorage.setItem(
            "personalAIState",
            JSON.stringify(state)
        );

    } catch (error) {

        console.error(
            "Could not save state:",
            error
        );
    }
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    applyProfile();

    initializeNavigation();

    initializeChat();

    initializeSettings();

    initializeProfileMenu();

    initializeNotifications();

    initializeMemory();

    initializeTasks();

    initializeVoice();

    initializeMobileMenu();

    initializeNewChat();

    initializeQuickActions();

    initializeConfirmation();

    setTimeout(() => {

        appLoader.classList.add(
            "fade-out"
        );

        app.classList.remove(
            "hidden"
        );

    }, 650);

    checkBackend();

    renderMemories();

    renderTasks();

    restoreConversation();
}


/* =========================================================
   PROFILE
========================================================= */

function applyProfile() {

    const name =
        state.assistantName ||
        DEFAULT_STATE.assistantName;

    const user =
        state.userName ||
        DEFAULT_STATE.userName;

    if (profileName) {
        profileName.textContent = user;
    }

    if (menuProfileName) {
        menuProfileName.textContent = user;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            getInitial(user);
    }

    if (menuProfileAvatar) {
        menuProfileAvatar.textContent =
            getInitial(user);
    }

    if (assistantGreeting) {

        assistantGreeting.textContent =
            `How can I help you, ${user}?`;
    }

    if (assistantSubtitle) {

        assistantSubtitle.textContent =
            "Ask me something, give me a task, or just start talking.";
    }

    if (messageAssistantName) {
        messageAssistantName.textContent =
            name;
    }

    updateAssistantNameInMessages();

    if (speechToggle) {
        speechToggle.checked =
            Boolean(state.speakResponses);
    }

    if (settingsSpeechToggle) {
        settingsSpeechToggle.checked =
            Boolean(state.speakResponses);
    }
}


function getInitial(name) {

    if (!name) {
        return "Y";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
}


function updateAssistantNameInMessages() {

    $$(".assistant-message .message-meta strong")
        .forEach((element) => {

            element.textContent =
                state.assistantName;
        });
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    $$(".nav-item").forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const view =
                    button.dataset.view;

                switchView(view);

                closeMobileSidebar();
            }
        );
    });
}


function switchView(viewName) {

    $$(".nav-item").forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.view === viewName
        );
    });


    $$(".view").forEach((view) => {

        view.classList.toggle(
            "active-view",
            view.dataset.viewPanel === viewName
        );
    });


    const titles = {

        chat: "Your Assistant",

        memory: "Memory",

        tasks: "Tasks & Reminders",

        voice: "Voice Studio",

        calls: "Calls"
    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[viewName] ||
            "Your Assistant";
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    if (!mobileMenuBtn) {
        return;
    }

    mobileMenuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );
}


/* =========================================================
   CHAT
========================================================= */

function initializeChat() {

    if (!chatForm) {
        return;
    }


    chatForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const message =
                messageInput.value.trim();

            if (!message) {
                return;
            }

            messageInput.value = "";

            resizeTextarea();

            await sendMessage(message);
        }
    );


    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                chatForm.requestSubmit();
            }
        }
    );


    messageInput.addEventListener(
        "input",
        resizeTextarea
    );
}


function resizeTextarea() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(message) {

    addMessage(
        "user",
        message
    );

    state.conversation.push({
        role: "user",
        content: message,
        timestamp: Date.now()
    });

    saveState();

    showTyping(true);

    setAssistantStatus(
        "Thinking..."
    );


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message,

                        userId:
                            getUserId(),

                        assistant: {

                            name:
                                state.assistantName,

                            personality:
                                state.assistantPersonality
                        }
                    })
                }
            );


        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const data =
            await response.json();


        const reply =
            data.reply ||
            "I received your message, but I don't have a response yet.";


        handleAssistantAction(
            data.action
        );


        showTyping(false);

        addMessage(
            "assistant",
            reply
        );


        state.conversation.push({

            role: "assistant",

            content: reply,

            timestamp: Date.now()
        });


        if (
            Array.isArray(
                data.memories
            )
        ) {

            state.memories =
                data.memories;

            renderMemories();
        }


        saveState();

        setAssistantStatus(
            "Ready to help"
        );


        if (
            state.speakResponses
        ) {

            speakText(reply);
        }


    } catch (error) {

        console.error(
            "Chat request failed:",
            error
        );


        showTyping(false);


        const fallback =
            localAssistantResponse(
                message
            );


        addMessage(
            "assistant",
            fallback
        );


        state.conversation.push({

            role: "assistant",

            content: fallback,

            timestamp: Date.now()
        });


        saveState();


        setAssistantStatus(
            "Local mode"
        );


        if (
            state.speakResponses
        ) {

            speakText(
                fallback
            );
        }


        showToast(
            "Using local assistant mode",
            "The backend is not connected yet. We'll connect it in the next step."
        );
    }
}


/* =========================================================
   LOCAL FALLBACK ASSISTANT
========================================================= */

function localAssistantResponse(
    message
) {

    const text =
        message
            .toLowerCase()
            .trim();


    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `Hello ${state.userName}. I'm ${state.assistantName}. I'm ready to help.`;
    }


    if (
        text.includes("what can you do") ||
        text === "help"
    ) {

        return [
            "I can help you with:",
            "",
            "• Conversations",
            "• Remembering information",
            "• Tasks and reminders",
            "• Time and date",
            "• Voice interaction",
            "• Assistant personalization",
            "• Future phone and business automation"
        ].join("\n");
    }


    if (
        text.includes("what time") ||
        text === "time"
    ) {

        return `The current time is ${new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        })}.`;
    }


    if (
        text.includes("what date") ||
        text === "date" ||
        text.includes("today's date")
    ) {

        return `Today is ${new Date().toLocaleDateString(
            undefined,
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        )}.`;
    }


    if (
        text.startsWith("remember ")
    ) {

        const memory =
            message
                .slice(9)
                .trim();

        if (memory) {

            state.memories.push({

                id:
                    Date.now().toString(),

                text:
                    memory,

                createdAt:
                    Date.now()
            });

            saveState();

            renderMemories();

            return `Got it. I'll remember: ${memory}`;
        }
    }


    if (
        text.includes(
            "what do you remember"
        ) ||
        text.includes(
            "show my memories"
        )
    ) {

        if (
            state.memories.length === 0
        ) {

            return "I don't have any saved memories yet.";
        }


        return [
            "Here's what I remember:",
            "",
            ...state.memories.map(
                (memory, index) =>
                    `${index + 1}. ${memory.text}`
            )
        ].join("\n");
    }


    if (
        text.includes("thank")
    ) {

        return "You're welcome. I'm here whenever you need me.";
    }


    return `I received: "${message}"\n\nThe full AI brain will be connected through the backend. For now, I'm running in local assistant mode.`;
}


/* =========================================================
   CHAT MESSAGE UI
========================================================= */

function addMessage(
    role,
    text
) {

    if (!chatMessages) {
        return;
    }


    const article =
        document.createElement(
            "article"
        );


    article.className =
        `message ${
            role === "user"
                ? "user-message"
                : "assistant-message"
        }`;


    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.textContent =
        role === "user"
            ? getInitial(
                state.userName
            )
            : "✦";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const meta =
        document.createElement("div");


    meta.className =
        "message-meta";


    const name =
        document.createElement("strong");


    name.textContent =
        role === "user"
            ? state.userName
            : state.assistantName;


    const time =
        document.createElement("time");


    time.textContent =
        formatMessageTime(
            Date.now()
        );


    meta.appendChild(name);
    meta.appendChild(time);


    const bubble =
        document.createElement("div");


    bubble.className =
        "message-bubble";


    const paragraph =
        document.createElement("p");


    paragraph.innerHTML =
        formatMessageText(text);


    bubble.appendChild(
        paragraph
    );


    content.appendChild(meta);
    content.appendChild(bubble);

    article.appendChild(avatar);
    article.appendChild(content);

    chatMessages.appendChild(article);


    scrollChatToBottom();
}


function formatMessageText(text) {

    return escapeHTML(
        text
    ).replace(
        /\n/g,
        "<br>"
    );
}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


function formatMessageTime(
    timestamp
) {

    return new Date(
        timestamp
    ).toLocaleTimeString(
        [],
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


function scrollChatToBottom() {

    requestAnimationFrame(
        () => {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;
        }
    );
}


/* =========================================================
   TYPING
========================================================= */

function showTyping(
    visible
) {

    typingIndicator.classList.toggle(
        "hidden",
        !visible
    );

    if (visible) {
        scrollChatToBottom();
    }
}


/* =========================================================
   ASSISTANT STATUS
========================================================= */

function setAssistantStatus(
    text
) {

    if (assistantStatus) {
        assistantStatus.textContent =
            text;
    }
}


/* =========================================================
   RESTORE CONVERSATION
========================================================= */

function restoreConversation() {

    if (
        !state.conversation ||
        state.conversation.length === 0
    ) {
        return;
    }


    const existingMessages =
        chatMessages.querySelectorAll(
            ".message"
        );


    if (
        existingMessages.length > 0
    ) {

        existingMessages.forEach(
            (element) =>
                element.remove()
        );
    }


    state.conversation
        .slice(-50)
        .forEach((message) => {

            addMessage(
                message.role === "user"
                    ? "user"
                    : "assistant",

                message.content
            );
        });
}


/* =========================================================
   QUICK ACTIONS
========================================================= */

function initializeQuickActions() {

    $$(".quick-action").forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const prompt =
                        button.dataset.prompt;

                    if (!prompt) {
                        return;
                    }

                    messageInput.value =
                        prompt;

                    resizeTextarea();

                    chatForm.requestSubmit();
                }
            );
        }
    );
}


/* =========================================================
   NEW CHAT
========================================================= */

function initializeNewChat() {

    const button =
        $("#newChatBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            askForConfirmation(

                "Start new conversation",

                "This will clear your current conversation. Your saved memories will remain.",

                () => {

                    state.conversation =
                        [];

                    saveState();

                    chatMessages
                        .querySelectorAll(
                            ".message"
                        )
                        .forEach(
                            (message) =>
                                message.remove()
                        );


                    addMessage(
                        "assistant",

                        `New conversation started. I'm ${state.assistantName}. How can I help?`
                    );


                    switchView(
                        "chat"
                    );


                    showToast(
                        "New conversation",
                        "Your conversation has been cleared."
                    );
                }
            );
        }
    );
}


/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

    const settingsBtn =
        $("#settingsBtn");

    const saveBtn =
        $("#saveSettingsBtn");

    const resetBtn =
        $("#resetSettingsBtn");


    settingsBtn?.addEventListener(
        "click",
        openSettings
    );


    $("#menuSettingsBtn")?.addEventListener(
        "click",
        () => {

            closeProfileMenu();

            openSettings();
        }
    );


    saveBtn?.addEventListener(
        "click",
        saveSettings
    );


    resetBtn?.addEventListener(
        "click",
        resetSettings
    );


    $$(".modal [data-close-modal]")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    closeAllModals
                );
            }
        );


    speechToggle?.addEventListener(
        "change",
        () => {

            state.speakResponses =
                speechToggle.checked;

            settingsSpeechToggle.checked =
                speechToggle.checked;

            saveState();
        }
    );


    settingsSpeechToggle?.addEventListener(
        "change",
        () => {

            state.speakResponses =
                settingsSpeechToggle.checked;

            speechToggle.checked =
                settingsSpeechToggle.checked;

            saveState();
        }
    );
}


function openSettings() {

    assistantNameInput.value =
        state.assistantName;

    assistantPersonalityInput.value =
        state.assistantPersonality;

    userNameInput.value =
        state.userName;

    settingsSpeechToggle.checked =
        state.speakResponses;

    settingsModal.classList.remove(
        "hidden"
    );
}


function closeAllModals() {

    settingsModal.classList.add(
        "hidden"
    );

    confirmationModal.classList.add(
        "hidden"
    );
}


function saveSettings() {

    const assistantName =
        assistantNameInput.value.trim();

    const personality =
        assistantPersonalityInput.value.trim();

    const userName =
        userNameInput.value.trim();


    if (assistantName) {

        state.assistantName =
            assistantName;
    }


    if (personality) {

        state.assistantPersonality =
            personality;
    }


    if (userName) {

        state.userName =
            userName;
    }


    state.speakResponses =
        settingsSpeechToggle.checked;


    saveState();

    applyProfile();

    closeAllModals();


    showToast(
        "Settings saved",
        "Your assistant profile has been updated."
    );
}


function resetSettings() {

    askForConfirmation(

        "Reset settings",

        "This will restore the default assistant name, personality and user profile.",

        () => {

            state.assistantName =
                DEFAULT_STATE.assistantName;

            state.assistantPersonality =
                DEFAULT_STATE.assistantPersonality;

            state.userName =
                DEFAULT_STATE.userName;

            state.speakResponses =
                DEFAULT_STATE.speakResponses;

            saveState();

            applyProfile();

            closeAllModals();

            showToast(
                "Settings reset",
                "Default settings have been restored."
            );
        }
    );
}


/* =========================================================
   PROFILE MENU
========================================================= */

function initializeProfileMenu() {

    const profileBtn =
        $("#profileBtn");


    profileBtn?.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            notificationPanel.classList.add(
                "hidden"
            );

            profileMenu.classList.toggle(
                "hidden"
            );
        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !profileMenu.contains(
                    event.target
                ) &&
                !profileBtn.contains(
                    event.target
                )
            ) {

                closeProfileMenu();
            }
        }
    );


    $("#clearConversationBtn")
        ?.addEventListener(
            "click",
            () => {

                closeProfileMenu();

                askForConfirmation(

                    "Clear conversation",

                    "Your current conversation will be removed from this browser.",

                    () => {

                        state.conversation =
                            [];

                        saveState();

                        chatMessages
                            .querySelectorAll(
                                ".message"
                            )
                            .forEach(
                                (element) =>
                                    element.remove()
                            );


                        addMessage(
                            "assistant",

                            `Conversation cleared. I'm ${state.assistantName}.`
                        );


                        showToast(
                            "Conversation cleared",
                            "Your saved memories were not deleted."
                        );
                    }
                );
            }
        );
}


function closeProfileMenu() {

    profileMenu.classList.add(
        "hidden"
    );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const button =
        $("#notificationsBtn");

    const closeButton =
        $("#closeNotificationsBtn");


    button?.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            closeProfileMenu();

            notificationPanel.classList.toggle(
                "hidden"
            );
        }
    );


    closeButton?.addEventListener(
        "click",
        () => {

            notificationPanel.classList.add(
                "hidden"
            );
        }
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast";


    const icon =
        document.createElement(
            "div"
        );

    icon.className =
        "toast-icon";

    icon.textContent =
        "✦";


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "toast-content";


    const strong =
        document.createElement(
            "strong"
        );

    strong.textContent =
        title;


    const paragraph =
        document.createElement(
            "p"
        );

    paragraph.textContent =
        message;


    content.appendChild(
        strong
    );

    content.appendChild(
        paragraph
    );


    toast.appendChild(
        icon
    );

    toast.appendChild(
        content
    );


    toastContainer.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.style.opacity =
                "0";

            toast.style.transform =
                "translateY(8px)";

            setTimeout(
                () => toast.remove(),
                200
            );

        },
        3500
    );
}


/* =========================================================
   MEMORY
========================================================= */

function initializeMemory() {

    $("#addMemoryBtn")
        ?.addEventListener(
            "click",
            () => {

                const memory =
                    prompt(
                        "What should your assistant remember?"
                    );


                if (!memory?.trim()) {
                    return;
                }


                state.memories.push({

                    id:
                        Date.now().toString(),

                    text:
                        memory.trim(),

                    createdAt:
                        Date.now()
                });


                saveState();

                renderMemories();


                showToast(
                    "Memory saved",
                    "Your assistant can now use this information."
                );
            }
        );
}


function renderMemories() {

    if (!memoryList) {
        return;
    }


    if (
        !state.memories ||
        state.memories.length === 0
    ) {

        memoryList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ◇
                </div>

                <h3>No memories yet</h3>

                <p>
                    Tell your assistant something like
                    “Remember that I prefer short answers.”
                </p>

            </div>

        `;

        return;
    }


    memoryList.innerHTML = "";


    state.memories
        .slice()
        .reverse()
        .forEach(
            (memory) => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "memory-card";


                card.innerHTML = `

                    <div class="memory-card-header">

                        <div class="memory-card-icon">
                            ◇
                        </div>

                        <button
                            class="memory-delete"
                            type="button"
                            aria-label="Delete memory"
                            data-memory-id="${escapeHTML(memory.id)}"
                        >
                            ×
                        </button>

                    </div>

                    <p>
                        ${escapeHTML(memory.text)}
                    </p>

                    <small>
                        Saved ${formatDate(memory.createdAt)}
                    </small>

                `;


                memoryList.appendChild(
                    card
                );
            }
        );


    $$(".memory-delete")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.memoryId;

                        state.memories =
                            state.memories.filter(
                                (memory) =>
                                    memory.id !== id
                            );

                        saveState();

                        renderMemories();

                        showToast(
                            "Memory deleted",
                            "The selected memory was removed."
                        );
                    }
                );
            }
        );
}


/* =========================================================
   TASKS
========================================================= */

function initializeTasks() {

    $("#addTaskBtn")
        ?.addEventListener(
            "click",
            addTask
        );
}


function addTask() {

    const task =
        prompt(
            "What task or reminder should I add?"
        );


    if (!task?.trim()) {
        return;
    }


    state.tasks.push({

        id:
            Date.now().toString(),

        title:
            task.trim(),

        completed:
            false,

        createdAt:
            Date.now()
    });


    saveState();

    renderTasks();


    showToast(
        "Task added",
        "Your task has been added to the task list."
    );
}


function renderTasks() {

    if (!taskList) {
        return;
    }


    if (
        !state.tasks ||
        state.tasks.length === 0
    ) {

        taskList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>No tasks yet</h3>

                <p>
                    Your reminders and personal tasks
                    will appear here.
                </p>

            </div>

        `;

        return;
    }


    taskList.innerHTML = "";


    state.tasks.forEach(
        (task) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "task-item";


            item.innerHTML = `

                <button
                    class="task-checkbox ${
                        task.completed
                            ? "completed"
                            : ""
                    }"
                    type="button"
                    data-task-id="${escapeHTML(task.id)}"
                    aria-label="Complete task"
                >
                    ${
                        task.completed
                            ? "✓"
                            : ""
                    }
                </button>

                <div class="task-content">

                    <strong>
                        ${escapeHTML(task.title)}
                    </strong>

                    <span>
                        Added ${formatDate(task.createdAt)}
                    </span>

                </div>

                <button
                    class="task-delete"
                    type="button"
                    data-task-id="${escapeHTML(task.id)}"
                    aria-label="Delete task"
                >
                    ×
                </button>

            `;


            taskList.appendChild(
                item
            );
        }
    );


    $$(".task-checkbox")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.taskId;

                        const task =
                            state.tasks.find(
                                (item) =>
                                    item.id === id
                            );

                        if (!task) {
                            return;
                        }

                        task.completed =
                            !task.completed;

                        saveState();

                        renderTasks();
                    }
                );
            }
        );


    $$(".task-delete")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.taskId;

                        state.tasks =
                            state.tasks.filter(
                                (task) =>
                                    task.id !== id
                            );

                        saveState();

                        renderTasks();
                    }
                );
            }
        );
}


/* =========================================================
   VOICE INPUT
========================================================= */

function initializeVoice() {

    setupSpeechRecognition();

    setupSpeechSynthesis();

    setupVoiceTest();

    setupVoiceRecording();
}


function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        voiceStatus.textContent =
            "Voice recognition is not supported by this browser.";

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        true;

    recognition.lang =
        navigator.language ||
        "en-IN";


    recognition.onstart =
        () => {

            isListening = true;

            $("#micBtn")
                ?.classList.add(
                    "recording"
                );

            setAssistantStatus(
                "Listening..."
            );

            voiceStatus.textContent =
                "Listening...";
        };


    recognition.onresult =
        (event) => {

            let finalText = "";

            for (
                let i =
                    event.resultIndex;
                i <
                    event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0]
                        .transcript;

                if (
                    event.results[i]
                        .isFinal
                ) {

                    finalText +=
                        transcript;
                }
            }


            if (finalText) {

                messageInput.value =
                    finalText;

                resizeTextarea();

                chatForm.requestSubmit();
            }
        };


    recognition.onerror =
        (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            voiceStatus.textContent =
                `Voice error: ${event.error}`;

            stopListening();
        };


    recognition.onend =
        () => {

            stopListening();
        };


    $("#micBtn")
        ?.addEventListener(
            "click",
            toggleListening
        );
}


function toggleListening() {

    if (!recognition) {

        showToast(
            "Voice unavailable",
            "Your browser does not provide speech recognition."
        );

        return;
    }


    if (isListening) {

        recognition.stop();

    } else {

        try {

            recognition.start();

        } catch (error) {

            console.error(
                error
            );
        }
    }
}


function stopListening() {

    isListening = false;

    $("#micBtn")
        ?.classList.remove(
            "recording"
        );

    setAssistantStatus(
        "Ready to help"
    );

    if (voiceStatus) {

        voiceStatus.textContent =
            "Microphone not active";
    }
}


/* =========================================================
   SPEECH SYNTHESIS
========================================================= */

function setupSpeechSynthesis() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    loadAvailableVoices();


    speechSynthesis.addEventListener(
        "voiceschanged",
        loadAvailableVoices
    );
}


function loadAvailableVoices() {

    if (
        !("speechSynthesis" in window) ||
        !voiceSelect
    ) {

        return;
    }


    const voices =
        speechSynthesis.getVoices();


    if (!voices.length) {
        return;
    }


    voiceSelect.innerHTML = "";


    voices.forEach(
        (voice) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                voice.name;

            option.textContent =
                `${voice.name} — ${voice.lang}`;


            if (
                voice.name ===
                state.selectedVoice
            ) {

                option.selected =
                    true;
            }


            voiceSelect.appendChild(
                option
            );
        }
    );


    if (
        !state.selectedVoice
    ) {

        const preferred =
            voices.find(
                (voice) =>
                    voice.lang
                        .toLowerCase()
                        .startsWith(
                            "en"
                        )
            );


        if (preferred) {

            voiceSelect.value =
                preferred.name;

            state.selectedVoice =
                preferred.name;

            saveState();
        }
    }
}


function speakText(text) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    if (!text?.trim()) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    const voices =
        speechSynthesis.getVoices();


    const selected =
        voices.find(
            (voice) =>
                voice.name ===
                state.selectedVoice
        );


    if (selected) {

        utterance.voice =
            selected;
    }


    utterance.rate =
        1;

    utterance.pitch =
        1;


    utterance.onstart =
        () => {

            setAssistantStatus(
                "Speaking..."
            );
        };


    utterance.onend =
        () => {

            setAssistantStatus(
                "Ready to help"
            );
        };


    speechSynthesis.speak(
        utterance
    );
}


voiceSelect?.addEventListener(
    "change",
    () => {

        state.selectedVoice =
            voiceSelect.value;

        saveState();
    }
);


/* =========================================================
   MICROPHONE TEST
========================================================= */

function setupVoiceTest() {

    $("#voiceTestBtn")
        ?.addEventListener(
            "click",
            async () => {

                if (
                    !navigator.mediaDevices ||
                    !navigator.mediaDevices
                        .getUserMedia
                ) {

                    showToast(
                        "Microphone unavailable",
                        "This browser cannot access microphone permissions."
                    );

                    return;
                }


                try {

                    const stream =
                        await navigator
                            .mediaDevices
                            .getUserMedia({
                                audio: true
                            });


                    stream
                        .getTracks()
                        .forEach(
                            (track) =>
                                track.stop()
                        );


                    voiceStatus.textContent =
                        "Microphone permission granted.";

                    showToast(
                        "Microphone ready",
                        "Your browser granted microphone access."
                    );

                } catch (error) {

                    console.error(
                        error
                    );

                    voiceStatus.textContent =
                        "Microphone permission denied.";

                    showToast(
                        "Microphone blocked",
                        "Allow microphone access in your browser settings."
                    );
                }
            }
        );
}


/* =========================================================
   VOICE SAMPLE RECORDING
========================================================= */

function setupVoiceRecording() {

    $("#recordVoiceBtn")
        ?.addEventListener(
            "click",
            toggleVoiceRecording
        );
}


async function toggleVoiceRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state ===
            "recording"
    ) {

        mediaRecorder.stop();

        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
            .getUserMedia
    ) {

        showToast(
            "Recording unavailable",
            "Your browser does not support microphone recording."
        );

        return;
    }


    try {

        recordingStream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    audio: true
                });


        recordedChunks = [];


        mediaRecorder =
            new MediaRecorder(
                recordingStream
            );


        mediaRecorder.ondataavailable =
            (event) => {

                if (
                    event.data.size > 0
                ) {

                    recordedChunks.push(
                        event.data
                    );
                }
            };


        mediaRecorder.onstart =
            () => {

                recordingStatus.textContent =
                    "Recording voice sample...";

                $("#recordVoiceBtn")
                    .textContent =
                    "Stop recording";

                $("#recordVoiceBtn")
                    .classList.add(
                        "recording-active"
                    );
            };


        mediaRecorder.onstop =
            () => {

                recordingStream
                    ?.getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );


                $("#recordVoiceBtn")
                    .textContent =
                    "Start voice sample";


                $("#recordVoiceBtn")
                    .classList.remove(
                        "recording-active"
                    );


                recordingStatus.textContent =
                    "Voice sample recorded locally.";


                createRecordingPlayback();
            };


        mediaRecorder.start();

    } catch (error) {

        console.error(
            error
        );

        showToast(
            "Recording failed",
            "Microphone access could not be started."
        );
    }
}


function createRecordingPlayback() {

    if (
        !recordedChunks.length
    ) {

        return;
    }


    const blob =
        new Blob(
            recordedChunks,
            {
                type:
                    "audio/webm"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const existing =
        document.querySelector(
            "#voicePlayback"
        );


    existing?.remove();


    const audio =
        document.createElement(
            "audio"
        );


    audio.id =
        "voicePlayback";

    audio.controls =
        true;

    audio.src =
        url;

    audio.style.width =
        "100%";

    audio.style.marginTop =
        "12px";


    recordingStatus
        .parentElement
        ?.appendChild(
            audio
        );


    showToast(
        "Voice sample ready",
        "This recording is only a local browser sample. Voice cloning is not connected yet."
    );
}


/* =========================================================
   CONFIRMATION SYSTEM
========================================================= */

let pendingConfirmation = null;


function initializeConfirmation() {

    $("#confirmationCancelBtn")
        ?.addEventListener(
            "click",
            () => {

                pendingConfirmation =
                    null;

                confirmationModal.classList.add(
                    "hidden"
                );
            }
        );


    $("#confirmationConfirmBtn")
        ?.addEventListener(
            "click",
            () => {

                const callback =
                    pendingConfirmation;

                pendingConfirmation =
                    null;

                confirmationModal.classList.add(
                    "hidden"
                );


                if (
                    typeof callback ===
                    "function"
                ) {

                    callback();
                }
            }
        );
}


function askForConfirmation(
    title,
    message,
    callback
) {

    $("#confirmationTitle")
        .textContent =
        title;

    $("#confirmationMessage")
        .textContent =
        message;


    pendingConfirmation =
        callback;


    confirmationModal.classList.remove(
        "hidden"
    );
}


/* =========================================================
   BACKEND HEALTH CHECK
========================================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                "/api/health"
            );


        if (!response.ok) {
            throw new Error(
                "Backend unavailable"
            );
        }


        const data =
            await response.json();


        connectionText.textContent =
            data.message ||
            "Backend online";


    } catch (error) {

        connectionText.textContent =
            "Local assistant mode";
    }
}


/* =========================================================
   USER ID
========================================================= */

function getUserId() {

    let id =
        localStorage.getItem(
            "personalAIUserId"
        );


    if (!id) {

        id =
            "user_" +
            crypto.randomUUID();


        localStorage.setItem(
            "personalAIUserId",
            id
        );
    }


    return id;
}


/* =========================================================
   BACKEND ACTIONS
========================================================= */

function handleAssistantAction(
    action
) {

    if (!action) {
        return;
    }


    if (
        action.type ===
        "open_url"
    ) {

        if (!action.url) {
            return;
        }


        askForConfirmation(

            "Open website",

            `The assistant wants to open ${action.url}.`,

            () => {

                window.open(
                    action.url,
                    "_blank",
                    "noopener,noreferrer"
                );
            }
        );
    }


    if (
        action.type ===
        "switch_view"
    ) {

        switchView(
            action.view
        );
    }


    if (
        action.type ===
        "show_toast"
    ) {

        showToast(
            action.title ||
                "Assistant",
            action.message ||
                ""
        );
    }
}


/* =========================================================
   DATE FORMATTING
========================================================= */

function formatDate(
    timestamp
) {

    if (!timestamp) {
        return "recently";
    }


    return new Date(
        timestamp
    ).toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   GLOBAL KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            (event.ctrlKey ||
                event.metaKey) &&
            event.key.toLowerCase() ===
                "k"
        ) {

            event.preventDefault();

            messageInput?.focus();
        }


        if (
            event.key === "Escape"
        ) {

            closeAllModals();

            closeProfileMenu();

            notificationPanel
                ?.classList.add(
                    "hidden"
                );
        }
    }
);


/* =========================================================
   EXPORT DEBUG STATE
========================================================= */

window.PersonalAI = {

    getState: () =>
        structuredClone(state),

    saveState,

    switchView,

    speakText,

    showToast
};
