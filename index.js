/* ==========================================================================
   Hackatime Setup Guide Controller (Stardance-Inspired Interactive Logic)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- APPLICATION STATE ---
  const state = {
    currentOS: 'mac', // mac | win | linux
    generatedApiKey: '', // Empty until setup simulator is run
    selectedEditor: 'vscode', // vscode | jetbrains | vim | sublime | xcode
    currentTheme: 'dark', // dark | light
    completedSteps: {
      intro: true,   // Introduction is completed by default
      step1: false,  // Automated Setup
      step2: false,  // Add editor plugin
      step3: false,  // Heartbeat Diagnostic playground
    },
    diagnosticCount: 0,
    activeProject: null // Holds the active custom project resolved from Stardance
  };

  // --- HIGH FIDELITY PRE-DEFINED PROJECTS ---
  const PROJECTS_DB = {
    '4283': {
      id: '4283',
      title: 'My first slack bot!',
      author: 'divya',
      avatar: 'https://cachet.dunkirk.sh/users/U0B8A9514UQ/r',
      url: 'https://stardance.hackclub.com/projects/4283',
      slug: 'my-first-slack-bot',
      files: ['index.js', '.env', 'package.json', 'README.md']
    }
  };

  // --- CONFIG DETAILS FOR SYSTEM & EDITORS ---
  const OS_CONFIG = {
    mac: {
      title: 'bash - setup.sh',
      prompt: '$',
      command: 'curl -fsSL https://hackatime.hackclub.com/install.sh | sh',
      successPath: '~/.wakatime.cfg'
    },
    win: {
      title: 'PowerShell - setup.ps1',
      prompt: 'PS C:\\Users\\hackclub>',
      command: 'irm https://hackatime.hackclub.com/install.ps1 | iex',
      successPath: '%USERPROFILE%\\.wakatime.cfg'
    },
    linux: {
      title: 'sh - setup.sh',
      prompt: '$',
      command: 'wget -qO- https://hackatime.hackclub.com/install.sh | bash',
      successPath: '~/.wakatime.cfg'
    }
  };

  const EDITOR_CONFIGS = {
    vscode: {
      title: 'VS Code Setup Guide',
      badge: 'Extension Marketplace',
      steps: [
        'Launch **VS Code**.',
        'Open the Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X`).',
        'Search for **WakaTime** and click **Install**.',
        'When prompted, click **Enter API Key** (or open Command Palette with `Cmd+Shift+P` / `Ctrl+Shift+P` and type `> WakaTime: API Key`).',
        'Paste in your generated API key (it was auto-copied when you ran Step 1!).'
      ],
      winPath: '%USERPROFILE%\\.wakatime.cfg',
      macPath: '~/.wakatime.cfg'
    },
    jetbrains: {
      title: 'JetBrains IDE Setup Guide',
      badge: 'IDE Plugin Marketplace',
      steps: [
        'Open your JetBrains IDE (PyCharm, IntelliJ, WebStorm, etc.).',
        'Go to **Settings** (or **Preferences** on macOS) -> **Plugins**.',
        'Select the **Marketplace** tab, search for **WakaTime**, and click **Install**.',
        'Restart your IDE when prompted to finalize integration.',
        'Enter your **API Key** in the pop-up window or go to **Tools** -> **WakaTime Settings**.'
      ],
      winPath: '%USERPROFILE%\\.wakatime.cfg',
      macPath: '~/.wakatime.cfg'
    },
    vim: {
      title: 'Vim / NeoVim Setup Guide',
      badge: 'Vim Plugin Manager',
      steps: [
        'Open your vim configuration file (`~/.vimrc` or `~/.config/nvim/init.vim`).',
        'Add the WakaTime plugin line: `Plug \'wakatime/vim-wakatime\'`.',
        'Open Vim and run `:PlugInstall` to pull and install the package.',
        'Once installed, Vim will prompt you to input your **API Key** in the shell. Paste it in.'
      ],
      winPath: '~/.wakatime.cfg',
      macPath: '~/.wakatime.cfg'
    },
    sublime: {
      title: 'Sublime Text Setup Guide',
      badge: 'Package Control',
      steps: [
        'Open Sublime Text.',
        'Open Package Control (`Ctrl+Shift+P` or `Cmd+Shift+P` and select **Package Control: Install Package**).',
        'Search for **WakaTime** and press Enter.',
        'Navigate to **Preferences** -> **Package Settings** -> **WakaTime** -> **Settings - User** and edit settings.'
      ],
      winPath: '%USERPROFILE%\\.wakatime.cfg',
      macPath: '~/.wakatime.cfg'
    },
    xcode: {
      title: 'Xcode Setup Guide',
      badge: 'Standalone Extension Wrapper',
      steps: [
        'Download the standalone **WakaTime for Xcode** application from official GitHub Releases.',
        'Launch the application and enable the Xcode extension in **System Settings** -> **Extensions**.',
        'Click the WakaTime menu bar icon on your Mac, select **Preferences**, and enter your API Key.'
      ],
      winPath: '~/.wakatime.cfg',
      macPath: '~/.wakatime.cfg'
    }
  };

  // --- DOM ELEMENT REFERENCES ---
  const el = {
    // Sidebar
    progressText: document.getElementById('progress-text'),
    progressBar: document.getElementById('guide-progress'),
    outlineItems: document.querySelectorAll('.outline-item'),
    markers: {
      intro: document.getElementById('marker-intro'),
      step1: document.getElementById('marker-step-1'),
      step2: document.getElementById('marker-step-2'),
      step3: document.getElementById('marker-step-3'),
      trouble: document.getElementById('marker-trouble')
    },
    btnMockSignin: document.getElementById('btn-mock-signin'),

    // Terminal
    tabMac: document.getElementById('tab-mac'),
    tabWin: document.getElementById('tab-win'),
    tabLinux: document.getElementById('tab-linux'),
    terminalWindowTitle: document.getElementById('terminal-window-title'),
    terminalConsole: document.getElementById('terminal-console'),
    terminalCommandText: document.getElementById('terminal-command-text'),
    btnCopyCmd: document.getElementById('btn-copy-cmd'),
    btnRunSim: document.getElementById('btn-run-sim'),
    promptChar: document.getElementById('prompt-char'),
    setupSuccessCard: document.getElementById('setup-success-card'),
    successConfigPath: document.getElementById('success-config-path'),
    successMaskedKey: document.getElementById('success-masked-key'),

    // Editors Grid
    editorsContainer: document.getElementById('editors-grid-container'),
    editorDetailsPanel: document.getElementById('editor-details-panel'),
    editorTitle: document.getElementById('inst-editor-title'),
    installBadge: document.getElementById('inst-install-badge'),
    stepsList: document.getElementById('inst-steps-list'),
    instConfigPath: document.getElementById('inst-config-path'),
    instCodeBlock: document.getElementById('inst-code-block'),
    btnCompleteStep2: document.getElementById('btn-complete-step2'),

    // Diagnostics Playground
    diagApiKey: document.getElementById('diag-api-key'),
    diagFileEntity: document.getElementById('diag-file-entity'),
    diagProjectName: document.getElementById('diag-project-name'),
    btnTriggerDiagnostics: document.getElementById('btn-trigger-diagnostics'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    diagnosticConsoleLogs: document.getElementById('diagnostic-console-logs'),
    healthyDiagnoserCard: document.getElementById('healthy-diagnoser-card'),
    diagnosticStatusPanel: document.getElementById('diagnostic-status-panel'),
    statusPulseDot: document.getElementById('status-pulse-dot'),
    statusPanelText: document.getElementById('status-panel-text'),
    healthyStatProject: document.getElementById('healthy-stat-project'),
    healthyStatLang: document.getElementById('healthy-stat-lang'),
    healthyStatCount: document.getElementById('healthy-stat-count'),

    // FAQ Accordion
    faqItems: document.querySelectorAll('.faq-item'),

    // Project Customizer Elements
    customizerInput: document.getElementById('input-project-url'),
    btnResolveProject: document.getElementById('btn-resolve-project'),
    btnClearProject: document.getElementById('btn-clear-project'),
    projectBadgePanel: document.getElementById('project-badge-panel'),
    projectAuthorImg: document.getElementById('project-author-img'),
    projectBadgeTitle: document.getElementById('project-badge-title'),
    projectBadgeAuthorLink: document.getElementById('project-badge-author-link')
  };

  // --- GENERAL DOM UTILITIES (Strict Secure Coding: TextContent Only) ---
  const safeClearElement = (element) => {
    if (element) {
      element.replaceChildren(); // Safe equivalent to innerHTML = ''
    }
  };

  const addLogMessage = (container, text, type = 'normal') => {
    if (!container) return;
    const log = document.createElement('div');
    log.className = `log-entry ${type}`;
    log.textContent = text;
    container.appendChild(log);
    container.scrollTop = container.scrollHeight;
  };

  // --- STATE MODIFIERS / MUTATIONS ---
  const updateGlobalProgress = () => {
    let completedCount = 0;
    if (state.completedSteps.step1) completedCount++;
    if (state.completedSteps.step2) completedCount++;
    if (state.completedSteps.step3) completedCount++;

    const totalSteps = 4; // Intro (1) + Steps 1-3 (3)
    const displayCount = completedCount + 1; // Completed steps + baseline Intro (always checked)

    // Update progress bar
    if (el.progressBar) {
      el.progressBar.value = displayCount;
    }
    if (el.progressText) {
      el.progressText.textContent = `${displayCount} of ${totalSteps} Steps`;
    }

    // Update sidebar marker items
    const stepsList = ['intro', 'step1', 'step2', 'step3'];
    stepsList.forEach((stepKey) => {
      const itemEl = document.querySelector(`.outline-item[data-step="${stepKey === 'intro' ? 'intro' : stepKey.replace('step', 'step-')}"]`);
      const markerEl = el.markers[stepKey];

      if (stepKey === 'intro' || state.completedSteps[stepKey]) {
        if (itemEl) itemEl.classList.add('completed');
        if (markerEl) markerEl.textContent = '✓';
      } else {
        if (itemEl) itemEl.classList.remove('completed');
        if (markerEl) markerEl.textContent = '○';
      }
    });
  };

  // --- STEP 1: TERMINAL SIMULATOR LOGIC ---
  const switchOSTab = (os) => {
    state.currentOS = os;

    // Reset tab active state
    [el.tabMac, el.tabWin, el.tabLinux].forEach((tab) => {
      if (tab) {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });

    const activeTab = os === 'mac' ? el.tabMac : (os === 'win' ? el.tabWin : el.tabLinux);
    if (activeTab) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
    }

    // Set command and prompt character
    const config = OS_CONFIG[os];
    if (el.terminalWindowTitle) el.terminalWindowTitle.textContent = config.title;
    if (el.promptChar) el.promptChar.textContent = config.prompt.includes('PS') ? '>' : '$';
    if (el.terminalCommandText) el.terminalCommandText.textContent = config.command;

    // Reset console body to initial display
    safeClearElement(el.terminalConsole);
    const firstLine = document.createElement('div');
    firstLine.className = 'terminal-line';
    
    const promptSpan = document.createElement('span');
    promptSpan.className = 'terminal-prompt';
    promptSpan.textContent = config.prompt + ' ';
    firstLine.appendChild(promptSpan);

    const cmdSpan = document.createElement('span');
    cmdSpan.textContent = config.command;
    firstLine.appendChild(cmdSpan);

    el.terminalConsole.appendChild(firstLine);
  };

  const simulateTerminalSetup = () => {
    if (el.btnRunSim.disabled) return;
    el.btnRunSim.disabled = true;
    el.btnCopyCmd.disabled = true;

    // Transition Console text
    safeClearElement(el.terminalConsole);
    addLogMessage(el.terminalConsole, `[LOG] Initiating Hackatime environment configuration...`, 'system');

    const os = state.currentOS;
    const steps = [
      { text: `> Downloading Hackatime Core Installer binary...`, delay: 600 },
      { text: `> Resolving system architecture: ${os === 'win' ? 'x86_64-windows' : (os === 'mac' ? 'arm64-darwin' : 'x86_64-linux')}`, delay: 500 },
      { text: `> Locating user path profile...`, delay: 400 },
      { text: `> Creating config directory environment: ${os === 'win' ? '%USERPROFILE%' : '~/'}`, delay: 600 },
      { text: `> Writing global config to file: ${os === 'win' ? '%USERPROFILE%\\.wakatime.cfg' : '~/.wakatime.cfg'}`, delay: 700 },
      { text: `> Injecting API Endpoint target: https://hackatime.hackclub.com/api/hackatime/v1`, delay: 400 },
      { text: `> Attempting token auth sequence...`, delay: 800 },
      { text: `> Auto-provisioned session API key!`, delay: 500 }
    ];

    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        addLogMessage(el.terminalConsole, item.text, 'normal');
        currentStep++;
        setTimeout(runNextStep, item.delay);
      } else {
        // Setup finished!
        addLogMessage(el.terminalConsole, `[SUCCESS] File written. API parameters configured correctly!`, 'success');
        
        // Generate mock API key for local simulation
        state.generatedApiKey = 'hc_key_' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10);
        
        // Show success card
        if (el.setupSuccessCard) {
          el.setupSuccessCard.style.display = 'block';
          if (el.successConfigPath) el.successConfigPath.textContent = OS_CONFIG[os].successPath;
          if (el.successMaskedKey) {
            const masked = state.generatedApiKey.substring(0, 7) + '••••••••••••' + state.generatedApiKey.substring(state.generatedApiKey.length - 4);
            el.successMaskedKey.textContent = masked;
          }
        }

        // Fill pre-fill override key inside Diagnoser section
        if (el.diagApiKey) {
          el.diagApiKey.value = state.generatedApiKey;
        }

        // Copy key to user's system clipboard dynamically
        navigator.clipboard.writeText(state.generatedApiKey).then(() => {
          addLogMessage(el.terminalConsole, `[SYSTEM] Copied API key ${state.generatedApiKey.substring(0, 10)}... to clipboard!`, 'info');
        }).catch(() => {
          // Clipboard access blocked/denied, silent fallback
        });

        // Re-enable actions
        el.btnRunSim.disabled = false;
        el.btnCopyCmd.disabled = false;

        // Mark step 1 completed
        state.completedSteps.step1 = true;
        updateGlobalProgress();

        // Update active editor config block (to render the newly generated API Key)
        renderEditorDetails(state.selectedEditor);
      }
    };

    setTimeout(runNextStep, 500);
  };

  // --- STEP 2: EDITOR SWAPPER LOGIC ---
  const renderEditorDetails = (editorId) => {
    state.selectedEditor = editorId;
    const config = EDITOR_CONFIGS[editorId];
    if (!config) return;

    // Update visual card highlight in DOM
    const cards = el.editorsContainer.querySelectorAll('.editor-card');
    cards.forEach((card) => {
      card.classList.remove('active');
      if (card.getAttribute('data-editor') === editorId) {
        card.classList.add('active');
      }
    });

    // Update Text Content
    if (el.editorTitle) el.editorTitle.textContent = config.title;
    if (el.installBadge) el.installBadge.textContent = config.badge;

    // Render Steps List Safely
    if (el.stepsList) {
      safeClearElement(el.stepsList);
      config.steps.forEach((stepText) => {
        const li = document.createElement('li');
        
        // Parse bold highlights `**text**` and code backticks ``text``
        // Since we cannot use innerHTML, we safely parse using DOMParser or text sections
        const parts = stepText.split(/(\*\*.*?\*\*|`.*?`)/);
        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            const strong = document.createElement('strong');
            strong.textContent = part.slice(2, -2);
            li.appendChild(strong);
          } else if (part.startsWith('`') && part.endsWith('`')) {
            const code = document.createElement('code');
            code.textContent = part.slice(1, -1);
            li.appendChild(code);
          } else {
            li.appendChild(document.createTextNode(part));
          }
        });
        el.stepsList.appendChild(li);
      });
    }

    // Config preview block rendering
    const osPath = state.currentOS === 'win' ? config.winPath : config.macPath;
    if (el.instConfigPath) el.instConfigPath.textContent = osPath;

    const currentKey = state.generatedApiKey || 'YOUR_API_KEY_HERE';
    let codeOutput = `[settings]
api_url = https://hackatime.hackclub.com/api/hackatime/v1
api_key = ${currentKey}
heartbeat_rate_limit_seconds = 30`;

    if (state.activeProject) {
      codeOutput += `\n\n# Auto-track this project\nproject = ${state.activeProject.slug}`;
    }

    if (el.instCodeBlock) el.instCodeBlock.textContent = codeOutput;
  };

  // --- STEP 3: DIAGNOSTIC PLAYGROUND LOGIC ---
  const getLanguageForEntity = (entity) => {
    if (entity.endsWith('.js')) return 'JavaScript';
    if (entity.endsWith('.py')) return 'Python';
    if (entity.endsWith('.css')) return 'CSS';
    if (entity.endsWith('.tsx') || entity.endsWith('.ts')) return 'TypeScript';
    if (entity.endsWith('.html')) return 'HTML';
    return 'Text';
  };

  const executeHeartbeatDiagnostics = () => {
    const enteredKey = el.diagApiKey.value.trim() || state.generatedApiKey || 'hc_key_demo_unauthorized';
    const entity = el.diagFileEntity.value;
    const project = el.diagProjectName.value.trim() || 'unnamed-project';
    const language = getLanguageForEntity(entity);

    // Disable trigger
    el.btnTriggerDiagnostics.disabled = true;

    safeClearElement(el.diagnosticConsoleLogs);
    addLogMessage(el.diagnosticConsoleLogs, `[DIAGNOSTIC] Initializing code-activity connection test...`, 'system');

    // Simulated logs sequence
    const logs = [
      { text: `[1] Checking local configuration profile...`, delay: 400 },
      { text: `[2] Validating API URL target: https://hackatime.hackclub.com/api/hackatime/v1`, delay: 300 },
      { text: `[3] Authorization key format checked: ${enteredKey.substring(0, 10)}...`, delay: 400 },
      { text: `[4] Compiling heartbeat telemetry payload:
    - Entity: "${entity}"
    - Type: "file"
    - Project: "${project}"
    - Language: "${language}"
    - Time: ${new Date().toLocaleTimeString()}`, delay: 600 },
      { text: `[5] Connecting to API server: https://hackatime.hackclub.com/api/hackatime/v1/heartbeats`, delay: 500 },
      { text: `[6] Header payload authentication injected successfully.`, delay: 400 },
      { text: `[7] POST payload transmitted (waiting for server request response...)`, delay: 800 },
      { text: `[8] Server acknowledged payload. HTTP Status: 201 Created`, delay: 350 },
      { text: `[9] SUCCESS! coding heartbeat logged in. Accumulating metrics.`, delay: 200 }
    ];

    let currentStep = 0;
    const runNextDiagnostic = () => {
      if (currentStep < logs.length) {
        const item = logs[currentStep];
        addLogMessage(el.diagnosticConsoleLogs, item.text, currentStep === 8 ? 'success' : 'normal');
        currentStep++;
        setTimeout(runNextDiagnostic, item.delay);
      } else {
        // Complete Diagnostic run
        el.btnTriggerDiagnostics.disabled = false;

        // Increment count
        state.diagnosticCount++;

        // Update status panel to HEALTHY
        if (el.diagnosticStatusPanel) {
          el.statusPulseDot.className = 'status-dot healthy';
          el.statusPanelText.textContent = 'Active & Tracking (Healthy)';
        }

        // Show Healthy panel
        if (el.healthyDiagnoserCard) {
          el.healthyDiagnoserCard.style.display = 'block';
          if (el.healthyStatProject) el.healthyStatProject.textContent = project;
          if (el.healthyStatLang) el.healthyStatLang.textContent = language;
          if (el.healthyStatCount) el.healthyStatCount.textContent = state.diagnosticCount.toString();
        }

        // Mark Step 3 completed
        state.completedSteps.step3 = true;
        updateGlobalProgress();
      }
    };

    setTimeout(runNextDiagnostic, 300);
  };

  // --- SCROLL SPY LOGIC ---
  const handleScrollSpy = () => {
    const sections = ['intro', 'step-1', 'step-2', 'step-3', 'trouble'];
    let currentActive = 'intro';

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Section is active if it's within top third of screen viewport
        if (rect.top <= window.innerHeight * 0.35) {
          currentActive = id;
        }
      }
    });

    // Update active class on outline items
    el.outlineItems.forEach((item) => {
      item.classList.remove('active');
      if (item.getAttribute('data-step') === currentActive) {
        item.classList.add('active');
      }
    });
  };

  // --- PROJECT CUSTOMIZER LOGIC ---
  const formatSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const resolveProject = (inputValue) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Check if it's a number (ID) or contains /projects/ID
    let projectId = null;
    const projectUrlRegex = /projects\/(\d+)/i;
    const match = trimmed.match(projectUrlRegex);
    if (match) {
      projectId = match[1];
    } else if (/^\d+$/.test(trimmed)) {
      projectId = trimmed;
    }

    let resolved = null;
    if (projectId && PROJECTS_DB[projectId]) {
      resolved = PROJECTS_DB[projectId];
    } else {
      // Parse details from the slug or name dynamically to guarantee safety & client-side experience
      let rawName = 'custom-project';
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
          const urlObj = new URL(trimmed);
          const segments = urlObj.pathname.split('/').filter(Boolean);
          if (segments.length > 0) {
            rawName = segments[segments.length - 1];
          }
        } catch (e) {
          rawName = 'custom-project';
        }
      } else {
        rawName = trimmed;
      }
      
      const slugName = formatSlug(rawName);
      resolved = {
        id: projectId || 'custom',
        title: rawName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        author: 'developer',
        avatar: 'https://stardance.hackclub.com/assets/landing/header/stardance-logo-df399a7f.png',
        url: trimmed.startsWith('http') ? trimmed : '#',
        slug: slugName,
        files: ['index.js', 'package.json', 'README.md']
      };
    }

    // Set active project state
    state.activeProject = resolved;

    // UI Updates:
    // Update Customizer UI
    if (el.customizerInput) el.customizerInput.value = resolved.url !== '#' ? resolved.url : resolved.title;
    if (el.projectBadgePanel) el.projectBadgePanel.style.display = 'flex';
    if (el.projectAuthorImg) el.projectAuthorImg.src = resolved.avatar;
    if (el.projectBadgeTitle) el.projectBadgeTitle.textContent = resolved.title;
    
    if (el.projectBadgeAuthorLink) {
      el.projectBadgeAuthorLink.textContent = `@${resolved.author}`;
      el.projectBadgeAuthorLink.href = `https://stardance.hackclub.com/@${resolved.author}`;
    }

    if (el.btnClearProject) el.btnClearProject.style.display = 'block';

    // 1. Sync diag project input
    if (el.diagProjectName) {
      el.diagProjectName.value = resolved.slug;
    }

    // 2. Sync files dropdown
    if (el.diagFileEntity) {
      safeClearElement(el.diagFileEntity);
      resolved.files.forEach((file) => {
        const option = document.createElement('option');
        option.value = file;
        
        let languageLabel = getLanguageForEntity(file);
        option.textContent = `${file} (${languageLabel})`;
        el.diagFileEntity.appendChild(option);
      });
    }

    // 3. Re-render editor preview code blocks
    renderEditorDetails(state.selectedEditor);

    // Dynamic banner alert text in step 3 console
    addLogMessage(el.diagnosticConsoleLogs, `[SYSTEM] Setup guide successfully configured for project "${resolved.title}"!`, 'info');
  };

  const clearProject = () => {
    state.activeProject = null;
    if (el.customizerInput) el.customizerInput.value = '';
    if (el.projectBadgePanel) el.projectBadgePanel.style.display = 'none';
    if (el.btnClearProject) el.btnClearProject.style.display = 'none';

    // Restore defaults
    if (el.diagProjectName) {
      el.diagProjectName.value = 'hackclub-arcade';
    }

    if (el.diagFileEntity) {
      safeClearElement(el.diagFileEntity);
      const defaultFiles = [
        { name: 'index.js', lang: 'JavaScript' },
        { name: 'main.py', lang: 'Python' },
        { name: 'styles.css', lang: 'CSS' },
        { name: 'App.tsx', lang: 'TypeScript' },
        { name: 'index.html', lang: 'HTML' }
      ];
      defaultFiles.forEach((file) => {
        const option = document.createElement('option');
        option.value = file.name;
        option.textContent = `${file.name} (${file.lang})`;
        el.diagFileEntity.appendChild(option);
      });
    }

    renderEditorDetails(state.selectedEditor);
  };

  // --- EVENT BINDINGS / LISTENERS ---

  // OS Tab Switching
  if (el.tabMac) el.tabMac.addEventListener('click', () => switchOSTab('mac'));
  if (el.tabWin) el.tabWin.addEventListener('click', () => switchOSTab('win'));
  if (el.tabLinux) el.tabLinux.addEventListener('click', () => switchOSTab('linux'));

  // Terminal actions
  if (el.btnCopyCmd) {
    el.btnCopyCmd.addEventListener('click', () => {
      const command = OS_CONFIG[state.currentOS].command;
      navigator.clipboard.writeText(command).then(() => {
        const copyTextEl = document.getElementById('copy-text');
        if (copyTextEl) {
          copyTextEl.textContent = 'Copied!';
          setTimeout(() => {
            copyTextEl.textContent = 'Copy Command';
          }, 2000);
        }
      });
    });
  }

  if (el.btnRunSim) {
    el.btnRunSim.addEventListener('click', simulateTerminalSetup);
  }

  // Editors Grid
  if (el.editorsContainer) {
    const cards = el.editorsContainer.querySelectorAll('.editor-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const editorId = card.getAttribute('data-editor');
        renderEditorDetails(editorId);
      });
    });
  }

  // Complete Step 2 Action
  if (el.btnCompleteStep2) {
    el.btnCompleteStep2.addEventListener('click', () => {
      state.completedSteps.step2 = true;
      updateGlobalProgress();

      // Pulse a micro-success on button text
      const btnSpan = el.btnCompleteStep2.querySelector('span');
      if (btnSpan) {
        btnSpan.textContent = '✓ Step Completed!';
        setTimeout(() => {
          btnSpan.textContent = '✓ I\'ve Installed the Plugin';
        }, 3000);
      }
    });
  }

  // Diagnostics triggers
  if (el.btnTriggerDiagnostics) {
    el.btnTriggerDiagnostics.addEventListener('click', executeHeartbeatDiagnostics);
  }

  if (el.btnClearConsole) {
    el.btnClearConsole.addEventListener('click', () => {
      safeClearElement(el.diagnosticConsoleLogs);
      addLogMessage(el.diagnosticConsoleLogs, `[SYSTEM] Console logs cleared. Ready.`, 'system');
    });
  }

  // FAQ Expand/Collapse
  el.faqItems.forEach((faq) => {
    const trigger = faq.querySelector('.faq-trigger');
    const content = faq.querySelector('.faq-content');
    const icon = faq.querySelector('.faq-icon');

    if (trigger && content && icon) {
      trigger.addEventListener('click', () => {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        
        // Collapse all others
        el.faqItems.forEach((otherFaq) => {
          if (otherFaq !== faq) {
            otherFaq.classList.remove('expanded');
            const otherTrigger = otherFaq.querySelector('.faq-trigger');
            const otherContent = otherFaq.querySelector('.faq-content');
            const otherIcon = otherFaq.querySelector('.faq-icon');
            if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            if (otherContent) otherContent.style.display = 'none';
            if (otherIcon) otherIcon.textContent = '+';
          }
        });

        // Toggle current FAQ
        if (isExpanded) {
          faq.classList.remove('expanded');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.display = 'none';
          icon.textContent = '+';
        } else {
          faq.classList.add('expanded');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.display = 'block';
          icon.textContent = '−'; // Using actual minus character
        }
      });
    }
  });

  // Mock signin trigger
  if (el.btnMockSignin) {
    el.btnMockSignin.addEventListener('click', () => {
      const signinText = el.btnMockSignin.querySelector('span');
      if (signinText) {
        signinText.textContent = 'Connecting...';
        setTimeout(() => {
          signinText.textContent = '✓ Synced with Hack Club Slack';
          el.btnMockSignin.style.borderColor = 'var(--color-green)';
          el.btnMockSignin.style.color = 'var(--color-green)';
        }, 1500);
      }
    });
  }

  // --- THEME TOGGLE LOGIC ---
  const savedTheme = localStorage.getItem('theme') || 'dark';
  state.currentTheme = savedTheme;

  const updateThemeUI = () => {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (state.currentTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  };

  updateThemeUI();

  const themeToggle = document.getElementById('btn-theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
      state.currentTheme = nextTheme;
      localStorage.setItem('theme', nextTheme);
      updateThemeUI();
    });
  }

  // Scrollspy & Resize
  window.addEventListener('scroll', handleScrollSpy);
  window.addEventListener('resize', handleScrollSpy);

  // --- PROJECT CUSTOMIZER BINDINGS ---
  if (el.btnResolveProject) {
    el.btnResolveProject.addEventListener('click', () => {
      if (el.customizerInput) {
        resolveProject(el.customizerInput.value);
      }
    });
  }

  if (el.btnClearProject) {
    el.btnClearProject.addEventListener('click', clearProject);
  }

  if (el.customizerInput) {
    el.customizerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        resolveProject(el.customizerInput.value);
      }
    });
  }

  // Parse URL Search Query Params
  const parseUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const projectParam = params.get('project') || params.get('project_id');
    if (projectParam) {
      resolveProject(projectParam);
    }
  };

  // --- INITIALIZATION ---
  switchOSTab('mac');
  renderEditorDetails('vscode');
  updateGlobalProgress();
  parseUrlParams();
});
