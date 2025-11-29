// Keep Notes Application - Enhanced Version

class KeepNotes {
    constructor() {
        this.notes = [];
        this.trash = [];
        this.archive = [];
        this.labels = [];
        this.selectedColor = '#ffffff';
        this.selectedType = 'text';
        this.pendingImages = [];
        this.pendingDocuments = [];
        this.pendingLabels = [];
        this.editingNoteId = null;
        this.isReadOnlyMode = false;
        this.isDarkMode = false;
        this.searchQuery = '';
        this.activeLabel = null;
        this.currentView = 'notes'; // 'notes', 'reminders', 'archive', 'trash'
        this.labelPickerTarget = null; // 'new' or 'edit'
        this.sidebarOpen = window.innerWidth >= 1024; // Sidebar state

        // App customization settings
        this.appSettings = {
            appName: 'Keep Notes',
            logoType: 'icon', // 'icon' or 'image'
            selectedIcon: 'lightbulb',
            iconColor: '#fbbc04',
            customLogoData: null,
            googleClientId: null
        };

        // Google Sign-In state
        this.googleInitialized = false;

        // Google Drive sync state
        this.driveInitialized = false;
        this.driveAccessToken = null;
        this.driveFolderId = null;
        this.driveNotesFolderId = null;
        this.driveAttachmentsFolderId = null;
        this.driveFileId = null;
        this.lastSyncTime = null;
        this.syncInProgress = false;

        // Authentication state
        this.currentUser = null;
        this.registeredUsers = []; // Store registered users locally
        this.showGlobalNotes = false; // Toggle for showing global notes when logged in

        this.init();
    }

    init() {
        // Check for OAuth callback first
        this.handleOAuthCallback();

        this.loadAuthState();
        this.loadData();
        this.loadAppSettings();
        this.bindEvents();
        this.renderAll();
        this.loadPreferences();
        this.createToast();
        this.cleanupTrash();
        this.updateAuthUI();
        this.initGoogleSignIn();
    }

    // DOM Elements
    get elements() {
        return {
            // Search
            searchInput: document.getElementById('searchInput'),
            searchClear: document.getElementById('searchClear'),

            // Note input
            noteTitle: document.getElementById('noteTitle'),
            noteContent: document.getElementById('noteContent'),
            noteType: document.getElementById('noteType'),
            addNoteBtn: document.getElementById('addNoteBtn'),
            noteInputContainer: document.getElementById('noteInputContainer'),

            // Notes containers
            notesContainer: document.getElementById('notesContainer'),
            pinnedNotesContainer: document.getElementById('pinnedNotesContainer'),
            pinnedSection: document.getElementById('pinnedSection'),
            otherSection: document.getElementById('otherSection'),
            otherSectionTitle: document.getElementById('otherSectionTitle'),

            // Header controls
            readOnlyToggle: document.getElementById('readOnlyToggle'),
            modeLabel: document.getElementById('modeLabel'),
            darkModeToggle: document.getElementById('darkModeToggle'),
            exportBtn: document.getElementById('exportBtn'),
            importBtn: document.getElementById('importBtn'),
            importFile: document.getElementById('importFile'),
            driveSyncBtn: document.getElementById('driveSyncBtn'),
            driveSyncText: document.getElementById('driveSyncText'),
            syncStatus: document.getElementById('syncStatus'),

            // View toggle
            viewNotes: document.getElementById('viewNotes'),
            viewTrash: document.getElementById('viewTrash'),
            trashHeader: document.getElementById('trashHeader'),
            emptyTrashBtn: document.getElementById('emptyTrashBtn'),

            // Edit modal
            editModal: document.getElementById('editModal'),
            modalContent: document.getElementById('modalContent'),
            editTitle: document.getElementById('editTitle'),
            editContent: document.getElementById('editContent'),
            editNoteType: document.getElementById('editNoteType'),
            deleteNoteBtn: document.getElementById('deleteNoteBtn'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            modalPinBtn: document.getElementById('modalPinBtn'),
            modalAddLabelBtn: document.getElementById('modalAddLabelBtn'),
            modalLabelsContainer: document.getElementById('modalLabelsContainer'),
            modalLabelsList: document.getElementById('modalLabelsList'),

            // Color buttons
            colorBtns: document.querySelectorAll('.color-btn:not(.modal-color)'),
            modalColorBtns: document.querySelectorAll('.modal-color'),

            // Images
            addImageBtn: document.getElementById('addImageBtn'),
            imageInput: document.getElementById('imageInput'),
            imagePreviewContainer: document.getElementById('imagePreviewContainer'),
            imagePreviewList: document.getElementById('imagePreviewList'),
            modalAddImageBtn: document.getElementById('modalAddImageBtn'),
            modalImageInput: document.getElementById('modalImageInput'),
            modalImageContainer: document.getElementById('modalImageContainer'),
            modalImageList: document.getElementById('modalImageList'),
            imageViewerModal: document.getElementById('imageViewerModal'),
            imageViewerImg: document.getElementById('imageViewerImg'),
            imageViewerClose: document.getElementById('imageViewerClose'),

            // Documents
            addDocumentBtn: document.getElementById('addDocumentBtn'),
            documentInput: document.getElementById('documentInput'),
            documentPreviewContainer: document.getElementById('documentPreviewContainer'),
            documentPreviewList: document.getElementById('documentPreviewList'),
            modalAddDocumentBtn: document.getElementById('modalAddDocumentBtn'),
            modalDocumentInput: document.getElementById('modalDocumentInput'),
            modalDocumentContainer: document.getElementById('modalDocumentContainer'),
            modalDocumentList: document.getElementById('modalDocumentList'),

            // Labels
            sidebar: document.getElementById('sidebar'),
            labelsList: document.getElementById('labelsList'),
            addLabelBtn: document.getElementById('addLabelBtn'),
            addLabelToNoteBtn: document.getElementById('addLabelToNoteBtn'),
            newNoteLabels: document.getElementById('newNoteLabels'),
            newNoteLabelsList: document.getElementById('newNoteLabelsList'),

            // Label picker modal
            labelPickerModal: document.getElementById('labelPickerModal'),
            labelSearchInput: document.getElementById('labelSearchInput'),
            labelPickerList: document.getElementById('labelPickerList'),
            createLabelFromPicker: document.getElementById('createLabelFromPicker'),
            newLabelName: document.getElementById('newLabelName'),

            // Create label modal
            createLabelModal: document.getElementById('createLabelModal'),
            newLabelInput: document.getElementById('newLabelInput'),
            cancelCreateLabel: document.getElementById('cancelCreateLabel'),
            confirmCreateLabel: document.getElementById('confirmCreateLabel'),

            // Filters
            activeFilters: document.getElementById('activeFilters'),
            filterTags: document.getElementById('filterTags'),
            clearFilters: document.getElementById('clearFilters'),

            // Shortcuts modal
            shortcutsBtn: document.getElementById('shortcutsBtn'),
            shortcutsModal: document.getElementById('shortcutsModal'),
            closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),

            // Settings
            settingsBtn: document.getElementById('settingsBtn'),
            settingsModal: document.getElementById('settingsModal'),
            appNameInput: document.getElementById('appNameInput'),
            appTitle: document.getElementById('appTitle'),
            pageTitle: document.getElementById('pageTitle'),
            logoSvg: document.getElementById('logoSvg'),
            logoImage: document.getElementById('logoImage'),
            logoTypeIcon: document.getElementById('logoTypeIcon'),
            logoTypeImage: document.getElementById('logoTypeImage'),
            iconPicker: document.getElementById('iconPicker'),
            imageUploadSection: document.getElementById('imageUploadSection'),
            customLogoPreview: document.getElementById('customLogoPreview'),
            uploadLogoBtn: document.getElementById('uploadLogoBtn'),
            removeLogoBtn: document.getElementById('removeLogoBtn'),
            logoFileInput: document.getElementById('logoFileInput'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            iconOptions: document.querySelectorAll('.icon-option'),
            iconColorBtns: document.querySelectorAll('.icon-color-btn'),
            googleClientIdInput: document.getElementById('googleClientIdInput'),
            googleStatusHint: document.getElementById('googleStatusHint'),

            // Auth
            authBtn: document.getElementById('authBtn'),
            authBtnText: document.getElementById('authBtnText'),
            userMenu: document.getElementById('userMenu'),
            userAvatar: document.getElementById('userAvatar'),
            userInitial: document.getElementById('userInitial'),
            userDropdown: document.getElementById('userDropdown'),
            userInitialLarge: document.getElementById('userInitialLarge'),
            userName: document.getElementById('userName'),
            userEmail: document.getElementById('userEmail'),
            signOutBtn: document.getElementById('signOutBtn'),
            showGlobalNotesCheckbox: document.getElementById('showGlobalNotes'),
            globalNotesToggle: document.getElementById('globalNotesToggle'),
            authModal: document.getElementById('authModal'),
            authCloseBtn: document.getElementById('authCloseBtn'),
            signInView: document.getElementById('signInView'),
            signUpView: document.getElementById('signUpView'),
            googleSignInBtn: document.getElementById('googleSignInBtn'),
            googleSignUpBtn: document.getElementById('googleSignUpBtn'),
            signInForm: document.getElementById('signInForm'),
            signInEmail: document.getElementById('signInEmail'),
            signInPassword: document.getElementById('signInPassword'),
            signUpForm: document.getElementById('signUpForm'),
            signUpName: document.getElementById('signUpName'),
            signUpEmail: document.getElementById('signUpEmail'),
            signUpPassword: document.getElementById('signUpPassword'),
            showSignUpBtn: document.getElementById('showSignUpBtn'),
            showSignInBtn: document.getElementById('showSignInBtn'),
            anonymousSignInBtn: document.getElementById('anonymousSignInBtn'),

            // Sidebar navigation
            menuBtn: document.getElementById('menuBtn'),
            navNotes: document.getElementById('navNotes'),
            navReminders: document.getElementById('navReminders'),
            navArchive: document.getElementById('navArchive'),
            navTrash: document.getElementById('navTrash'),
            editLabelsBtn: document.getElementById('editLabelsBtn'),
            remindersHeader: document.getElementById('remindersHeader'),
            archiveHeader: document.getElementById('archiveHeader')
        };
    }

    bindEvents() {
        const els = this.elements;

        // Search
        els.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        els.searchClear.addEventListener('click', () => this.clearSearch());

        // Add note
        els.addNoteBtn.addEventListener('click', () => this.addNote());
        els.noteContent.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.addNote();
            }
        });

        // Auto-detect type
        els.noteContent.addEventListener('input', () => {
            const detectedType = this.detectContentType(els.noteContent.value);
            if (detectedType !== 'text' && els.noteType.value === 'text') {
                els.noteType.value = detectedType;
                this.updateTextareaMode(els.noteContent, detectedType);
            }
        });

        // Type selector
        els.noteType.addEventListener('change', () => {
            this.selectedType = els.noteType.value;
            this.updateTextareaMode(els.noteContent, this.selectedType);
        });

        // Color picker
        els.colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedColor = btn.dataset.color;
                els.colorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Modal color picker
        els.modalColorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isReadOnlyMode) return;
                const color = btn.dataset.color;
                els.modalContent.style.backgroundColor = color;
                els.modalColorBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                if (this.editingNoteId) {
                    const note = this.notes.find(n => n.id === this.editingNoteId);
                    if (note) {
                        note.color = color;
                        this.saveData();
                        this.renderNotes();
                    }
                }
            });
        });

        // Modal type selector
        els.editNoteType.addEventListener('change', () => {
            if (this.editingNoteId && !this.isReadOnlyMode) {
                const note = this.notes.find(n => n.id === this.editingNoteId);
                if (note) {
                    note.type = els.editNoteType.value;
                    this.updateTextareaMode(els.editContent, note.type);
                    this.saveData();
                    this.renderNotes();
                }
            }
        });

        // Modal pin button
        els.modalPinBtn.addEventListener('click', () => this.togglePinFromModal());

        // Modal label button
        els.modalAddLabelBtn.addEventListener('click', () => this.openLabelPicker('edit'));

        // Read-only toggle
        els.readOnlyToggle.addEventListener('change', () => this.toggleReadOnlyMode());

        // Dark mode toggle
        els.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

        // Menu button (sidebar toggle)
        els.menuBtn.addEventListener('click', () => this.toggleSidebar());

        // Sidebar navigation
        els.navNotes.addEventListener('click', () => this.switchView('notes'));
        els.navReminders.addEventListener('click', () => this.switchView('reminders'));
        els.navArchive.addEventListener('click', () => this.switchView('archive'));
        els.navTrash.addEventListener('click', () => this.switchView('trash'));
        els.editLabelsBtn?.addEventListener('click', () => this.openCreateLabelModal());

        // Legacy view toggle (keeping for compatibility)
        els.viewNotes.addEventListener('click', () => this.switchView('notes'));
        els.viewTrash.addEventListener('click', () => this.switchView('trash'));
        els.emptyTrashBtn.addEventListener('click', () => this.emptyTrash());

        // Modal events
        els.closeModalBtn.addEventListener('click', () => this.closeModal());
        els.deleteNoteBtn.addEventListener('click', () => this.deleteNote());
        els.editModal.addEventListener('click', (e) => {
            if (e.target === els.editModal) this.closeModal();
        });

        // Save changes when editing
        els.editTitle.addEventListener('input', () => this.updateNote());
        els.editContent.addEventListener('input', () => this.updateNote());

        // Export/Import
        els.exportBtn.addEventListener('click', () => this.exportNotes());
        els.importBtn.addEventListener('click', () => els.importFile.click());
        els.importFile.addEventListener('change', (e) => this.importNotes(e));

        // Drive Sync
        els.driveSyncBtn.addEventListener('click', () => this.handleDriveSync());

        // Images - new note
        els.addImageBtn.addEventListener('click', () => els.imageInput.click());
        els.imageInput.addEventListener('change', (e) => this.handleNewNoteImages(e));

        // Images - modal
        els.modalAddImageBtn.addEventListener('click', () => {
            if (!this.isReadOnlyMode) els.modalImageInput.click();
        });
        els.modalImageInput.addEventListener('change', (e) => this.handleModalImages(e));

        // Image viewer
        els.imageViewerClose.addEventListener('click', () => this.closeImageViewer());
        els.imageViewerModal.addEventListener('click', (e) => {
            if (e.target === els.imageViewerModal) this.closeImageViewer();
        });

        // Documents - new note
        els.addDocumentBtn.addEventListener('click', () => els.documentInput.click());
        els.documentInput.addEventListener('change', (e) => this.handleNewNoteDocuments(e));

        // Documents - modal
        els.modalAddDocumentBtn.addEventListener('click', () => {
            if (!this.isReadOnlyMode) els.modalDocumentInput.click();
        });
        els.modalDocumentInput.addEventListener('change', (e) => this.handleModalDocuments(e));

        // Labels - sidebar
        els.addLabelBtn.addEventListener('click', () => this.openCreateLabelModal());

        // Labels - new note
        els.addLabelToNoteBtn.addEventListener('click', () => this.openLabelPicker('new'));

        // Label picker modal
        els.labelSearchInput.addEventListener('input', () => this.filterLabelPicker());
        els.createLabelFromPicker.addEventListener('click', () => this.createLabelFromPicker());
        els.labelPickerModal.addEventListener('click', (e) => {
            if (e.target === els.labelPickerModal) this.closeLabelPicker();
        });

        // Create label modal
        els.cancelCreateLabel.addEventListener('click', () => this.closeCreateLabelModal());
        els.confirmCreateLabel.addEventListener('click', () => this.createLabel());
        els.newLabelInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.createLabel();
        });
        els.createLabelModal.addEventListener('click', (e) => {
            if (e.target === els.createLabelModal) this.closeCreateLabelModal();
        });

        // Filters
        els.clearFilters.addEventListener('click', () => this.clearFilters());

        // Shortcuts modal
        els.shortcutsBtn.addEventListener('click', () => this.openShortcutsModal());
        els.closeShortcutsBtn.addEventListener('click', () => this.closeShortcutsModal());
        els.shortcutsModal.addEventListener('click', (e) => {
            if (e.target === els.shortcutsModal) this.closeShortcutsModal();
        });

        // Settings modal
        els.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        els.closeSettingsBtn.addEventListener('click', () => this.closeSettingsModal());
        els.settingsModal.addEventListener('click', (e) => {
            if (e.target === els.settingsModal) this.closeSettingsModal();
        });
        els.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        // App name input
        els.appNameInput.addEventListener('input', (e) => this.updateAppName(e.target.value));

        // Logo type toggle
        els.logoTypeIcon.addEventListener('click', () => this.setLogoType('icon'));
        els.logoTypeImage.addEventListener('click', () => this.setLogoType('image'));

        // Icon selection
        els.iconOptions.forEach(btn => {
            btn.addEventListener('click', () => this.selectIcon(btn.dataset.icon));
        });

        // Icon color selection
        els.iconColorBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectIconColor(btn.dataset.color));
        });

        // Custom logo upload
        els.uploadLogoBtn.addEventListener('click', () => els.logoFileInput.click());
        els.logoFileInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        els.removeLogoBtn.addEventListener('click', () => this.removeCustomLogo());

        // Google Client ID
        els.googleClientIdInput.addEventListener('change', (e) => this.updateGoogleClientId(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auth events
        els.authBtn.addEventListener('click', () => this.openAuthModal());
        els.authCloseBtn.addEventListener('click', () => this.closeAuthModal());
        els.authModal.addEventListener('click', (e) => {
            if (e.target === els.authModal) this.closeAuthModal();
        });
        els.showSignUpBtn.addEventListener('click', () => this.showSignUpView());
        els.showSignInBtn.addEventListener('click', () => this.showSignInView());
        els.signInForm.addEventListener('submit', (e) => this.handleSignIn(e));
        els.signUpForm.addEventListener('submit', (e) => this.handleSignUp(e));
        els.googleSignInBtn.addEventListener('click', () => this.handleGoogleSignIn());
        els.googleSignUpBtn.addEventListener('click', () => this.handleGoogleSignIn());
        els.anonymousSignInBtn.addEventListener('click', () => this.handleAnonymousSignIn());
        els.signOutBtn.addEventListener('click', () => this.handleSignOut());
        els.showGlobalNotesCheckbox.addEventListener('change', (e) => this.toggleGlobalNotes(e.target.checked));
    }

    // Keyboard shortcuts handler
    handleKeyboardShortcuts(e) {
        const els = this.elements;
        const isModalOpen = els.editModal.classList.contains('active') ||
                           els.labelPickerModal.classList.contains('active') ||
                           els.createLabelModal.classList.contains('active') ||
                           els.shortcutsModal.classList.contains('active') ||
                           els.settingsModal.classList.contains('active') ||
                           els.authModal.classList.contains('active');

        // Escape - close modals
        if (e.key === 'Escape') {
            if (els.imageViewerModal.classList.contains('active')) {
                this.closeImageViewer();
            } else if (els.authModal.classList.contains('active')) {
                this.closeAuthModal();
            } else if (els.settingsModal.classList.contains('active')) {
                this.closeSettingsModal();
            } else if (els.labelPickerModal.classList.contains('active')) {
                this.closeLabelPicker();
            } else if (els.createLabelModal.classList.contains('active')) {
                this.closeCreateLabelModal();
            } else if (els.shortcutsModal.classList.contains('active')) {
                this.closeShortcutsModal();
            } else if (els.editModal.classList.contains('active')) {
                this.closeModal();
            }
            return;
        }

        // Don't trigger shortcuts when typing in input fields (except for specific ones)
        if (document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA') {
            return;
        }

        // ? - Show shortcuts
        if (e.key === '?') {
            e.preventDefault();
            this.openShortcutsModal();
            return;
        }

        if (isModalOpen) return;

        // Ctrl/Cmd + N - New note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            els.noteContent.focus();
            return;
        }

        // Ctrl/Cmd + F - Search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            els.searchInput.focus();
            return;
        }

        // Ctrl/Cmd + D - Dark mode
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.toggleDarkMode();
            return;
        }

        // Ctrl/Cmd + E - Toggle edit/read-only
        if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !e.shiftKey) {
            e.preventDefault();
            els.readOnlyToggle.checked = !els.readOnlyToggle.checked;
            this.toggleReadOnlyMode();
            return;
        }

        // Ctrl/Cmd + Shift + E - Export
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            this.exportNotes();
            return;
        }

        // Ctrl/Cmd + Shift + I - Import
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            els.importFile.click();
            return;
        }
    }

    // Search functionality
    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        const els = this.elements;

        els.searchClear.style.display = query ? 'flex' : 'none';
        this.renderNotes();
    }

    clearSearch() {
        const els = this.elements;
        els.searchInput.value = '';
        this.searchQuery = '';
        els.searchClear.style.display = 'none';
        this.renderNotes();
    }

    // Filter notes based on search query and active label
    getFilteredNotes() {
        // Use combined notes (user + global if enabled) when logged in
        const allNotes = this.getCombinedNotes();
        let filtered = allNotes.filter(note => !note.deleted);

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(note => {
                const titleMatch = note.title.toLowerCase().includes(this.searchQuery);
                const contentMatch = note.content.toLowerCase().includes(this.searchQuery);
                return titleMatch || contentMatch;
            });
        }

        // Filter by active label
        if (this.activeLabel) {
            filtered = filtered.filter(note =>
                note.labels && note.labels.includes(this.activeLabel)
            );
        }

        return filtered;
    }

    // Highlight search matches
    highlightText(text, query) {
        if (!query || !text) return this.escapeHtml(text);

        const escaped = this.escapeHtml(text);
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return escaped.replace(regex, '<span class="search-highlight">$1</span>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // View switching
    switchView(view) {
        const els = this.elements;
        this.currentView = view;

        // Update sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Update legacy view toggle
        els.viewNotes.classList.remove('active');
        els.viewTrash.classList.remove('active');

        // Hide all view headers
        els.trashHeader.style.display = 'none';
        els.remindersHeader.style.display = 'none';
        els.archiveHeader.style.display = 'none';

        switch (view) {
            case 'notes':
                els.navNotes.classList.add('active');
                els.viewNotes.classList.add('active');
                els.noteInputContainer.style.display = 'block';
                break;
            case 'reminders':
                els.navReminders.classList.add('active');
                els.noteInputContainer.style.display = 'block';
                els.remindersHeader.style.display = 'flex';
                break;
            case 'archive':
                els.navArchive.classList.add('active');
                els.noteInputContainer.style.display = 'none';
                els.archiveHeader.style.display = 'flex';
                break;
            case 'trash':
                els.navTrash.classList.add('active');
                els.viewTrash.classList.add('active');
                els.noteInputContainer.style.display = 'none';
                els.trashHeader.style.display = 'flex';
                break;
        }

        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
            this.closeSidebar();
        }

        this.renderNotes();
    }

    // Toggle sidebar
    toggleSidebar() {
        const els = this.elements;
        this.sidebarOpen = !this.sidebarOpen;
        els.sidebar.classList.toggle('open', this.sidebarOpen);
        document.body.classList.toggle('sidebar-collapsed', !this.sidebarOpen);
    }

    // Close sidebar
    closeSidebar() {
        const els = this.elements;
        this.sidebarOpen = false;
        els.sidebar.classList.remove('open');
        document.body.classList.add('sidebar-collapsed');
    }

    // Dark mode
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        localStorage.setItem('keepNotes_darkMode', this.isDarkMode);
        this.showToast(this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
    }

    // Read-only mode
    toggleReadOnlyMode() {
        const els = this.elements;
        this.isReadOnlyMode = els.readOnlyToggle.checked;

        if (this.isReadOnlyMode) {
            document.body.classList.add('read-only-mode');
            els.modeLabel.textContent = 'Read Only';
        } else {
            document.body.classList.remove('read-only-mode');
            els.modeLabel.textContent = 'Edit Mode';
        }

        localStorage.setItem('keepNotes_readOnlyMode', this.isReadOnlyMode);
        this.renderNotes();
    }

    // Labels functionality
    openCreateLabelModal() {
        const els = this.elements;
        els.newLabelInput.value = '';
        els.createLabelModal.classList.add('active');
        els.newLabelInput.focus();
    }

    closeCreateLabelModal() {
        this.elements.createLabelModal.classList.remove('active');
    }

    createLabel() {
        const els = this.elements;
        const name = els.newLabelInput.value.trim();

        if (!name) return;
        if (this.labels.includes(name)) {
            this.showToast('Label already exists');
            return;
        }

        this.labels.push(name);
        this.saveData();
        this.renderLabels();
        this.closeCreateLabelModal();
        this.showToast('Label created');
    }

    deleteLabel(name) {
        this.labels = this.labels.filter(l => l !== name);

        // Remove label from all notes
        this.notes.forEach(note => {
            if (note.labels) {
                note.labels = note.labels.filter(l => l !== name);
            }
        });

        if (this.activeLabel === name) {
            this.activeLabel = null;
        }

        this.saveData();
        this.renderAll();
        this.showToast('Label deleted');
    }

    filterByLabel(label) {
        if (this.activeLabel === label) {
            this.activeLabel = null;
        } else {
            this.activeLabel = label;
        }
        this.renderAll();
    }

    openLabelPicker(target) {
        this.labelPickerTarget = target;
        const els = this.elements;
        els.labelSearchInput.value = '';
        els.labelPickerModal.classList.add('active');
        els.labelSearchInput.focus();
        this.renderLabelPicker();
    }

    closeLabelPicker() {
        this.elements.labelPickerModal.classList.remove('active');
        this.labelPickerTarget = null;
    }

    renderLabelPicker() {
        const els = this.elements;
        const searchTerm = els.labelSearchInput.value.toLowerCase().trim();

        let currentLabels = [];
        if (this.labelPickerTarget === 'new') {
            currentLabels = this.pendingLabels;
        } else if (this.labelPickerTarget === 'edit' && this.editingNoteId) {
            const note = this.notes.find(n => n.id === this.editingNoteId);
            currentLabels = note?.labels || [];
        }

        const filteredLabels = this.labels.filter(label =>
            label.toLowerCase().includes(searchTerm)
        );

        els.labelPickerList.innerHTML = filteredLabels.map(label => `
            <div class="label-picker-item" data-label="${this.escapeHtml(label)}">
                <input type="checkbox" ${currentLabels.includes(label) ? 'checked' : ''}>
                <span>${this.escapeHtml(label)}</span>
            </div>
        `).join('');

        // Show create button if search doesn't match existing label
        const exactMatch = this.labels.some(l => l.toLowerCase() === searchTerm);
        if (searchTerm && !exactMatch) {
            els.createLabelFromPicker.style.display = 'flex';
            els.newLabelName.textContent = searchTerm;
        } else {
            els.createLabelFromPicker.style.display = 'none';
        }

        // Add click handlers
        els.labelPickerList.querySelectorAll('.label-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                const label = item.dataset.label;
                this.toggleLabelOnNote(label);
            });
        });
    }

    filterLabelPicker() {
        this.renderLabelPicker();
    }

    createLabelFromPicker() {
        const els = this.elements;
        const name = els.labelSearchInput.value.trim();

        if (!name || this.labels.includes(name)) return;

        this.labels.push(name);
        this.toggleLabelOnNote(name);
        els.labelSearchInput.value = '';
        this.saveData();
        this.renderLabels();
        this.renderLabelPicker();
    }

    toggleLabelOnNote(label) {
        if (this.labelPickerTarget === 'new') {
            if (this.pendingLabels.includes(label)) {
                this.pendingLabels = this.pendingLabels.filter(l => l !== label);
            } else {
                this.pendingLabels.push(label);
            }
            this.renderPendingLabels();
        } else if (this.labelPickerTarget === 'edit' && this.editingNoteId) {
            const note = this.notes.find(n => n.id === this.editingNoteId);
            if (note) {
                if (!note.labels) note.labels = [];
                if (note.labels.includes(label)) {
                    note.labels = note.labels.filter(l => l !== label);
                } else {
                    note.labels.push(label);
                }
                this.saveData();
                this.renderModalLabels(note.labels);
                this.renderNotes();
            }
        }
        this.renderLabelPicker();
    }

    renderPendingLabels() {
        const els = this.elements;
        if (this.pendingLabels.length === 0) {
            els.newNoteLabels.style.display = 'none';
            return;
        }

        els.newNoteLabels.style.display = 'block';
        els.newNoteLabelsList.innerHTML = this.pendingLabels.map(label => `
            <span class="note-label">
                ${this.escapeHtml(label)}
                <button onclick="keepNotes.removePendingLabel('${this.escapeHtml(label)}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </span>
        `).join('');
    }

    removePendingLabel(label) {
        this.pendingLabels = this.pendingLabels.filter(l => l !== label);
        this.renderPendingLabels();
    }

    renderModalLabels(labels) {
        const els = this.elements;
        if (!labels || labels.length === 0) {
            els.modalLabelsList.innerHTML = '';
            return;
        }

        els.modalLabelsList.innerHTML = labels.map(label => `
            <span class="note-label">
                ${this.escapeHtml(label)}
                <button onclick="keepNotes.removeModalLabel('${this.escapeHtml(label)}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </span>
        `).join('');
    }

    removeModalLabel(label) {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (note && note.labels) {
            note.labels = note.labels.filter(l => l !== label);
            this.saveData();
            this.renderModalLabels(note.labels);
            this.renderNotes();
        }
    }

    // Pinned notes
    togglePin(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.pinned = !note.pinned;
            this.saveData();
            this.renderNotes();
            this.showToast(note.pinned ? 'Note pinned' : 'Note unpinned');
        }
    }

    togglePinFromModal() {
        if (this.editingNoteId && !this.isReadOnlyMode) {
            this.togglePin(this.editingNoteId);
            this.updateModalPinButton();
        }
    }

    updateModalPinButton() {
        const note = this.notes.find(n => n.id === this.editingNoteId);
        const els = this.elements;
        if (note) {
            els.modalPinBtn.classList.toggle('active', note.pinned);
        }
    }

    // Trash functionality
    moveToTrash(noteId) {
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const note = this.notes[noteIndex];
            note.deletedAt = new Date().toISOString();
            this.trash.push(note);
            this.notes.splice(noteIndex, 1);
            this.saveData();
            this.renderNotes();
            this.showToast('Note moved to trash');
        }
    }

    restoreFromTrash(noteId) {
        const noteIndex = this.trash.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const note = this.trash[noteIndex];
            delete note.deletedAt;
            this.notes.unshift(note);
            this.trash.splice(noteIndex, 1);
            this.saveData();
            this.renderNotes();
            this.showToast('Note restored');
        }
    }

    permanentlyDelete(noteId) {
        this.trash = this.trash.filter(n => n.id !== noteId);
        this.saveData();
        this.renderNotes();
        this.showToast('Note permanently deleted');
    }

    emptyTrash() {
        if (this.trash.length === 0) return;

        if (confirm('Are you sure you want to permanently delete all notes in trash?')) {
            this.trash = [];
            this.saveData();
            this.renderNotes();
            this.showToast('Trash emptied');
        }
    }

    cleanupTrash() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const originalLength = this.trash.length;
        this.trash = this.trash.filter(note => {
            const deletedAt = new Date(note.deletedAt);
            return deletedAt > thirtyDaysAgo;
        });

        if (this.trash.length !== originalLength) {
            this.saveData();
        }
    }

    // Clear filters
    clearFilters() {
        this.searchQuery = '';
        this.activeLabel = null;
        this.elements.searchInput.value = '';
        this.renderAll();
    }

    // Toast notifications
    createToast() {
        if (document.getElementById('toast')) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Shortcuts modal
    openShortcutsModal() {
        this.elements.shortcutsModal.classList.add('active');
    }

    closeShortcutsModal() {
        this.elements.shortcutsModal.classList.remove('active');
    }

    // Settings modal methods
    openSettingsModal() {
        const els = this.elements;
        els.appNameInput.value = this.appSettings.appName;

        // Set logo type buttons
        if (this.appSettings.logoType === 'icon') {
            els.logoTypeIcon.classList.add('active');
            els.logoTypeImage.classList.remove('active');
            els.iconPicker.style.display = 'flex';
            els.imageUploadSection.style.display = 'none';
        } else {
            els.logoTypeIcon.classList.remove('active');
            els.logoTypeImage.classList.add('active');
            els.iconPicker.style.display = 'none';
            els.imageUploadSection.style.display = 'flex';
        }

        // Update icon selection
        els.iconOptions.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === this.appSettings.selectedIcon);
        });

        // Update color selection
        els.iconColorBtns.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === this.appSettings.iconColor);
        });

        // Update custom logo preview
        this.updateCustomLogoPreview();

        // Update Google Client ID
        els.googleClientIdInput.value = this.appSettings.googleClientId || '';
        this.updateGoogleStatusHint();

        els.settingsModal.classList.add('active');
    }

    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('active');
    }

    updateAppName(name) {
        this.appSettings.appName = name || 'Keep Notes';
        this.applyAppSettings();
        this.saveAppSettings();
    }

    setLogoType(type) {
        const els = this.elements;
        this.appSettings.logoType = type;

        if (type === 'icon') {
            els.logoTypeIcon.classList.add('active');
            els.logoTypeImage.classList.remove('active');
            els.iconPicker.style.display = 'flex';
            els.imageUploadSection.style.display = 'none';
        } else {
            els.logoTypeIcon.classList.remove('active');
            els.logoTypeImage.classList.add('active');
            els.iconPicker.style.display = 'none';
            els.imageUploadSection.style.display = 'flex';
        }

        this.applyAppSettings();
        this.saveAppSettings();
    }

    selectIcon(iconName) {
        const els = this.elements;
        this.appSettings.selectedIcon = iconName;

        els.iconOptions.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === iconName);
        });

        this.applyAppSettings();
        this.saveAppSettings();
    }

    selectIconColor(color) {
        const els = this.elements;
        this.appSettings.iconColor = color;

        els.iconColorBtns.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === color);
        });

        this.applyAppSettings();
        this.saveAppSettings();
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            this.appSettings.customLogoData = event.target.result;
            this.updateCustomLogoPreview();
            this.applyAppSettings();
            this.saveAppSettings();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    updateCustomLogoPreview() {
        const els = this.elements;
        if (this.appSettings.customLogoData) {
            els.customLogoPreview.innerHTML = `<img src="${this.appSettings.customLogoData}" alt="Custom Logo">`;
            els.removeLogoBtn.style.display = 'block';
        } else {
            els.customLogoPreview.innerHTML = '<span>No image selected</span>';
            els.removeLogoBtn.style.display = 'none';
        }
    }

    removeCustomLogo() {
        this.appSettings.customLogoData = null;
        this.updateCustomLogoPreview();
        this.applyAppSettings();
        this.saveAppSettings();
    }

    resetSettings() {
        this.appSettings = {
            appName: 'Keep Notes',
            logoType: 'icon',
            selectedIcon: 'lightbulb',
            iconColor: '#fbbc04',
            customLogoData: null
        };
        this.applyAppSettings();
        this.saveAppSettings();
        this.openSettingsModal(); // Refresh the modal
        this.showToast('Settings reset to default');
    }

    loadAppSettings() {
        try {
            const saved = localStorage.getItem('keepNotes_appSettings');
            if (saved) {
                this.appSettings = { ...this.appSettings, ...JSON.parse(saved) };
            }
            this.applyAppSettings();
        } catch (e) {
            console.error('Error loading app settings:', e);
        }
    }

    saveAppSettings() {
        localStorage.setItem('keepNotes_appSettings', JSON.stringify(this.appSettings));
    }

    applyAppSettings() {
        const els = this.elements;

        // Update app title
        els.appTitle.textContent = this.appSettings.appName || 'Keep Notes';
        els.pageTitle.textContent = this.appSettings.appName || 'Keep Notes';

        // Update logo
        if (this.appSettings.logoType === 'image' && this.appSettings.customLogoData) {
            els.logoSvg.style.display = 'none';
            els.logoImage.src = this.appSettings.customLogoData;
            els.logoImage.style.display = 'block';
        } else {
            els.logoImage.style.display = 'none';
            els.logoSvg.style.display = 'block';
            els.logoSvg.style.color = this.appSettings.iconColor;
            els.logoSvg.innerHTML = this.getIconSvgPath(this.appSettings.selectedIcon);
        }
    }

    getIconSvgPath(iconName) {
        const icons = {
            lightbulb: '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>',
            note: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
            bookmark: '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>',
            folder: '<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>',
            star: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
            edit: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
            check: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
            pin: '<path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>'
        };
        return icons[iconName] || icons.lightbulb;
    }

    // ==================== Authentication Methods ====================

    // Load auth state from localStorage
    loadAuthState() {
        try {
            const savedUser = localStorage.getItem('keepNotes_currentUser');
            const savedUsers = localStorage.getItem('keepNotes_registeredUsers');
            const savedShowGlobal = localStorage.getItem('keepNotes_showGlobalNotes');

            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            }
            if (savedUsers) {
                this.registeredUsers = JSON.parse(savedUsers);
            }
            if (savedShowGlobal) {
                this.showGlobalNotes = savedShowGlobal === 'true';
            }
        } catch (e) {
            console.error('Error loading auth state:', e);
        }
    }

    // Save auth state to localStorage
    saveAuthState() {
        if (this.currentUser) {
            localStorage.setItem('keepNotes_currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('keepNotes_currentUser');
        }
        localStorage.setItem('keepNotes_registeredUsers', JSON.stringify(this.registeredUsers));
    }

    // Get storage key prefix based on user
    getStorageKeyPrefix() {
        if (this.currentUser) {
            return `keepNotes_user_${this.currentUser.id}_`;
        }
        return 'keepNotes_'; // Global storage for non-logged-in users
    }

    // Open auth modal
    openAuthModal() {
        const els = this.elements;
        this.showSignInView();
        els.authModal.classList.add('active');
        els.signInEmail.focus();
    }

    // Close auth modal
    closeAuthModal() {
        const els = this.elements;
        els.authModal.classList.remove('active');
        this.clearAuthForms();
    }

    // Clear auth forms
    clearAuthForms() {
        const els = this.elements;
        els.signInEmail.value = '';
        els.signInPassword.value = '';
        els.signUpName.value = '';
        els.signUpEmail.value = '';
        els.signUpPassword.value = '';
        this.removeAuthError();
    }

    // Show sign in view
    showSignInView() {
        const els = this.elements;
        els.signInView.style.display = 'block';
        els.signUpView.style.display = 'none';
        this.removeAuthError();
    }

    // Show sign up view
    showSignUpView() {
        const els = this.elements;
        els.signInView.style.display = 'none';
        els.signUpView.style.display = 'block';
        this.removeAuthError();
    }

    // Show auth error
    showAuthError(message, formId) {
        this.removeAuthError();
        const form = document.getElementById(formId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.id = 'authError';
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }

    // Remove auth error
    removeAuthError() {
        const existing = document.getElementById('authError');
        if (existing) existing.remove();
    }

    // Handle email/password sign in
    handleSignIn(e) {
        e.preventDefault();
        const els = this.elements;
        const email = els.signInEmail.value.trim().toLowerCase();
        const password = els.signInPassword.value;

        // Find user
        const user = this.registeredUsers.find(u => u.email === email);

        if (!user) {
            this.showAuthError('No account found with this email', 'signInForm');
            return;
        }

        if (user.password !== this.hashPassword(password)) {
            this.showAuthError('Incorrect password', 'signInForm');
            return;
        }

        // Sign in successful
        this.signInUser(user);
    }

    // Handle email/password sign up
    handleSignUp(e) {
        e.preventDefault();
        const els = this.elements;
        const name = els.signUpName.value.trim();
        const email = els.signUpEmail.value.trim().toLowerCase();
        const password = els.signUpPassword.value;

        // Check if email already exists
        if (this.registeredUsers.some(u => u.email === email)) {
            this.showAuthError('An account with this email already exists', 'signUpForm');
            return;
        }

        // Create new user
        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            authType: 'email',
            createdAt: new Date().toISOString()
        };

        this.registeredUsers.push(newUser);
        this.saveAuthState();

        // Sign in the new user
        this.signInUser(newUser);
        this.showToast('Account created successfully');
    }

    // Initialize Google Sign-In
    initGoogleSignIn() {
        // Wait for Google Identity Services to load
        if (typeof google === 'undefined' || !google.accounts) {
            // Retry after a short delay if not loaded yet
            setTimeout(() => this.initGoogleSignIn(), 500);
            return;
        }

        if (!this.appSettings.googleClientId) {
            return; // No client ID configured
        }

        try {
            google.accounts.id.initialize({
                client_id: this.appSettings.googleClientId,
                callback: (response) => this.handleGoogleCredentialResponse(response),
                auto_select: false,
                cancel_on_tap_outside: true
            });
            this.googleInitialized = true;
            this.updateGoogleStatusHint();
        } catch (e) {
            console.error('Error initializing Google Sign-In:', e);
            this.googleInitialized = false;
        }
    }

    // Handle Google credential response
    handleGoogleCredentialResponse(response) {
        try {
            // Decode the JWT token to get user info
            const payload = this.decodeJwtPayload(response.credential);

            if (!payload || !payload.email) {
                this.showToast('Failed to get user info from Google');
                return;
            }

            // Check if user exists
            let user = this.registeredUsers.find(u => u.email === payload.email.toLowerCase());

            if (!user) {
                // Create new Google user
                user = {
                    id: this.generateId(),
                    name: payload.name || payload.email.split('@')[0],
                    email: payload.email.toLowerCase(),
                    picture: payload.picture || null,
                    authType: 'google',
                    createdAt: new Date().toISOString()
                };
                this.registeredUsers.push(user);
                this.saveAuthState();
            } else {
                // Update existing user's picture if available
                if (payload.picture && !user.picture) {
                    user.picture = payload.picture;
                    this.saveAuthState();
                }
            }

            this.signInUser(user);
        } catch (e) {
            console.error('Error processing Google sign-in:', e);
            this.showToast('Error signing in with Google');
        }
    }

    // Decode JWT payload (for Google credential)
    decodeJwtPayload(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error decoding JWT:', e);
            return null;
        }
    }

    // Handle Google sign in - uses redirect flow
    handleGoogleSignIn() {
        // Check if Google Client ID is configured
        if (!this.appSettings.googleClientId) {
            this.showToast('Please configure Google Client ID in Settings first');
            this.closeAuthModal();
            this.openSettingsModal();
            return;
        }

        // Use OAuth redirect flow
        this.redirectToGoogleOAuth();
    }

    // Redirect to Google OAuth consent page
    redirectToGoogleOAuth() {
        const clientId = this.appSettings.googleClientId;
        const redirectUri = window.location.origin + window.location.pathname;
        const scope = 'email profile https://www.googleapis.com/auth/drive.file';

        // Store current state to restore after redirect
        sessionStorage.setItem('oauth_redirect_state', JSON.stringify({
            timestamp: Date.now(),
            returnUrl: window.location.href
        }));

        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'token');
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('include_granted_scopes', 'true');
        authUrl.searchParams.set('prompt', 'select_account');

        // Redirect to Google
        window.location.href = authUrl.toString();
    }

    // Handle OAuth callback when Google redirects back
    handleOAuthCallback() {
        // Check if there's an access token in the URL hash
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) {
            return;
        }

        // Parse the hash parameters
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const tokenType = params.get('token_type');
        const expiresIn = params.get('expires_in');

        if (!accessToken) {
            return;
        }

        // Clear the hash from URL (clean up)
        history.replaceState(null, '', window.location.pathname + window.location.search);

        // Store the access token for Drive API
        this.driveAccessToken = accessToken;

        // Fetch user info from Google
        this.fetchGoogleUserInfo(accessToken);
    }

    // Fetch user info from Google using access token
    async fetchGoogleUserInfo(accessToken) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            const userInfo = await response.json();

            // Process the user info
            this.processGoogleUser(userInfo, accessToken);

        } catch (error) {
            console.error('Error fetching Google user info:', error);
            this.showToast('Failed to sign in with Google');
        }
    }

    // Process Google user info and sign them in
    processGoogleUser(userInfo, accessToken) {
        const email = userInfo.email;
        const name = userInfo.name || userInfo.email.split('@')[0];
        const picture = userInfo.picture;

        // Check if user exists
        let user = this.registeredUsers.find(u => u.email === email.toLowerCase());

        if (!user) {
            // Create new Google user
            user = {
                id: this.generateId(),
                name: name,
                email: email.toLowerCase(),
                picture: picture,
                authType: 'google',
                googleAccessToken: accessToken,
                createdAt: new Date().toISOString()
            };
            this.registeredUsers.push(user);
        } else {
            // Update existing user
            user.name = name;
            user.picture = picture;
            user.googleAccessToken = accessToken;
        }

        this.saveAuthState();
        this.signInUser(user);

        // Clear session storage
        sessionStorage.removeItem('oauth_redirect_state');
    }

    // Update Google Client ID
    updateGoogleClientId(clientId) {
        const trimmedId = clientId.trim();
        this.appSettings.googleClientId = trimmedId || null;
        this.saveAppSettings();

        // Re-initialize Google Sign-In
        this.googleInitialized = false;
        if (trimmedId) {
            this.initGoogleSignIn();
        }

        this.updateGoogleStatusHint();
    }

    // Update Google status hint
    updateGoogleStatusHint() {
        const els = this.elements;
        if (!els.googleStatusHint) return;

        if (!this.appSettings.googleClientId) {
            els.googleStatusHint.textContent = '';
            els.googleStatusHint.className = 'settings-hint';
        } else if (this.googleInitialized) {
            els.googleStatusHint.textContent = 'Google Sign-In is configured and ready';
            els.googleStatusHint.className = 'settings-hint success';
        } else {
            els.googleStatusHint.textContent = 'Verifying Google Client ID...';
            els.googleStatusHint.className = 'settings-hint';
        }
    }

    // Handle anonymous sign in
    handleAnonymousSignIn() {
        const guestId = this.generateId();
        const user = {
            id: guestId,
            name: 'Guest User',
            email: `guest_${guestId.substring(0, 8)}@anonymous`,
            authType: 'anonymous',
            createdAt: new Date().toISOString()
        };

        this.signInUser(user);
        this.showToast('Signed in as guest');
    }

    // Sign in user and load their data
    signInUser(user) {
        // Save current global notes if not logged in and user wants to keep them
        const wasGlobal = !this.currentUser;
        const globalNotes = wasGlobal ? [...this.notes] : [];
        const globalLabels = wasGlobal ? [...this.labels] : [];
        const globalTrash = wasGlobal ? [...this.trash] : [];

        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            authType: user.authType
        };

        this.saveAuthState();
        this.loadData(); // Load user-specific data

        // If first time logging in and had global notes, offer to import them
        if (wasGlobal && globalNotes.length > 0 && this.notes.length === 0) {
            if (confirm(`You have ${globalNotes.length} notes from before signing in. Would you like to import them to your account?`)) {
                this.notes = globalNotes;
                this.labels = [...new Set([...this.labels, ...globalLabels])];
                this.trash = globalTrash;
                this.saveData();
            }
        }

        this.closeAuthModal();
        this.updateAuthUI();
        this.renderAll();
        this.showToast(`Welcome, ${user.name}!`);
    }

    // Handle sign out
    handleSignOut() {
        if (this.currentUser?.authType === 'anonymous') {
            if (!confirm('As a guest, your notes will be lost when you sign out. Continue?')) {
                return;
            }
        }

        this.currentUser = null;
        this.saveAuthState();
        this.loadData(); // Load global data
        this.updateAuthUI();
        this.renderAll();
        this.showToast('Signed out successfully');
    }

    // Update auth UI based on current user state
    updateAuthUI() {
        const els = this.elements;

        if (this.currentUser) {
            // User is logged in
            els.authBtn.style.display = 'none';
            els.userMenu.style.display = 'block';

            const initial = this.currentUser.name.charAt(0).toUpperCase();
            els.userInitial.textContent = initial;
            els.userInitialLarge.textContent = initial;
            els.userName.textContent = this.currentUser.name;
            els.userEmail.textContent = this.currentUser.authType === 'anonymous'
                ? 'Guest Account'
                : this.currentUser.email;

            // Show and update global notes toggle
            els.globalNotesToggle.style.display = 'flex';
            els.showGlobalNotesCheckbox.checked = this.showGlobalNotes;
        } else {
            // User is not logged in
            els.authBtn.style.display = 'flex';
            els.userMenu.style.display = 'none';
        }
    }

    // Simple hash function for passwords (in production, use proper hashing)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    // Capitalize words helper
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    // Toggle global notes visibility
    toggleGlobalNotes(show) {
        this.showGlobalNotes = show;
        localStorage.setItem('keepNotes_showGlobalNotes', show ? 'true' : 'false');
        this.renderAll();
    }

    // Get global notes (notes stored without user prefix)
    getGlobalNotes() {
        try {
            const globalNotes = localStorage.getItem('keepNotes_notes');
            return globalNotes ? JSON.parse(globalNotes) : [];
        } catch (e) {
            console.error('Error loading global notes:', e);
            return [];
        }
    }

    // Get global trash
    getGlobalTrash() {
        try {
            const globalTrash = localStorage.getItem('keepNotes_trash');
            return globalTrash ? JSON.parse(globalTrash) : [];
        } catch (e) {
            return [];
        }
    }

    // Get combined notes (user notes + global notes if enabled)
    getCombinedNotes() {
        if (!this.currentUser || !this.showGlobalNotes) {
            return this.notes;
        }

        const globalNotes = this.getGlobalNotes();
        // Mark global notes with a flag and avoid duplicates
        const markedGlobalNotes = globalNotes
            .filter(gn => !this.notes.some(n => n.id === gn.id))
            .map(note => ({ ...note, isGlobal: true }));

        return [...this.notes, ...markedGlobalNotes];
    }

    // Get combined trash
    getCombinedTrash() {
        if (!this.currentUser || !this.showGlobalNotes) {
            return this.trash;
        }

        const globalTrash = this.getGlobalTrash();
        const markedGlobalTrash = globalTrash
            .filter(gt => !this.trash.some(t => t.id === gt.id))
            .map(note => ({ ...note, isGlobal: true }));

        return [...this.trash, ...markedGlobalTrash];
    }

    // ==================== Google Drive Sync Methods ====================

    // Handle Drive sync button click
    async handleDriveSync() {
        if (this.syncInProgress) {
            this.showToast('Sync already in progress...');
            return;
        }

        // Check if Google Client ID is configured
        if (!this.appSettings.googleClientId) {
            this.showToast('Please configure Google Client ID in Settings first');
            this.openSettingsModal();
            return;
        }

        try {
            this.setSyncStatus('syncing');

            // Use existing access token from OAuth login if available
            if (!this.driveAccessToken && this.currentUser?.googleAccessToken) {
                this.driveAccessToken = this.currentUser.googleAccessToken;
                console.log('Using access token from Google sign-in');
            }

            // Get access token if still not available
            if (!this.driveAccessToken) {
                console.log('No access token, requesting authorization...');
                await this.authorizeDrive();
            }

            if (!this.driveAccessToken) {
                this.setSyncStatus('error');
                this.showToast('Authorization required. Please sign in with Google first.');
                return;
            }

            console.log('Access token available, finding/creating folder...');

            // Find or create Keep Notes folder
            if (!this.driveFolderId) {
                this.driveFolderId = await this.findOrCreateDriveFolder();
            }

            console.log('Folder ID:', this.driveFolderId);

            // Sync notes
            await this.syncWithDrive();

            this.setSyncStatus('synced');
            this.showToast('Synced with Google Drive');

        } catch (error) {
            console.error('Drive sync error:', error);
            this.setSyncStatus('error');

            // Check if it's an auth error
            if (error.message?.includes('Invalid Credentials') || error.message?.includes('401')) {
                this.driveAccessToken = null;
                this.showToast('Session expired. Please sign in with Google again.');
            } else {
                this.showToast('Sync failed: ' + (error.message || 'Unknown error'));
            }
        }
    }

    // Authorize with Google Drive
    async authorizeDrive() {
        return new Promise((resolve, reject) => {
            if (typeof google === 'undefined' || !google.accounts) {
                reject(new Error('Google API not loaded'));
                return;
            }

            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.appSettings.googleClientId,
                scope: 'https://www.googleapis.com/auth/drive.file',
                callback: (response) => {
                    if (response.error) {
                        reject(new Error(response.error));
                        return;
                    }
                    this.driveAccessToken = response.access_token;
                    this.driveInitialized = true;
                    resolve(response.access_token);
                },
            });

            tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // Find or create Keep Notes folder in Drive
    async findOrCreateDriveFolder() {
        const folderName = 'MyNotesKeep';

        // Search for existing folder
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            {
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`
                }
            }
        );

        if (!searchResponse.ok) {
            const errorData = await searchResponse.json();
            console.error('Drive search error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to search Drive');
        }

        const searchData = await searchResponse.json();

        if (searchData.files && searchData.files.length > 0) {
            console.log('Found existing folder:', searchData.files[0].id);
            return searchData.files[0].id;
        }

        // Create new folder
        console.log('Creating new folder:', folderName);
        const createResponse = await fetch(
            'https://www.googleapis.com/drive/v3/files',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder'
                })
            }
        );

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            console.error('Drive create folder error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to create folder');
        }

        const createData = await createResponse.json();
        console.log('Created folder:', createData.id);
        return createData.id;
    }

    // Sync notes with Drive - New structure with separate files
    async syncWithDrive() {
        this.syncInProgress = true;

        try {
            // Create subfolders if needed
            await this.ensureDriveSubfolders();

            // Download and merge notes from Drive
            await this.downloadNotesFromDrive();

            // Upload local notes to Drive
            await this.uploadNotesToDrive();

            // Sync metadata (labels, trash)
            await this.syncMetadata();

            this.lastSyncTime = new Date().toISOString();
            localStorage.setItem('keepNotes_lastSyncTime', this.lastSyncTime);

            this.saveData();
            this.renderAll();

        } finally {
            this.syncInProgress = false;
        }
    }

    // Ensure notes and attachments subfolders exist
    async ensureDriveSubfolders() {
        if (!this.driveNotesFolderId) {
            this.driveNotesFolderId = await this.findOrCreateSubfolder('notes');
        }
        if (!this.driveAttachmentsFolderId) {
            this.driveAttachmentsFolderId = await this.findOrCreateSubfolder('attachments');
        }
    }

    // Find or create a subfolder inside the main folder
    async findOrCreateSubfolder(folderName) {
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${this.driveFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            {
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` }
            }
        );

        const searchData = await searchResponse.json();
        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id;
        }

        const createResponse = await fetch(
            'https://www.googleapis.com/drive/v3/files',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: folderName,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [this.driveFolderId]
                })
            }
        );

        const createData = await createResponse.json();
        console.log(`Created ${folderName} folder:`, createData.id);
        return createData.id;
    }

    // Download all notes from Drive
    async downloadNotesFromDrive() {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q='${this.driveNotesFolderId}' in parents and trashed=false&fields=files(id,name,modifiedTime)`,
            {
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` }
            }
        );

        const data = await response.json();
        if (!data.files || data.files.length === 0) return;

        let downloadedCount = 0;
        for (const file of data.files) {
            const noteId = file.name.replace('.json', '');
            const localNote = this.notes.find(n => n.id === noteId);

            // Download if not local or Drive version is newer
            const driveTime = new Date(file.modifiedTime).getTime();
            const localTime = localNote ? new Date(localNote.updatedAt || localNote.createdAt).getTime() : 0;

            if (!localNote || driveTime > localTime) {
                const noteData = await this.downloadDriveFile(file.id);
                if (noteData) {
                    // Download attachments for this note
                    await this.downloadNoteAttachments(noteData);

                    if (localNote) {
                        Object.assign(localNote, noteData);
                    } else {
                        this.notes.push(noteData);
                    }
                    downloadedCount++;
                }
            }
        }

        if (downloadedCount > 0) {
            this.showToast(`Downloaded ${downloadedCount} note(s) from Drive`);
        }
    }

    // Download attachments for a note
    async downloadNoteAttachments(note) {
        // Download images
        if (note.images) {
            for (const image of note.images) {
                if (image.driveFileId && !image.data) {
                    const data = await this.downloadAttachmentFromDrive(image.driveFileId);
                    if (data) image.data = data;
                }
            }
        }

        // Download documents
        if (note.documents) {
            for (const doc of note.documents) {
                if (doc.driveFileId && !doc.data) {
                    const data = await this.downloadAttachmentFromDrive(doc.driveFileId);
                    if (data) doc.data = data;
                }
            }
        }
    }

    // Upload all local notes to Drive
    async uploadNotesToDrive() {
        let uploadedCount = 0;

        for (const note of this.notes) {
            // First upload any attachments
            await this.uploadNoteAttachments(note);

            // Create clean note JSON (without base64 data)
            const cleanNote = this.createCleanNoteForDrive(note);

            // Check if note exists on Drive
            const existingFile = await this.findNoteOnDrive(note.id);

            if (existingFile) {
                // Check if local is newer
                const localTime = new Date(note.updatedAt || note.createdAt).getTime();
                const driveTime = new Date(existingFile.modifiedTime).getTime();

                if (localTime > driveTime) {
                    await this.updateNoteOnDrive(existingFile.id, cleanNote);
                    uploadedCount++;
                }
            } else {
                await this.createNoteOnDrive(cleanNote);
                uploadedCount++;
            }
        }

        if (uploadedCount > 0) {
            this.showToast(`Uploaded ${uploadedCount} note(s) to Drive`);
        }
    }

    // Upload attachments for a note
    async uploadNoteAttachments(note) {
        // Upload images
        if (note.images) {
            for (let i = 0; i < note.images.length; i++) {
                const image = note.images[i];
                if (image.data && !image.driveFileId) {
                    const driveFileId = await this.uploadAttachmentToDrive({
                        id: `img_${i}`,
                        name: image.name || `image_${i}.jpg`,
                        type: image.type || 'image/jpeg',
                        data: image.data
                    }, note.id);
                    if (driveFileId) {
                        image.driveFileId = driveFileId;
                        image.driveLink = `https://drive.google.com/file/d/${driveFileId}/view`;
                    }
                }
            }
        }

        // Upload documents
        if (note.documents) {
            for (let i = 0; i < note.documents.length; i++) {
                const doc = note.documents[i];
                if (doc.data && !doc.driveFileId) {
                    const driveFileId = await this.uploadAttachmentToDrive({
                        id: `doc_${i}`,
                        name: doc.name || `document_${i}`,
                        type: doc.type || 'application/octet-stream',
                        data: doc.data
                    }, note.id);
                    if (driveFileId) {
                        doc.driveFileId = driveFileId;
                        doc.driveLink = `https://drive.google.com/file/d/${driveFileId}/view`;
                    }
                }
            }
        }
    }

    // Create clean note JSON without base64 data
    createCleanNoteForDrive(note) {
        const cleanNote = { ...note };

        // Remove base64 data from images, keep only metadata and driveFileId
        if (cleanNote.images) {
            cleanNote.images = cleanNote.images.map(img => ({
                name: img.name,
                type: img.type,
                driveFileId: img.driveFileId,
                driveLink: img.driveLink
            }));
        }

        // Remove base64 data from documents
        if (cleanNote.documents) {
            cleanNote.documents = cleanNote.documents.map(doc => ({
                name: doc.name,
                type: doc.type,
                size: doc.size,
                driveFileId: doc.driveFileId,
                driveLink: doc.driveLink
            }));
        }

        return cleanNote;
    }

    // Find a note file on Drive
    async findNoteOnDrive(noteId) {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${noteId}.json' and '${this.driveNotesFolderId}' in parents and trashed=false&fields=files(id,modifiedTime)`,
            {
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` }
            }
        );

        const data = await response.json();
        return data.files && data.files.length > 0 ? data.files[0] : null;
    }

    // Create a new note file on Drive
    async createNoteOnDrive(note) {
        const metadata = {
            name: `${note.id}.json`,
            mimeType: 'application/json',
            parents: [this.driveNotesFolderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' }));

        await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` },
                body: form
            }
        );
    }

    // Update an existing note file on Drive
    async updateNoteOnDrive(fileId, note) {
        await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(note, null, 2)
            }
        );
    }

    // Download a file from Drive
    async downloadDriveFile(fileId) {
        const response = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            {
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` }
            }
        );

        if (!response.ok) return null;
        return await response.json();
    }

    // Sync metadata (labels, trash info)
    async syncMetadata() {
        const metadataFileName = 'metadata.json';

        // Find existing metadata file
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${metadataFileName}' and '${this.driveFolderId}' in parents and trashed=false&fields=files(id,modifiedTime)`,
            {
                headers: { 'Authorization': `Bearer ${this.driveAccessToken}` }
            }
        );

        const searchData = await searchResponse.json();
        const existingFile = searchData.files && searchData.files.length > 0 ? searchData.files[0] : null;

        const localMetadata = {
            version: '2.0',
            lastSync: new Date().toISOString(),
            userId: this.currentUser?.id || 'global',
            labels: this.labels,
            trashIds: this.trash.map(t => t.id)
        };

        if (existingFile) {
            // Download and merge
            const driveMetadata = await this.downloadDriveFile(existingFile.id);
            if (driveMetadata) {
                // Merge labels
                if (driveMetadata.labels) {
                    driveMetadata.labels.forEach(label => {
                        if (!this.labels.includes(label)) {
                            this.labels.push(label);
                        }
                    });
                }
            }

            // Update metadata on Drive
            await fetch(
                `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.driveAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(localMetadata, null, 2)
                }
            );
        } else {
            // Create new metadata file
            const metadata = {
                name: metadataFileName,
                mimeType: 'application/json',
                parents: [this.driveFolderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([JSON.stringify(localMetadata, null, 2)], { type: 'application/json' }));

            await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${this.driveAccessToken}` },
                    body: form
                }
            );
        }
    }

    // Upload an attachment to Drive and return the file ID
    async uploadAttachmentToDrive(attachment, noteId) {
        const attachmentsFolderId = this.driveAttachmentsFolderId;

        // Generate unique filename
        const extension = attachment.name.split('.').pop() || 'bin';
        const fileName = `${noteId}_${attachment.id || Date.now()}.${extension}`;

        // Check if already uploaded
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and '${attachmentsFolderId}' in parents and trashed=false`,
            {
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`
                }
            }
        );

        const searchData = await searchResponse.json();
        if (searchData.files && searchData.files.length > 0) {
            return searchData.files[0].id; // Already uploaded
        }

        // Convert base64 to blob
        let blob;
        if (attachment.data) {
            // It's base64 data
            const base64Data = attachment.data.split(',')[1] || attachment.data;
            const mimeType = attachment.type || 'application/octet-stream';
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: mimeType });
        } else {
            return null; // No data to upload
        }

        // Upload to Drive
        const metadata = {
            name: fileName,
            parents: [attachmentsFolderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const response = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.driveAccessToken}`
                },
                body: form
            }
        );

        const result = await response.json();
        return result.id;
    }

    // Download attachment from Drive
    async downloadAttachmentFromDrive(driveFileId) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.driveAccessToken}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to download attachment');
            }

            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error downloading attachment:', error);
            return null;
        }
    }

    // Set sync status indicator
    setSyncStatus(status) {
        const els = this.elements;
        const btn = els.driveSyncBtn;
        const statusEl = els.syncStatus;

        btn.classList.remove('syncing', 'synced');
        statusEl.classList.remove('synced', 'error', 'pending');

        switch (status) {
            case 'syncing':
                btn.classList.add('syncing');
                els.driveSyncText.textContent = 'Syncing...';
                break;
            case 'synced':
                btn.classList.add('synced');
                statusEl.classList.add('synced');
                els.driveSyncText.textContent = 'Synced';
                break;
            case 'error':
                statusEl.classList.add('error');
                els.driveSyncText.textContent = 'Sync';
                break;
            case 'pending':
                statusEl.classList.add('pending');
                els.driveSyncText.textContent = 'Sync';
                break;
            default:
                els.driveSyncText.textContent = 'Sync';
        }
    }

    // Update textarea mode
    updateTextareaMode(textarea, type) {
        if (type !== 'text') {
            textarea.classList.add('code-mode');
        } else {
            textarea.classList.remove('code-mode');
        }
    }

    // Detect content type
    detectContentType(content) {
        if (!content || content.trim().length < 10) return 'text';

        const trimmed = content.trim();

        // JSON detection
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            try {
                JSON.parse(trimmed);
                return 'json';
            } catch (e) {}
        }

        // HTML detection
        if (/<[a-z][\s\S]*>/i.test(trimmed) && /<\/[a-z]+>/i.test(trimmed)) {
            return 'html';
        }

        // SQL detection
        if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(trimmed)) {
            return 'sql';
        }

        // JavaScript/TypeScript
        if (/\b(function|const|let|var|import|export|class|=>|async|await)\b/.test(trimmed)) {
            if (/:\s*(string|number|boolean|any|void)\b/.test(trimmed)) {
                return 'typescript';
            }
            return 'javascript';
        }

        // Python
        if (/\b(def|import|from|class|if __name__|print\(|self\.)\b/.test(trimmed) && !trimmed.includes('{')) {
            return 'python';
        }

        // Java
        if (/\b(public|private|protected|class|static|void|String\[\]|System\.out)\b/.test(trimmed) && trimmed.includes('{')) {
            return 'java';
        }

        // CSS
        if (/[.#][\w-]+\s*\{[\s\S]*\}/.test(trimmed)) {
            return 'css';
        }

        // Bash
        if (/^#!/.test(trimmed) || /\b(echo|grep|sed|awk|curl|wget)\b/.test(trimmed)) {
            return 'bash';
        }

        return 'text';
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Image handling
    handleNewNoteImages(e) {
        const files = Array.from(e.target.files);
        this.processImages(files, (images) => {
            this.pendingImages = [...this.pendingImages, ...images];
            this.renderPendingImages();
        });
        e.target.value = '';
    }

    processImages(files, callback) {
        const images = [];
        let processed = 0;
        const validFiles = files.filter(f => f.type.startsWith('image/'));

        if (validFiles.length === 0) {
            callback([]);
            return;
        }

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                images.push({
                    id: this.generateId(),
                    data: e.target.result,
                    name: file.name
                });
                processed++;
                if (processed === validFiles.length) {
                    callback(images);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    renderPendingImages() {
        const els = this.elements;
        if (this.pendingImages.length === 0) {
            els.imagePreviewContainer.style.display = 'none';
            return;
        }

        els.imagePreviewContainer.style.display = 'block';
        els.imagePreviewList.innerHTML = this.pendingImages.map(img => `
            <div class="image-preview-item" data-id="${img.id}">
                <img src="${img.data}" alt="${this.escapeHtml(img.name)}">
                <button class="image-preview-remove" onclick="keepNotes.removePendingImage('${img.id}')">&times;</button>
            </div>
        `).join('');
    }

    removePendingImage(id) {
        this.pendingImages = this.pendingImages.filter(img => img.id !== id);
        this.renderPendingImages();
    }

    handleModalImages(e) {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const files = Array.from(e.target.files);
        this.processImages(files, (images) => {
            const note = this.notes.find(n => n.id === this.editingNoteId);
            if (note) {
                note.images = [...(note.images || []), ...images];
                this.saveData();
                this.renderModalImages(note.images);
                this.renderNotes();
            }
        });
        e.target.value = '';
    }

    renderModalImages(images) {
        const els = this.elements;
        if (!images || images.length === 0) {
            els.modalImageContainer.style.display = 'none';
            return;
        }

        els.modalImageContainer.style.display = 'block';
        els.modalImageList.innerHTML = images.map(img => `
            <div class="image-preview-item" data-id="${img.id}">
                <img src="${img.data}" alt="${this.escapeHtml(img.name)}" onclick="keepNotes.openImageViewer('${img.data.replace(/'/g, "\\'")}')">
                <button class="image-preview-remove" onclick="keepNotes.removeModalImage('${img.id}')">&times;</button>
            </div>
        `).join('');
    }

    removeModalImage(id) {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (note) {
            note.images = (note.images || []).filter(img => img.id !== id);
            this.saveData();
            this.renderModalImages(note.images);
            this.renderNotes();
        }
    }

    openImageViewer(src) {
        const els = this.elements;
        els.imageViewerImg.src = src;
        els.imageViewerModal.classList.add('active');
    }

    closeImageViewer() {
        this.elements.imageViewerModal.classList.remove('active');
    }

    // Document handling
    handleNewNoteDocuments(e) {
        const files = Array.from(e.target.files);
        this.processDocuments(files, (documents) => {
            this.pendingDocuments = [...this.pendingDocuments, ...documents];
            this.renderPendingDocuments();
        });
        e.target.value = '';
    }

    processDocuments(files, callback) {
        const documents = [];
        let processed = 0;

        if (files.length === 0) {
            callback([]);
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                documents.push({
                    id: this.generateId(),
                    data: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                processed++;
                if (processed === files.length) {
                    callback(documents);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    renderPendingDocuments() {
        const els = this.elements;
        if (this.pendingDocuments.length === 0) {
            els.documentPreviewContainer.style.display = 'none';
            return;
        }

        els.documentPreviewContainer.style.display = 'block';
        els.documentPreviewList.innerHTML = this.pendingDocuments.map(doc => `
            <div class="document-item" data-id="${doc.id}">
                <div class="document-icon ${this.getDocumentIconClass(doc.name)}">${this.getDocumentExtension(doc.name)}</div>
                <div class="document-info">
                    <div class="document-name">${this.escapeHtml(doc.name)}</div>
                    <div class="document-size">${this.formatFileSize(doc.size)}</div>
                </div>
                <button class="document-remove" onclick="keepNotes.removePendingDocument('${doc.id}')" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    removePendingDocument(id) {
        this.pendingDocuments = this.pendingDocuments.filter(doc => doc.id !== id);
        this.renderPendingDocuments();
    }

    handleModalDocuments(e) {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const files = Array.from(e.target.files);
        this.processDocuments(files, (documents) => {
            const note = this.notes.find(n => n.id === this.editingNoteId);
            if (note) {
                note.documents = [...(note.documents || []), ...documents];
                this.saveData();
                this.renderModalDocuments(note.documents);
                this.renderNotes();
            }
        });
        e.target.value = '';
    }

    renderModalDocuments(documents) {
        const els = this.elements;
        if (!documents || documents.length === 0) {
            els.modalDocumentContainer.style.display = 'none';
            return;
        }

        els.modalDocumentContainer.style.display = 'block';
        els.modalDocumentList.innerHTML = documents.map(doc => `
            <div class="document-item" data-id="${doc.id}">
                <div class="document-icon ${this.getDocumentIconClass(doc.name)}">${this.getDocumentExtension(doc.name)}</div>
                <div class="document-info">
                    <div class="document-name">${this.escapeHtml(doc.name)}</div>
                    <div class="document-size">${this.formatFileSize(doc.size)}</div>
                </div>
                <button class="document-download" onclick="keepNotes.downloadDocument('${doc.id}')" title="Download">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                    </svg>
                </button>
                <button class="document-remove" onclick="keepNotes.removeModalDocument('${doc.id}')" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    removeModalDocument(id) {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (note) {
            note.documents = (note.documents || []).filter(doc => doc.id !== id);
            this.saveData();
            this.renderModalDocuments(note.documents);
            this.renderNotes();
        }
    }

    downloadDocument(docId) {
        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (!note || !note.documents) return;

        const doc = note.documents.find(d => d.id === docId);
        if (!doc) return;

        const link = document.createElement('a');
        link.href = doc.data;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getDocumentIconClass(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'pdf',
            'doc': 'doc', 'docx': 'doc',
            'xls': 'xls', 'xlsx': 'xls',
            'ppt': 'ppt', 'pptx': 'ppt',
            'txt': 'txt',
            'csv': 'xls',
            'zip': 'zip', 'rar': 'zip', '7z': 'zip'
        };
        return iconMap[ext] || 'default';
    }

    getDocumentExtension(filename) {
        return filename.split('.').pop().toUpperCase().substring(0, 4);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Add note
    addNote() {
        const els = this.elements;
        const title = els.noteTitle.value.trim();
        const content = els.noteContent.value.trim();

        if (!title && !content && this.pendingImages.length === 0 && this.pendingDocuments.length === 0) {
            return;
        }

        const note = {
            id: this.generateId(),
            title,
            content,
            color: this.selectedColor,
            type: els.noteType.value,
            images: [...this.pendingImages],
            documents: [...this.pendingDocuments],
            labels: [...this.pendingLabels],
            pinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.saveData();
        this.renderNotes();

        // Clear inputs
        els.noteTitle.value = '';
        els.noteContent.value = '';
        els.noteType.value = 'text';
        els.noteContent.classList.remove('code-mode');
        this.selectedColor = '#ffffff';
        this.selectedType = 'text';
        this.pendingImages = [];
        this.pendingDocuments = [];
        this.pendingLabels = [];
        els.colorBtns.forEach(b => b.classList.remove('selected'));
        this.renderPendingImages();
        this.renderPendingDocuments();
        this.renderPendingLabels();

        this.showToast('Note added');
    }

    // Update note
    updateNote() {
        if (!this.editingNoteId || this.isReadOnlyMode) return;

        const els = this.elements;
        const note = this.notes.find(n => n.id === this.editingNoteId);

        if (note) {
            note.title = els.editTitle.value;
            note.content = els.editContent.value;
            note.updatedAt = new Date().toISOString();
            this.saveData();
            this.renderNotes();
        }
    }

    // Delete note (move to trash)
    deleteNote() {
        if (!this.editingNoteId || this.isReadOnlyMode) return;
        this.moveToTrash(this.editingNoteId);
        this.closeModal();
    }

    // Open modal
    openModal(noteId, isGlobalNote = false) {
        if (this.isReadOnlyMode) return;

        const els = this.elements;

        // Search in user notes first, then in combined notes (which includes global)
        let note = this.notes.find(n => n.id === noteId);
        let isGlobal = false;

        if (!note && this.showGlobalNotes) {
            // Check if it's a global note
            const combinedNotes = this.getCombinedNotes();
            note = combinedNotes.find(n => n.id === noteId);
            if (note && note.isGlobal) {
                isGlobal = true;
            }
        }

        if (!note) return;

        // If it's a global note, show read-only message
        if (isGlobal || isGlobalNote) {
            this.showToast('Global notes are read-only. Sign out to edit global notes.');
            return;
        }

        this.editingNoteId = noteId;
        els.editTitle.value = note.title;
        els.editContent.value = note.content;
        els.editNoteType.value = note.type || 'text';
        els.modalContent.style.backgroundColor = note.color;

        this.updateTextareaMode(els.editContent, note.type || 'text');

        els.modalColorBtns.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === note.color);
        });

        this.renderModalImages(note.images);
        this.renderModalDocuments(note.documents);
        this.renderModalLabels(note.labels);
        this.updateModalPinButton();

        els.editModal.classList.add('active');
        els.editTitle.focus();
    }

    // Close modal
    closeModal() {
        this.elements.editModal.classList.remove('active');
        this.editingNoteId = null;
    }

    // Export notes
    exportNotes() {
        const data = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            notes: this.notes,
            trash: this.trash,
            labels: this.labels
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keep-notes-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(`Exported ${this.notes.length} notes`);
    }

    // Import notes
    importNotes(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                let importedNotes = [];
                let importedLabels = [];

                if (Array.isArray(data)) {
                    importedNotes = data;
                } else if (data.notes) {
                    importedNotes = data.notes;
                    importedLabels = data.labels || [];
                }

                importedNotes = importedNotes.filter(note =>
                    note && typeof note === 'object' && note.id
                );

                const existingIds = new Set(this.notes.map(n => n.id));
                const newNotes = importedNotes.filter(n => !existingIds.has(n.id));

                this.notes = [...newNotes, ...this.notes];

                // Merge labels
                importedLabels.forEach(label => {
                    if (!this.labels.includes(label)) {
                        this.labels.push(label);
                    }
                });

                this.saveData();
                this.renderAll();

                this.showToast(`Imported ${newNotes.length} notes`);
            } catch (error) {
                this.showToast('Error: Invalid file format');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    // Render all components
    renderAll() {
        this.renderLabels();
        this.renderNotes();
        this.renderActiveFilters();
    }

    // Render labels in sidebar
    renderLabels() {
        const els = this.elements;

        if (this.labels.length === 0) {
            els.labelsList.innerHTML = '<p style="padding: 8px 12px; color: var(--text-muted); font-size: 13px;">No labels yet</p>';
            return;
        }

        els.labelsList.innerHTML = this.labels.map(label => {
            const count = this.notes.filter(n => n.labels && n.labels.includes(label)).length;
            const isActive = this.activeLabel === label;
            return `
                <div class="label-item ${isActive ? 'active' : ''}" data-label="${this.escapeHtml(label)}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>
                    </svg>
                    <span class="label-item-name">${this.escapeHtml(label)}</span>
                    <span class="label-item-count">${count}</span>
                    <button class="label-item-delete" onclick="event.stopPropagation(); keepNotes.deleteLabel('${this.escapeHtml(label)}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        els.labelsList.querySelectorAll('.label-item').forEach(item => {
            item.addEventListener('click', () => {
                this.filterByLabel(item.dataset.label);
            });
        });
    }

    // Render active filters
    renderActiveFilters() {
        const els = this.elements;
        const hasFilters = this.searchQuery || this.activeLabel;

        if (!hasFilters) {
            els.activeFilters.style.display = 'none';
            return;
        }

        els.activeFilters.style.display = 'flex';

        let tags = '';
        if (this.searchQuery) {
            tags += `
                <div class="filter-tag">
                    Search: "${this.escapeHtml(this.searchQuery)}"
                    <button onclick="keepNotes.clearSearch()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            `;
        }
        if (this.activeLabel) {
            tags += `
                <div class="filter-tag">
                    Label: ${this.escapeHtml(this.activeLabel)}
                    <button onclick="keepNotes.filterByLabel('${this.escapeHtml(this.activeLabel)}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            `;
        }

        els.filterTags.innerHTML = tags;
    }

    // Render notes
    renderNotes() {
        const els = this.elements;

        if (this.currentView === 'trash') {
            this.renderTrashNotes();
            return;
        }

        if (this.currentView === 'archive') {
            this.renderArchiveNotes();
            return;
        }

        if (this.currentView === 'reminders') {
            this.renderReminderNotes();
            return;
        }

        const filtered = this.getFilteredNotes();
        const pinnedNotes = filtered.filter(n => n.pinned);
        const otherNotes = filtered.filter(n => !n.pinned);

        // Pinned section
        if (pinnedNotes.length > 0) {
            els.pinnedSection.style.display = 'block';
            els.pinnedNotesContainer.innerHTML = pinnedNotes.map(note =>
                this.createNoteCard(note)
            ).join('');
            this.attachNoteHandlers(els.pinnedNotesContainer);
        } else {
            els.pinnedSection.style.display = 'none';
        }

        // Others section
        if (pinnedNotes.length > 0 && otherNotes.length > 0) {
            els.otherSectionTitle.style.display = 'block';
        } else {
            els.otherSectionTitle.style.display = 'none';
        }

        if (otherNotes.length > 0) {
            els.notesContainer.innerHTML = otherNotes.map(note =>
                this.createNoteCard(note)
            ).join('');
            this.attachNoteHandlers(els.notesContainer);
        } else if (pinnedNotes.length === 0) {
            if (this.searchQuery || this.activeLabel) {
                els.notesContainer.innerHTML = `
                    <div class="no-results">
                        <h3>No notes found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                `;
            } else {
                els.notesContainer.innerHTML = `
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                        </svg>
                        <h2>Notes you add appear here</h2>
                        <p>Click the input above or press Ctrl+N to create your first note</p>
                    </div>
                `;
            }
        } else {
            els.notesContainer.innerHTML = '';
        }
    }

    renderTrashNotes() {
        const els = this.elements;
        els.pinnedSection.style.display = 'none';
        els.otherSectionTitle.style.display = 'none';

        // Use combined trash (user + global if enabled) when logged in
        const allTrash = this.getCombinedTrash();

        if (allTrash.length === 0) {
            els.notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    <h2>Trash is empty</h2>
                    <p>Deleted notes will appear here</p>
                </div>
            `;
            return;
        }

        els.notesContainer.innerHTML = allTrash.map(note =>
            this.createTrashCard(note)
        ).join('');

        // Attach handlers for trash actions
        els.notesContainer.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = btn.closest('.note-card').dataset.id;
                this.restoreFromTrash(noteId);
            });
        });

        els.notesContainer.querySelectorAll('.permanent-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = btn.closest('.note-card').dataset.id;
                if (confirm('Permanently delete this note?')) {
                    this.permanentlyDelete(noteId);
                }
            });
        });
    }

    // Render archived notes
    renderArchiveNotes() {
        const els = this.elements;
        els.pinnedSection.style.display = 'none';
        els.otherSectionTitle.style.display = 'none';

        if (this.archive.length === 0) {
            els.notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                    </svg>
                    <h2>No archived notes</h2>
                    <p>Notes you archive will appear here</p>
                </div>
            `;
            return;
        }

        els.notesContainer.innerHTML = this.archive.map(note =>
            this.createArchiveCard(note)
        ).join('');

        // Attach handlers for archive actions
        els.notesContainer.querySelectorAll('.unarchive-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = btn.closest('.note-card').dataset.id;
                this.unarchiveNote(noteId);
            });
        });

        els.notesContainer.querySelectorAll('.archive-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = btn.closest('.note-card').dataset.id;
                this.moveArchivedToTrash(noteId);
            });
        });
    }

    // Create archive card HTML
    createArchiveCard(note) {
        const bgColor = this.getColorForMode(note.color || '#ffffff');
        const textColor = this.getTextColorForBg(note.color || '#ffffff');

        return `
            <div class="note-card archive-card" data-id="${note.id}" style="background-color: ${bgColor}; color: ${textColor};">
                ${note.images && note.images.length > 0 ? `
                    <div class="note-card-images">
                        ${note.images.slice(0, 3).map(img => `
                            <img src="${img.data}" alt="${this.escapeHtml(img.name)}" class="note-card-image">
                        `).join('')}
                        ${note.images.length > 3 ? `<span class="more-images">+${note.images.length - 3}</span>` : ''}
                    </div>
                ` : ''}
                ${note.title ? `<h3 class="note-card-title">${this.highlightText(note.title, this.searchQuery)}</h3>` : ''}
                <p class="note-card-content ${note.type !== 'text' ? 'code-preview' : ''}">${this.highlightText(note.content, this.searchQuery)}</p>
                ${note.labels && note.labels.length > 0 ? `
                    <div class="note-card-labels">
                        ${note.labels.map(label => `<span class="note-label-chip">${this.escapeHtml(label)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="archive-actions">
                    <button class="unarchive-btn" title="Unarchive">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"/>
                        </svg>
                        Unarchive
                    </button>
                    <button class="archive-delete-btn" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Render notes with reminders
    renderReminderNotes() {
        const els = this.elements;
        els.pinnedSection.style.display = 'none';
        els.otherSectionTitle.style.display = 'none';

        const notesWithReminders = this.notes.filter(note => note.reminder);

        if (notesWithReminders.length === 0) {
            els.notesContainer.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M18 17v-6c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v6H4v2h16v-2h-2zm-2 0H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zm-4 5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/>
                    </svg>
                    <h2>No reminders</h2>
                    <p>Notes with reminders will appear here</p>
                </div>
            `;
            return;
        }

        // Sort by reminder date
        const sorted = [...notesWithReminders].sort((a, b) =>
            new Date(a.reminder) - new Date(b.reminder)
        );

        els.notesContainer.innerHTML = sorted.map(note =>
            this.createNoteCard(note, true)
        ).join('');

        this.attachNoteHandlers(els.notesContainer);
    }

    // Archive a note
    archiveNote(noteId) {
        const noteIndex = this.notes.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const note = this.notes[noteIndex];
            note.archivedAt = new Date().toISOString();
            this.archive.push(note);
            this.notes.splice(noteIndex, 1);
            this.saveData();
            this.renderNotes();
            this.showToast('Note archived');
        }
    }

    // Unarchive a note
    unarchiveNote(noteId) {
        const noteIndex = this.archive.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const note = this.archive[noteIndex];
            delete note.archivedAt;
            this.notes.unshift(note);
            this.archive.splice(noteIndex, 1);
            this.saveData();
            this.renderNotes();
            this.showToast('Note unarchived');
        }
    }

    // Move archived note to trash
    moveArchivedToTrash(noteId) {
        const noteIndex = this.archive.findIndex(n => n.id === noteId);
        if (noteIndex > -1) {
            const note = this.archive[noteIndex];
            note.deletedAt = new Date().toISOString();
            delete note.archivedAt;
            this.trash.push(note);
            this.archive.splice(noteIndex, 1);
            this.saveData();
            this.renderNotes();
            this.showToast('Note moved to trash');
        }
    }

    // Set reminder on a note
    setReminder(noteId, reminderDate) {
        const note = this.notes.find(n => n.id === noteId);
        if (note) {
            note.reminder = reminderDate;
            this.saveData();
            this.renderNotes();
            this.showToast('Reminder set');
        }
    }

    // Clear reminder from a note
    clearReminder(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (note && note.reminder) {
            delete note.reminder;
            this.saveData();
            this.renderNotes();
            this.showToast('Reminder cleared');
        }
    }

    // Show reminder picker
    showReminderPicker(noteId, btn) {
        // Remove any existing picker
        const existingPicker = document.querySelector('.reminder-picker');
        if (existingPicker) {
            existingPicker.remove();
        }

        const note = this.notes.find(n => n.id === noteId);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const defaultTime = '09:00';

        const picker = document.createElement('div');
        picker.className = 'reminder-picker';
        picker.innerHTML = `
            <div class="reminder-picker-content">
                <h4>Set reminder</h4>
                <div class="reminder-quick-options">
                    <button class="reminder-quick-btn" data-time="today">Later today</button>
                    <button class="reminder-quick-btn" data-time="tomorrow">Tomorrow</button>
                    <button class="reminder-quick-btn" data-time="nextweek">Next week</button>
                </div>
                <div class="reminder-custom">
                    <input type="date" id="reminderDate" value="${today}" min="${today}">
                    <input type="time" id="reminderTime" value="${defaultTime}">
                </div>
                <div class="reminder-actions">
                    ${note?.reminder ? '<button class="reminder-clear-btn">Clear</button>' : ''}
                    <button class="reminder-cancel-btn">Cancel</button>
                    <button class="reminder-save-btn">Save</button>
                </div>
            </div>
        `;

        // Position the picker
        const rect = btn.getBoundingClientRect();
        picker.style.position = 'fixed';
        picker.style.top = `${rect.bottom + 8}px`;
        picker.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
        picker.style.zIndex = '1000';

        document.body.appendChild(picker);

        // Quick options
        picker.querySelectorAll('.reminder-quick-btn').forEach(qbtn => {
            qbtn.addEventListener('click', () => {
                const time = qbtn.dataset.time;
                let date = new Date();

                if (time === 'today') {
                    date.setHours(18, 0, 0, 0);
                } else if (time === 'tomorrow') {
                    date.setDate(date.getDate() + 1);
                    date.setHours(9, 0, 0, 0);
                } else if (time === 'nextweek') {
                    date.setDate(date.getDate() + 7);
                    date.setHours(9, 0, 0, 0);
                }

                this.setReminder(noteId, date.toISOString());
                picker.remove();
            });
        });

        // Save button
        picker.querySelector('.reminder-save-btn').addEventListener('click', () => {
            const dateInput = picker.querySelector('#reminderDate').value;
            const timeInput = picker.querySelector('#reminderTime').value;
            if (dateInput && timeInput) {
                const reminder = new Date(`${dateInput}T${timeInput}`);
                this.setReminder(noteId, reminder.toISOString());
                picker.remove();
            }
        });

        // Clear button
        picker.querySelector('.reminder-clear-btn')?.addEventListener('click', () => {
            this.clearReminder(noteId);
            picker.remove();
        });

        // Cancel button
        picker.querySelector('.reminder-cancel-btn').addEventListener('click', () => {
            picker.remove();
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && !btn.contains(e.target)) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 0);
    }

    attachNoteHandlers(container) {
        // Card click handlers
        container.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.note-action-btn') ||
                    e.target.closest('.note-card-pin') ||
                    e.target.closest('.note-card-image')) return;

                const noteId = card.dataset.id;
                const isGlobal = card.dataset.global === 'true';
                if (!this.isReadOnlyMode) {
                    this.openModal(noteId, isGlobal);
                }
            });
        });

        // Pin button handlers
        container.querySelectorAll('.note-card-pin').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.note-card');
                const isGlobal = card.dataset.global === 'true';
                if (!this.isReadOnlyMode && !isGlobal) {
                    const noteId = card.dataset.id;
                    this.togglePin(noteId);
                } else if (isGlobal) {
                    this.showToast('Cannot modify global notes');
                }
            });
        });

        // Delete button handlers
        container.querySelectorAll('.delete-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.note-card');
                const isGlobal = card.dataset.global === 'true';
                if (!this.isReadOnlyMode && !isGlobal) {
                    const noteId = card.dataset.id;
                    this.moveToTrash(noteId);
                } else if (isGlobal) {
                    this.showToast('Cannot delete global notes');
                }
            });
        });

        // Archive button handlers
        container.querySelectorAll('.archive-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.note-card');
                const isGlobal = card.dataset.global === 'true';
                if (!this.isReadOnlyMode && !isGlobal) {
                    const noteId = card.dataset.id;
                    this.archiveNote(noteId);
                } else if (isGlobal) {
                    this.showToast('Cannot archive global notes');
                }
            });
        });

        // Reminder button handlers
        container.querySelectorAll('.reminder-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.note-card');
                const isGlobal = card.dataset.global === 'true';
                if (!this.isReadOnlyMode && !isGlobal) {
                    const noteId = card.dataset.id;
                    this.showReminderPicker(noteId, btn);
                } else if (isGlobal) {
                    this.showToast('Cannot set reminder on global notes');
                }
            });
        });

        // Image click handlers
        container.querySelectorAll('.note-card-image').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openImageViewer(img.src);
            });
        });
    }

    createNoteCard(note) {
        const formattedDate = this.formatDate(note.updatedAt);
        const readOnlyClass = this.isReadOnlyMode ? 'read-only-card' : '';
        const noteType = note.type || 'text';
        const isCode = noteType !== 'text';
        const contentClass = isCode ? 'note-card-content code-content' : 'note-card-content';

        // Highlight search terms
        const title = this.searchQuery ?
            this.highlightText(note.title, this.searchQuery) :
            this.escapeHtml(note.title);
        const content = this.searchQuery ?
            this.highlightText(note.content, this.searchQuery) :
            this.escapeHtml(note.content);

        let imagesHtml = '';
        if (note.images && note.images.length > 0) {
            imagesHtml = `
                <div class="note-card-images">
                    ${note.images.slice(0, 4).map(img =>
                        `<img class="note-card-image" src="${img.data}" alt="${this.escapeHtml(img.name)}">`
                    ).join('')}
                    ${note.images.length > 4 ? `<span class="more-images">+${note.images.length - 4}</span>` : ''}
                </div>
            `;
        }

        let documentsHtml = '';
        if (note.documents && note.documents.length > 0) {
            documentsHtml = `
                <div class="note-card-documents">
                    ${note.documents.slice(0, 3).map(doc => `
                        <div class="note-card-document">
                            <div class="document-icon small ${this.getDocumentIconClass(doc.name)}">${this.getDocumentExtension(doc.name)}</div>
                            <span class="document-name-short">${this.escapeHtml(doc.name)}</span>
                        </div>
                    `).join('')}
                    ${note.documents.length > 3 ? `<span class="more-documents">+${note.documents.length - 3} more</span>` : ''}
                </div>
            `;
        }

        let labelsHtml = '';
        if (note.labels && note.labels.length > 0) {
            labelsHtml = `
                <div class="note-card-labels">
                    ${note.labels.map(label =>
                        `<span class="note-card-label">${this.escapeHtml(label)}</span>`
                    ).join('')}
                </div>
            `;
        }

        const isGlobal = note.isGlobal === true;
        const globalClass = isGlobal ? 'global-note' : '';

        return `
            <div class="note-card ${readOnlyClass} ${globalClass}" data-id="${note.id}" data-global="${isGlobal}" style="background-color: ${note.color}">
                <button class="note-card-pin ${note.pinned ? 'pinned' : ''}" title="${note.pinned ? 'Unpin' : 'Pin'}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
                    </svg>
                </button>
                <div class="note-card-header">
                    ${note.title ? `<div class="note-card-title">${title}</div>` : ''}
                    ${isGlobal ? '<span class="note-global-badge">Global</span>' : ''}
                    ${isCode ? `<span class="note-type-badge">${noteType}</span>` : ''}
                </div>
                ${note.content ? `<div class="${contentClass}">${content}</div>` : ''}
                ${imagesHtml}
                ${documentsHtml}
                ${labelsHtml}
                <div class="note-card-footer">
                    <span class="note-timestamp">${formattedDate}</span>
                    <div class="note-actions">
                        <button class="note-action-btn reminder-action" title="Add reminder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 17v-6c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v6H4v2h16v-2h-2zm-2 0H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zm-4 5c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/>
                            </svg>
                        </button>
                        <button class="note-action-btn archive-action" title="Archive">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>
                            </svg>
                        </button>
                        <button class="note-action-btn delete-action" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    createTrashCard(note) {
        const deletedDate = this.formatDate(note.deletedAt);
        const noteType = note.type || 'text';
        const isCode = noteType !== 'text';
        const contentClass = isCode ? 'note-card-content code-content' : 'note-card-content';

        return `
            <div class="note-card trash-card" data-id="${note.id}" style="background-color: ${note.color}">
                <div class="note-card-header">
                    ${note.title ? `<div class="note-card-title">${this.escapeHtml(note.title)}</div>` : ''}
                    ${isCode ? `<span class="note-type-badge">${noteType}</span>` : ''}
                </div>
                ${note.content ? `<div class="${contentClass}">${this.escapeHtml(note.content)}</div>` : ''}
                <div class="note-card-footer" style="opacity: 1;">
                    <span class="note-timestamp">Deleted ${deletedDate}</span>
                    <div class="trash-actions">
                        <button class="restore-btn">Restore</button>
                        <button class="permanent-delete-btn">Delete Forever</button>
                    </div>
                </div>
            </div>
        `;
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Data persistence with user-specific storage
    saveData() {
        const prefix = this.getStorageKeyPrefix();
        localStorage.setItem(`${prefix}notes`, JSON.stringify(this.notes));
        localStorage.setItem(`${prefix}trash`, JSON.stringify(this.trash));
        localStorage.setItem(`${prefix}archive`, JSON.stringify(this.archive));
        localStorage.setItem(`${prefix}labels`, JSON.stringify(this.labels));
    }

    loadData() {
        try {
            const prefix = this.getStorageKeyPrefix();
            const notes = localStorage.getItem(`${prefix}notes`);
            const trash = localStorage.getItem(`${prefix}trash`);
            const archive = localStorage.getItem(`${prefix}archive`);
            const labels = localStorage.getItem(`${prefix}labels`);

            // Legacy support for global notes (only when not logged in)
            const oldNotes = !this.currentUser ? localStorage.getItem('keepNotes') : null;
            const oldGlobalNotes = !this.currentUser ? localStorage.getItem('keepNotes_notes') : null;

            if (notes) {
                this.notes = JSON.parse(notes);
            } else if (oldGlobalNotes && !this.currentUser) {
                this.notes = JSON.parse(oldGlobalNotes);
            } else if (oldNotes && !this.currentUser) {
                this.notes = JSON.parse(oldNotes);
            } else {
                this.notes = [];
            }

            if (trash) {
                this.trash = JSON.parse(trash);
            } else {
                this.trash = [];
            }

            if (archive) {
                this.archive = JSON.parse(archive);
            } else {
                this.archive = [];
            }

            if (labels) {
                this.labels = JSON.parse(labels);
            } else {
                this.labels = [];
            }
        } catch (e) {
            console.error('Error loading data:', e);
            this.notes = [];
            this.trash = [];
            this.archive = [];
            this.labels = [];
        }
    }

    loadPreferences() {
        const els = this.elements;

        // Dark mode
        const darkMode = localStorage.getItem('keepNotes_darkMode');
        if (darkMode === 'true') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }

        // Read-only mode
        const readOnlyMode = localStorage.getItem('keepNotes_readOnlyMode');
        if (readOnlyMode === 'true') {
            this.isReadOnlyMode = true;
            els.readOnlyToggle.checked = true;
            document.body.classList.add('read-only-mode');
            els.modeLabel.textContent = 'Read Only';
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.keepNotes = new KeepNotes();
});
