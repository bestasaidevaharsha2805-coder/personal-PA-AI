/* =========================================================
   PERSONAL AI ASSISTANT
   FRONTEND APPLICATION
   COMPLETE STABLE VERSION
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
   WAKE WORD STATE
========================================================= */

let wakeWordMode = false;

let waitingForCommand = false;

let recognitionRestartTimer = null;

const WAKE_WORDS = [
    "hey pa",
    "hey p a",
    "hey personal assistant",
    "hello pa"
];


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   DOM ELEMENTS
========================================================= */

const appLoader = $("#appLoader");

const app = $("#app");

const sidebar = $("#sidebar");

const mobileMenuBtn =
    $("#mobileMenuBtn");

const pageTitle =
    $("#pageTitle");

const chatMessages =
    $("#chatMessages");

const chatForm =
    $("#chatForm");

const messageInput =
    $("#messageInput");

const typingIndicator =
    $("#typingIndicator");

const assistantStatus =
    $("#assistantStatus");

const assistantGreeting =
    $("#assistantGreeting");

const assistantSubtitle =
    $("#assistantSubtitle");

const messageAssistantName =
    $("#messageAssistantName");

const profileName =
    $("#profileName");

const profileAvatar =
    $("#profileAvatar");

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

const wakeWordBtn =
    $("#wakeWordBtn");

const wakeWordStatus =
    $("#wakeWordStatus");

const voiceTestBtn =
    $("#voiceTestBtn");

const recordVoiceBtn =
    $("#recordVoiceBtn");


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
            return cloneDefaultState();
        }

        const parsed =
            JSON.parse(saved);

        return {
            ...cloneDefaultState(),
            ...parsed,

            memories:
                Array.isArray(parsed.memories)
                    ? parsed.memories
                    : [],

            tasks:
                Array.isArray(parsed.tasks)
                    ? parsed.tasks
                    : [],

            conversation:
                Array.isArray(parsed.conversation)
                    ? parsed.conversation
                    : []
        };

    } catch (error) {

        console.error(
            "Could not load saved state:",
            error
        );

        return cloneDefaultState();
    }
}


function cloneDefaultState() {

    return JSON.parse(
        JSON.stringify(DEFAULT_STATE)
    );
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

    renderMemories();

    renderTasks();

    restoreConversation();

    checkBackend();

    setTimeout(() => {

        if (appLoader) {
            appLoader.classList.add(
                "fade-out"
            );
        }

        if (app) {
            app.classList.remove(
                "hidden"
            );
        }

    }, 650);
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
        profileName.textContent =
            user;
    }

    if (menuProfileName) {
        menuProfileName.textContent =
            user;
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
            Boolean(
                state.speakResponses
            );
    }

    if (settingsSpeechToggle) {
        settingsSpeechToggle.checked =
            Boolean(
                state.speakResponses
            );
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
            button.dataset.view ===
                viewName
        );
    });


    $$(".view").forEach((view) => {

        view.classList.toggle(
            "active-view",
            view.dataset.viewPanel ===
                viewName
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

            if (sidebar) {

                sidebar.classList.toggle(
                    "mobile-open"
                );
            }
        }
    );
}


function closeMobileSidebar() {

    if (!sidebar) {
        return;
    }

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
                messageInput
                    ? messageInput.value.trim()
                    : "";

            if (!message) {
                return;
            }

            if (messageInput) {
                messageInput.value = "";
            }

            resizeTextarea();

            await sendMessage(message);
        }
    );


    if (messageInput) {

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


        if (
            state.speakResponses
        ) {

            speakText(reply);

        } else if (
            wakeWordMode
        ) {

            resumeWakeWordMode();
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

        } else if (
            wakeWordMode
        ) {

            resumeWakeWordMode();
        }


        showToast(
            "Using local assistant mode",
            "The backend could not be reached, so I used local responses."
        );
    }
}


/* =========================================================
   MESSAGE UI
========================================================= */

function addMessage(
    role,
    text
) {

    if (!chatMessages) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        role === "user"
            ? "message user-message"
            : "message assistant-message";


    const meta =
        document.createElement(
            "div"
        );


    meta.className =
        "message-meta";


    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        role === "user"
            ? state.userName
            : state.assistantName;


    const time =
        document.createElement(
            "span"
        );


    time.textContent =
        formatTime(Date.now());


    meta.appendChild(strong);

    meta.appendChild(time);


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    content.textContent =
        text;


    wrapper.appendChild(meta);

    wrapper.appendChild(content);


    chatMessages.appendChild(
        wrapper
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================================================
   RESTORE CONVERSATION
========================================================= */

function restoreConversation() {

    if (!chatMessages) {
        return;
    }

    if (
        !Array.isArray(
            state.conversation
        )
    ) {
        return;
    }


    state.conversation.forEach(
        (message) => {

            if (
                message &&
                (
                    message.role === "user" ||
                    message.role === "assistant"
                )
            ) {

                addMessage(
                    message.role,
                    message.content || ""
                );
            }
        }
    );
}


/* =========================================================
   TYPING INDICATOR
========================================================= */

function showTyping(show) {

    if (!typingIndicator) {
        return;
    }

    typingIndicator.classList.toggle(
        "hidden",
        !show
    );
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
        text === "hey"
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
            "• Future automation"
        ].join("\n");
    }


    if (
        text.includes("what time") ||
        text === "time"
    ) {

        return `The current time is ${new Date().toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        )}.`;
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

            const newMemory = {

                id:
                    Date.now().toString(),

                text:
                    memory,

                createdAt:
                    Date.now()
            };


            state.memories.push(
                newMemory
            );


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

            ...state.memories.map(
                (memory) =>
                    `• ${memory.text}`
            )
        ].join("\n");
    }


    return `I'm ${state.assistantName}. I received your message. My main AI service is currently unavailable, but the local assistant is still running.`;
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

                    const text =
                        button.dataset.prompt ||
                        button.dataset.message ||
                        button.textContent.trim();

                    if (
                        messageInput
                    ) {

                        messageInput.value =
                            text;

                        resizeTextarea();

                        messageInput.focus();
                    }
                }
            );
        }
    );
}


/* =========================================================
   NEW CHAT
========================================================= */

function initializeNewChat() {

    const buttons =
        $$(
            "#newChatBtn, .new-chat-btn, [data-action='new-chat']"
        );


    buttons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                startNewChat
            );
        }
    );
}


function startNewChat() {

    state.conversation = [];

    saveState();


    if (chatMessages) {

        chatMessages.innerHTML =
            "";
    }


    showToast(
        "New chat",
        "Your conversation has been cleared."
    );
}


/* =========================================================
   SETTINGS
========================================================= */

function initializeSettings() {

    const openButtons =
        $$(
            "#settingsBtn, [data-action='settings']"
        );


    openButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                openSettings
            );
        }
    );


    const closeButtons =
        $$(
            "#closeSettings, .close-settings, [data-close='settings']"
        );


    closeButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                closeSettings
            );
        }
    );


    if (speechToggle) {

        speechToggle.addEventListener(
            "change",
            () => {

                state.speakResponses =
                    speechToggle.checked;

                if (settingsSpeechToggle) {

                    settingsSpeechToggle.checked =
                        speechToggle.checked;
                }

                saveState();
            }
        );
    }


    if (settingsSpeechToggle) {

        settingsSpeechToggle.addEventListener(
            "change",
            () => {

                state.speakResponses =
                    settingsSpeechToggle.checked;

                if (speechToggle) {

                    speechToggle.checked =
                        settingsSpeechToggle.checked;
                }

                saveState();
            }
        );
    }


    if (assistantNameInput) {

        assistantNameInput.value =
            state.assistantName;
    }


    if (assistantPersonalityInput) {

        assistantPersonalityInput.value =
            state.assistantPersonality;
    }


    if (userNameInput) {

        userNameInput.value =
            state.userName;
    }


    const saveButtons =
        $$(
            "#saveSettings, .save-settings, [data-action='save-settings']"
        );


    saveButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                saveSettings
            );
        }
    );
}


function openSettings() {

    if (settingsModal) {

        settingsModal.classList.remove(
            "hidden"
        );
    }
}


function closeSettings() {

    if (settingsModal) {

        settingsModal.classList.add(
            "hidden"
        );
    }
}


function saveSettings() {

    if (assistantNameInput) {

        const value =
            assistantNameInput.value.trim();

        if (value) {

            state.assistantName =
                value;
        }
    }


    if (assistantPersonalityInput) {

        const value =
            assistantPersonalityInput.value.trim();

        if (value) {

            state.assistantPersonality =
                value;
        }
    }


    if (userNameInput) {

        const value =
            userNameInput.value.trim();

        if (value) {

            state.userName =
                value;
        }
    }


    saveState();

    applyProfile();

    closeSettings();


    showToast(
        "Settings saved",
        "Your assistant preferences have been updated."
    );
}


/* =========================================================
   PROFILE MENU
========================================================= */

function initializeProfileMenu() {

    const profileButton =
        $(
            "#profileBtn, #profileButton, [data-action='profile']"
        );


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            () => {

                if (profileMenu) {

                    profileMenu.classList.toggle(
                        "hidden"
                    );
                }
            }
        );
    }


    document.addEventListener(
        "click",
        (event) => {

            if (
                profileMenu &&
                !profileMenu.contains(
                    event.target
                ) &&
                profileButton &&
                !profileButton.contains(
                    event.target
                )
            ) {

                profileMenu.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function initializeNotifications() {

    const notificationButton =
        $(
            "#notificationBtn, #notificationsBtn, [data-action='notifications']"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                if (notificationPanel) {

                    notificationPanel.classList.toggle(
                        "hidden"
                    );
                }
            }
        );
    }
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    title,
    message
) {

    if (!toastContainer) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "toast";


    const heading =
        document.createElement(
            "strong"
        );


    heading.textContent =
        title;


    const body =
        document.createElement(
            "span"
        );


    body.textContent =
        message;


    toast.appendChild(
        heading
    );

    toast.appendChild(
        body
    );


    toastContainer.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.classList.add(
                "fade-out"
            );

            setTimeout(
                () => {
                    toast.remove();
                },
                300
            );

        },
        3500
    );
}


/* =========================================================
   MEMORY
========================================================= */

function initializeMemory() {

    const addMemoryButtons =
        $$(
            "#addMemoryBtn, [data-action='add-memory']"
        );


    addMemoryButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const text =
                        prompt(
                            "What should I remember?"
                        );

                    if (
                        text &&
                        text.trim()
                    ) {

                        addMemory(
                            text.trim()
                        );
                    }
                }
            );
        }
    );


    renderMemories();
}


async function addMemory(text) {

    const memory = {

        id:
            Date.now().toString(),

        text,

        createdAt:
            Date.now()
    };


    state.memories.push(
        memory
    );

    saveState();

    renderMemories();


    try {

        const response =
            await fetch(
                "/api/memory",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            userId:
                                getUserId(),
                            text
                        })
                }
            );


        if (!response.ok) {
            throw new Error(
                "Memory server error"
            );
        }

    } catch (error) {

        console.warn(
            "Memory backend unavailable:",
            error
        );
    }


    showToast(
        "Memory saved",
        `I'll remember: ${text}`
    );
}


function renderMemories() {

    if (!memoryList) {
        return;
    }


    memoryList.innerHTML =
        "";


    if (
        state.memories.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-state";

        empty.textContent =
            "No memories saved yet.";

        memoryList.appendChild(
            empty
        );

        return;
    }


    state.memories
        .slice()
        .reverse()
        .forEach(
            (memory) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "memory-item";


                const text =
                    document.createElement(
                        "span"
                    );

                text.textContent =
                    memory.text;


                const deleteButton =
                    document.createElement(
                        "button"
                    );

                deleteButton.type =
                    "button";

                deleteButton.textContent =
                    "Delete";


                deleteButton.addEventListener(
                    "click",
                    () => {

                        deleteMemory(
                            memory.id
                        );
                    }
                );


                item.appendChild(
                    text
                );

                item.appendChild(
                    deleteButton
                );


                memoryList.appendChild(
                    item
                );
            }
        );
}


async function deleteMemory(
    id
) {

    state.memories =
        state.memories.filter(
            (memory) =>
                memory.id !== id
        );


    saveState();

    renderMemories();


    try {

        await fetch(
            `/api/memory/${encodeURIComponent(id)}`,
            {
                method: "DELETE",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        userId:
                            getUserId()
                    })
            }
        );

    } catch (error) {

        console.warn(
            "Could not delete remote memory:",
            error
        );
    }


    showToast(
        "Memory deleted",
        "The memory was removed."
    );
}


/* =========================================================
   TASKS
========================================================= */

function initializeTasks() {

    const addTaskButtons =
        $$(
            "#addTaskBtn, [data-action='add-task']"
        );


    addTaskButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                addTaskFromPrompt
            );
        }
    );


    renderTasks();
}


function addTaskFromPrompt() {

    const title =
        prompt(
            "Enter a task:"
        );


    if (
        !title ||
        !title.trim()
    ) {
        return;
    }


    const task = {

        id:
            Date.now().toString(),

        title:
            title.trim(),

        completed:
            false,

        createdAt:
            Date.now()
    };


    state.tasks.push(
        task
    );

    saveState();

    renderTasks();


    showToast(
        "Task added",
        task.title
    );
}


function renderTasks() {

    if (!taskList) {
        return;
    }


    taskList.innerHTML =
        "";


    if (
        state.tasks.length === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "empty-state";

        empty.textContent =
            "No tasks yet.";

        taskList.appendChild(
            empty
        );

        return;
    }


    state.tasks.forEach(
        (task) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "task-item";


            if (task.completed) {

                item.classList.add(
                    "completed"
                );
            }


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.checked =
                Boolean(
                    task.completed
                );


            checkbox.addEventListener(
                "change",
                () => {

                    task.completed =
                        checkbox.checked;

                    saveState();

                    renderTasks();
                }
            );


            const title =
                document.createElement(
                    "span"
                );

            title.textContent =
                task.title;


            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.type =
                "button";

            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () => {

                    state.tasks =
                        state.tasks.filter(
                            (item) =>
                                item.id !==
                                task.id
                        );

                    saveState();

                    renderTasks();
                }
            );


            item.appendChild(
                checkbox
            );

            item.appendChild(
                title
            );

            item.appendChild(
                deleteButton
            );


            taskList.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   VOICE SYSTEM
========================================================= */

function initializeVoice() {

    setupSpeechRecognition();

    setupSpeechSynthesis();

    setupVoiceTest();

    setupVoiceRecording();

    setupWakeWord();
}


/* =========================================================
   SPEECH RECOGNITION
========================================================= */

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (voiceStatus) {

            voiceStatus.textContent =
                "Voice recognition is not supported by this browser.";
        }

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

            isListening =
                true;


            const mic =
                $("#micBtn");


            if (mic) {

                mic.classList.add(
                    "recording"
                );
            }


            if (
                wakeWordMode &&
                !waitingForCommand
            ) {

                setAssistantStatus(
                    'Listening for "Hey PA"...'
                );

                if (voiceStatus) {

                    voiceStatus.textContent =
                        'Listening for "Hey PA"...';
                }

            } else {

                setAssistantStatus(
                    "Listening..."
                );

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "Listening...";
                }
            }
        };


    recognition.onresult =
        (event) => {

            let finalText =
                "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                const transcript =
                    event.results[i][0]
                        .transcript
                        .trim();


                if (
                    event.results[i]
                        .isFinal
                ) {

                    finalText +=
                        transcript + " ";
                }
            }


            if (!finalText.trim()) {
                return;
            }


            finalText =
                finalText.trim();


            if (wakeWordMode) {

                handleWakeWordResult(
                    finalText
                );

                return;
            }


            submitVoiceCommand(
                finalText
            );
        };


    recognition.onerror =
        (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening =
                false;


            const mic =
                $("#micBtn");


            if (mic) {

                mic.classList.remove(
                    "recording"
                );
            }


            if (
                event.error ===
                "not-allowed"
            ) {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        "Microphone permission was denied.";
                }


                setAssistantStatus(
                    "Microphone permission needed"
                );


                wakeWordMode =
                    false;

                waitingForCommand =
                    false;


                updateWakeWordUI();

                return;
            }


            if (
                wakeWordMode
            ) {

                scheduleWakeListening();

            } else {

                if (voiceStatus) {

                    voiceStatus.textContent =
                        `Voice error: ${event.error}`;
                }

                setAssistantStatus(
                    "Ready to help"
                );
            }
        };


    recognition.onend =
        () => {

            isListening =
                false;


            const mic =
                $("#micBtn");


            if (mic) {

                mic.classList.remove(
                    "recording"
                );
            }


            if (
                wakeWordMode
            ) {

                if (
                    waitingForCommand
                ) {

                    return;
                }


                scheduleWakeListening();

                return;
            }


            setAssistantStatus(
                "Ready to help"
            );


            if (voiceStatus) {

                voiceStatus.textContent =
                    "Microphone not active";
            }
        };


    const micBtn =
        $("#micBtn");


    if (micBtn) {

        micBtn.addEventListener(
            "click",
            toggleListening
        );
    }
}


function toggleListening() {

    if (!recognition) {

        showToast(
            "Voice unavailable",
            "Your browser does not support speech recognition."
        );

        return;
    }


    if (wakeWordMode) {

        showToast(
            "Wake mode active",
            'Disable "Hey PA" before using normal microphone mode.'
        );

        return;
    }


    if (isListening) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                error
            );
        }

        return;
    }


    try {

        recognition.continuous =
            false;

        recognition.interimResults =
            true;

        recognition.start();

    } catch (error) {

        console.error(
            "Could not start recognition:",
            error
        );
    }
}


function submitVoiceCommand(
    text
) {

    if (!text) {
        return;
    }


    if (messageInput) {

        messageInput.value =
            text;

        resizeTextarea();
    }


    if (chatForm) {

        chatForm.requestSubmit();

    } else {

        sendMessage(text);
    }
}


function stopListening() {

    isListening =
        false;


    const mic =
        $("#micBtn");


    if (mic) {

        mic.classList.remove(
            "recording"
        );
    }


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

let availableVoices = [];


function setupSpeechSynthesis() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    loadVoices();


    speechSynthesis.addEventListener(
        "voiceschanged",
        loadVoices
    );


    if (voiceSelect) {

        voiceSelect.addEventListener(
            "change",
            () => {

                state.selectedVoice =
                    voiceSelect.value;

                saveState();
            }
        );
    }
}


function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        return;
    }


    availableVoices =
        speechSynthesis.getVoices();


    if (!voiceSelect) {
        return;
    }


    const previous =
        state.selectedVoice;


    voiceSelect.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";

    defaultOption.textContent =
        "Default voice";


    voiceSelect.appendChild(
        defaultOption
    );


    availableVoices.forEach(
        (voice) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                voice.name;


            option.textContent =
                `${voice.name} (${voice.lang})`;


            if (
                voice.name === previous
            ) {

                option.selected =
                    true;
            }


            voiceSelect.appendChild(
                option
            );
        }
    );
}


function speakText(text) {

    if (
        !state.speakResponses
    ) {

        if (wakeWordMode) {
            resumeWakeWordMode();
        }

        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        if (wakeWordMode) {
            resumeWakeWordMode();
        }

        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    const selected =
        availableVoices.find(
            (voice) =>
                voice.name ===
                state.selectedVoice
        );


    if (selected) {

        utterance.voice =
            selected;
    }


    utterance.onstart =
        () => {

            setAssistantStatus(
                "Speaking..."
            );
        };


    utterance.onerror =
        (error) => {

            console.warn(
                "Speech synthesis error:",
                error
            );

            if (wakeWordMode) {
                resumeWakeWordMode();
            } else {
                setAssistantStatus(
                    "Ready to help"
                );
            }
        };


    utterance.onend =
        () => {

            if (
                wakeWordMode
            ) {

                resumeWakeWordMode();

            } else {

                setAssistantStatus(
                    "Ready to help"
                );
            }
        };


    speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   MICROPHONE TEST
========================================================= */

function setupVoiceTest() {

    if (!voiceTestBtn) {
        return;
    }


    voiceTestBtn.addEventListener(
        "click",
        testMicrophone
    );
}


async function testMicrophone() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showToast(
            "Microphone unavailable",
            "This browser does not provide microphone access."
        );

        return;
    }


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: true
                }
            );


        stream
            .getTracks()
            .forEach(
                (track) =>
                    track.stop()
            );


        if (voiceStatus) {

            voiceStatus.textContent =
                "Microphone is working.";
        }


        showToast(
            "Microphone ready",
            "Your browser can access the microphone."
        );


    } catch (error) {

        console.error(
            "Microphone test failed:",
            error
        );


        if (voiceStatus) {

            voiceStatus.textContent =
                "Microphone permission denied or unavailable.";
        }


        showToast(
            "Microphone error",
            "Please allow microphone access in your browser."
        );
    }
}


/* =========================================================
   PERSONAL VOICE RECORDING
========================================================= */

function setupVoiceRecording() {

    if (!recordVoiceBtn) {
        return;
    }


    recordVoiceBtn.addEventListener(
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

        stopVoiceRecording();

        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        showToast(
            "Recording unavailable",
            "Your browser does not support audio recording."
        );

        return;
    }


    try {

        recordingStream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio: true
                }
            );


        recordedChunks =
            [];


        mediaRecorder =
            new MediaRecorder(
                recordingStream
            );


        mediaRecorder.ondataavailable =
            (event) => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    recordedChunks.push(
                        event.data
                    );
                }
            };


        mediaRecorder.onstop =
            () => {

                const blob =
                    new Blob(
                        recordedChunks,
                        {
                            type:
                                mediaRecorder.mimeType ||
                                "audio/webm"
                        }
                    );


                const size =
                    Math.round(
                        blob.size / 1024
                    );


                if (recordingStatus) {

                    recordingStatus.textContent =
                        `Voice sample recorded (${size} KB).`;
                }


                if (
                    recordingStream
                ) {

                    recordingStream
                        .getTracks()
                        .forEach(
                            (track) =>
                                track.stop()
                        );
                }


                mediaRecorder =
                    null;

                recordingStream =
                    null;
            };


        mediaRecorder.start();


        if (recordingStatus) {

            recordingStatus.textContent =
                "Recording... Click again to stop.";
        }


        recordVoiceBtn.textContent =
            "Stop recording";


    } catch (error) {

        console.error(
            "Voice recording failed:",
            error
        );


        if (recordingStatus) {

            recordingStatus.textContent =
                "Unable to start recording.";
        }
    }
}


function stopVoiceRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state ===
            "recording"
    ) {

        mediaRecorder.stop();
    }


    if (recordVoiceBtn) {

        recordVoiceBtn.textContent =
            "Record voice sample";
    }
}


/* =========================================================
   WAKE WORD
========================================================= */

function setupWakeWord() {

    if (!wakeWordBtn) {
        return;
    }


    wakeWordBtn.addEventListener(
        "click",
        toggleWakeWord
    );


    updateWakeWordUI();
}


function toggleWakeWord() {

    if (!recognition) {

        showToast(
            "Wake word unavailable",
            "Speech recognition is not supported by this browser."
        );

        return;
    }


    if (wakeWordMode) {

        disableWakeWord();

    } else {

        enableWakeWord();
    }
}


function enableWakeWord() {

    wakeWordMode =
        true;

    waitingForCommand =
        false;


    updateWakeWordUI();


    showToast(
        "Hey PA enabled",
        'Say "Hey PA" to activate your assistant.'
    );


    setAssistantStatus(
        'Listening for "Hey PA"...'
    );


    startWakeRecognition();
}


function disableWakeWord() {

    wakeWordMode =
        false;

    waitingForCommand =
        false;


    clearTimeout(
        recognitionRestartTimer
    );


    recognitionRestartTimer =
        null;


    if (
        recognition &&
        isListening
    ) {

        try {

            recognition.stop();

        } catch (error) {

            console.warn(
                error
            );
        }
    }


    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();
    }


    isListening =
        false;


    updateWakeWordUI();


    setAssistantStatus(
        "Ready to help"
    );


    if (voiceStatus) {

        voiceStatus.textContent =
            "Microphone not active";
    }


    showToast(
        "Hey PA disabled",
        "Wake word mode is off."
    );
}


function updateWakeWordUI() {

    if (wakeWordBtn) {

        wakeWordBtn.textContent =
            wakeWordMode
                ? 'Disable "Hey PA"'
                : 'Enable "Hey PA"';
    }


    if (wakeWordStatus) {

        wakeWordStatus.textContent =
            wakeWordMode
                ? 'Wake word is active — say "Hey PA"'
                : "Wake word is off";
    }
}


function startWakeRecognition() {

    if (
        !wakeWordMode ||
        waitingForCommand ||
        isListening ||
        !recognition
    ) {

        return;
    }


    clearTimeout(
        recognitionRestartTimer
    );


    try {

        recognition.continuous =
            false;

        recognition.interimResults =
            true;

        recognition.start();

    } catch (error) {

        console.warn(
            "Wake recognition could not start:",
            error
        );


        scheduleWakeListening();
    }
}


function scheduleWakeListening() {

    if (!wakeWordMode) {
        return;
    }


    clearTimeout(
        recognitionRestartTimer
    );


    recognitionRestartTimer =
        setTimeout(
            () => {

                if (
                    !wakeWordMode ||
                    waitingForCommand ||
                    isListening
                ) {

                    return;
                }


                startWakeRecognition();

            },
            700
        );
}


function resumeWakeWordMode() {

    if (!wakeWordMode) {
        return;
    }


    waitingForCommand =
        false;


    setAssistantStatus(
        'Listening for "Hey PA"...'
    );


    if (voiceStatus) {

        voiceStatus.textContent =
            'Listening for "Hey PA"...';
    }


    scheduleWakeListening();
}


function handleWakeWordResult(
    text
) {

    const normalized =
        text
            .toLowerCase()
            .replace(
                /[.,!?]/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    const matchedWakeWord =
        WAKE_WORDS.find(
            (word) =>
                normalized === word ||
                normalized.startsWith(
                    word + " "
                )
        );


    if (!matchedWakeWord) {

        return;
    }


    let command =
        normalized
            .slice(
                matchedWakeWord.length
            )
            .trim();


    if (!command) {

        waitingForCommand =
            true;


        setAssistantStatus(
            "I'm listening..."
        );


        if (voiceStatus) {

            voiceStatus.textContent =
                "Wake word detected. Ask your question.";
        }


        speakWakeConfirmation();


        return;
    }


    waitingForCommand =
        false;


    submitVoiceCommand(
        command
    );
}


function speakWakeConfirmation() {

    if (
        !state.speakResponses ||
        !("speechSynthesis" in window)
    ) {

        startCommandRecognition();

        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            "Yes?"
        );


    utterance.rate =
        1;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onend =
        () => {

            startCommandRecognition();
        };


    utterance.onerror =
        () => {

            startCommandRecognition();
        };


    speechSynthesis.speak(
        utterance
    );
}


function startCommandRecognition() {

    if (
        !wakeWordMode ||
        !waitingForCommand ||
        !recognition
    ) {

        return;
    }


    try {

        recognition.continuous =
            false;

        recognition.interimResults =
            true;

        recognition.start();

    } catch (error) {

        console.warn(
            "Command recognition could not start:",
            error
        );


        setTimeout(
            () => {

                if (
                    wakeWordMode &&
                    waitingForCommand
                ) {

                    startCommandRecognition();
                }
            },
            500
        );
    }
}


/* =========================================================
   CONFIRMATION MODAL
========================================================= */

function initializeConfirmation() {

    const cancelButtons =
        $$(
            "#cancelConfirmation, [data-action='cancel-confirmation']"
        );


    cancelButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                closeConfirmation
            );
        }
    );


    if (confirmationModal) {

        confirmationModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    confirmationModal
                ) {

                    closeConfirmation();
                }
            }
        );
    }
}


function openConfirmation() {

    if (confirmationModal) {

        confirmationModal.classList.remove(
            "hidden"
        );
    }
}


function closeConfirmation() {

    if (confirmationModal) {

        confirmationModal.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   BACKEND HEALTH
========================================================= */

async function checkBackend() {

    try {

        const response =
            await fetch(
                "/api/health",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (
            data &&
            data.ok
        ) {

            setConnectionStatus(
                "Connected"
            );

        } else {

            setConnectionStatus(
                "Limited"
            );
        }


    } catch (error) {

        console.warn(
            "Backend health check failed:",
            error
        );


        setConnectionStatus(
            "Offline"
        );
    }
}


function setConnectionStatus(
    status
) {

    if (connectionText) {

        connectionText.textContent =
            status;
    }
}


/* =========================================================
   USER ID
========================================================= */

function getUserId() {

    const storageKey =
        "personalAIUserId";


    let userId =
        localStorage.getItem(
            storageKey
        );


    if (!userId) {

        if (
            window.crypto &&
            typeof crypto.randomUUID ===
                "function"
        ) {

            userId =
                crypto.randomUUID();

        } else {

            userId =
                "user-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2);
        }


        localStorage.setItem(
            storageKey,
            userId
        );
    }


    return userId;
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
        typeof action ===
        "string"
    ) {

        if (
            action ===
            "new_chat"
        ) {

            startNewChat();
        }

        return;
    }


    if (
        typeof action !==
        "object"
    ) {

        return;
    }


    if (
        action.type ===
        "task"
    ) {

        const title =
            action.title ||
            action.text;


        if (title) {

            state.tasks.push({

                id:
                    Date.now().toString(),

                title,

                completed:
                    false,

                createdAt:
                    Date.now()
            });


            saveState();

            renderTasks();
        }
    }
}


/* =========================================================
   FORMATTING HELPERS
========================================================= */

function formatTime(
    timestamp
) {

    try {

        return new Date(
            timestamp
        ).toLocaleTimeString(
            [],
            {
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return "";
    }
}


function formatDate(
    timestamp
) {

    try {

        return new Date(
            timestamp
        ).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch (error) {

        return "";
    }
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "k"
        ) {

            event.preventDefault();


            if (messageInput) {

                messageInput.focus();
            }
        }


        if (
            event.key ===
            "Escape"
        ) {

            closeSettings();

            closeConfirmation();


            if (profileMenu) {

                profileMenu.classList.add(
                    "hidden"
                );
            }


            if (notificationPanel) {

                notificationPanel.classList.add(
                    "hidden"
                );
            }
        }
    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible" &&
            wakeWordMode &&
            !waitingForCommand
        ) {

            scheduleWakeListening();
        }
    }
);


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearTimeout(
            recognitionRestartTimer
        );


        if (
            recognition &&
            isListening
        ) {

            try {

                recognition.stop();

            } catch (error) {

                console.warn(
                    error
                );
            }
        }


        if (
            recordingStream
        ) {

            recordingStream
                .getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );
        }


        if (
            "speechSynthesis" in window
        ) {

            speechSynthesis.cancel();
        }
    }
);


/* =========================================================
   DEBUG / PUBLIC API
========================================================= */

window.PersonalAI = {

    getState() {
        return state;
    },

    saveState,

    clearConversation() {

        state.conversation =
            [];

        saveState();

        if (chatMessages) {

            chatMessages.innerHTML =
                "";
        }
    },

    clearMemories() {

        state.memories =
            [];

        saveState();

        renderMemories();
    },

    clearTasks() {

        state.tasks =
            [];

        saveState();

        renderTasks();
    },

    checkBackend,

    startNewChat,

    enableWakeWord,

    disableWakeWord,

    speakText,

    stopListening,

    getUserId
};


/* =========================================================
   FINAL SAFETY CHECK
========================================================= */

console.log(
    "Personal AI PA frontend loaded successfully."
);
