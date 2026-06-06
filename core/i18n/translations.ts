export type Language = 'it' | 'en';

export interface Translations {
  // Navigation tabs
  tabChat: string;
  tabMemory: string;
  tabSkill: string;
  tabPreset: string;
  tabAutomation: string;
  tabMcp: string;
  tabTools: string;
  tabSettings: string;
  navAriaLabel: string;

  // Common
  loading: string;
  cancel: string;
  save: string;
  update: string;
  create: string;
  delete: string;
  edit: string;
  confirm: string;
  add: string;
  import: string;
  export: string;
  new: string;
  custom: string;

  // Memory types
  memTypeUser: string;
  memTypeFeedback: string;
  memTypeTopic: string;
  memTypeReference: string;

  // Memory page
  memFilterAll: string;
  memEmpty: string;
  memEmptyCategory: string;
  memTotal: string;
  memAdd: string;

  // Memory form
  memFormTitle: string;
  memFormContent: string;
  memFormTags: string;

  // Memory card
  memCardPin: string;
  memCardEdit: string;
  memCardDelete: string;
  timeJustNow: string;
  timeMinutesAgo: string;
  timeHoursAgo: string;
  timeDaysAgo: string;

  // Preset page
  presetTitle: string;
  presetImport: string;
  presetNew: string;
  presetEmptyHint: string;
  presetActiveHint: string;
  presetActivated: string;

  // Preset form
  presetFormNamePlaceholder: string;
  presetFormContentLabel: string;

  // Skill page
  skillTitle: string;
  skillCustom: string;
  skillBuiltin: string;
  skillOfficial: string;
  skillRemote: string;
  skillImportFile: string;
  skillExportFile: string;
  skillExportEmpty: string;
  skillImportInvalid: string;
  skillImportNone: string;
  skillImportDone: string;
  skillGitHubSource: string;
  skillGitHubImported: string;
  skillCheck: string;
  skillSync: string;
  skillRemove: string;
  skillChecking: string;
  skillSyncing: string;
  skillNoUpdates: string;
  skillUpdatesFound: string;
  skillHint: string;
  skillCheckError: string;
  skillSyncError: string;
  skillNeedsGitHubPermission: string;
  skillDeleteSourceConfirm: string;

  // Automation page
  autoTitle: string;
  autoTaskCount: string;
  autoNew: string;
  autoEmpty: string;
  autoFormName: string;
  autoFormNamePlaceholder: string;
  autoFormModel: string;
  autoFormModelDefault: string;
  autoFormPromptLabel: string;
  autoFormPromptPlaceholder: string;
  autoFormTrigger: string;
  autoFormManual: string;
  autoFormExpression: string;
  autoFormTimezone: string;
  autoFormSearch: string;
  autoFormThinking: string;
  autoStatusActive: string;
  autoStatusPaused: string;
  autoNext: string;
  autoLast: string;
  autoSession: string;
  autoRecent: string;
  autoNone: string;
  autoNoSession: string;
  autoOpenSession: string;
  autoRunNow: string;
  autoRunning: string;
  autoTogglePause: string;
  autoToggleResume: string;
  autoDeleteConfirm: string;
  autoValidationNamePrompt: string;
  autoValidationExpression: string;
  autoRunFailed: string;
  autoRunQueued: string;
  autoRunSucceeded: string;
  autoRunTimeout: string;
  autoRunCancelled: string;
  autoRunSkipped: string;

  // Tools page
  toolsTitle: string;
  toolsDescription: string;
  toolsWebSearchName: string;
  toolsWebSearchDesc: string;
  toolsWebFetchName: string;
  toolsWebFetchDesc: string;
  toolsDisabledNote: string;
  toolsDiagTitle: string;
  toolsDiagDescription: string;
  toolsDiagPlaceholder: string;
  toolsDiagRun: string;
  toolsDiagRunning: string;
  toolsDiagBytes: string;
  toolsDiagError: string;
  toolsPermTitle: string;
  toolsPermDescription: string;
  toolsPermGrant: string;
  toolsPermGranting: string;
  toolsPermGranted: string;
  toolsPermDenied: string;
  toolsPermInvalidUrl: string;
  toolsGrantAllSites: string;
  toolsGrantAllSitesGranted: string;
  toolsGrantAllSitesGranting: string;
  toolsGrantAllSitesHint: string;

  // MCP page
  mcpLoadError: string;

  // Settings page
  settingsModelSection: string;
  settingsExpertMode: string;
  settingsExpertModeDesc: string;
  settingsSidebarChat: string;
  settingsSidebarChatDesc: string;
  settingsPet: string;
  settingsPetDesc: string;
  settingsBgSection: string;
  settingsBgEnabled: string;
  settingsBgEnabledDesc: string;
  settingsBgUpload: string;
  settingsBgUrlPlaceholder: string;
  settingsBgConfirm: string;
  settingsBgPreview: string;
  settingsBgOpacity: string;
  settingsBgClear: string;
  settingsPetSection: string;
  settingsPetPositionRight: string;
  settingsPetPositionLeft: string;
  settingsPetPositionCustom: string;
  settingsPetSize: string;
  settingsPetOpacity: string;
  settingsPetMotion: string;
  settingsPetMotionDesc: string;
  settingsSyncSection: string;
  settingsSyncWebdavUrl: string;
  settingsSyncUsername: string;
  settingsSyncPassword: string;
  settingsSyncRemotePath: string;
  settingsSyncTest: string;
  settingsSyncUpload: string;
  settingsSyncDownload: string;
  settingsSyncLastSync: string;
  settingsSyncNever: string;
  settingsSyncSuccess: string;
  settingsSyncTestSuccess: string;
  settingsSyncUploadSuccess: string;
  settingsSyncDownloadSuccess: string;
  settingsSyncPermError: string;
  settingsSyncFailed: string;
  settingsSyncUploadConfirm: string;
  settingsSyncDownloadConfirm: string;
  settingsSyncCountFmt: string;
  settingsDataSection: string;
  settingsMemoryTotal: string;
  settingsExportMemory: string;
  settingsImportMemory: string;
  settingsClearAll: string;
  settingsClearConfirm: string;
  settingsJsonError: string;
  settingsAbout: string;
  settingsAboutDesc: string;
  settingsLanguageSection: string;
  settingsLanguageLabel: string;

  // Preset activate/deactivate
  presetActivate: string;
  presetDeactivate: string;

  // Skill form
  skillFormNamePlaceholder: string;
  skillFormTriggerHint: string;
  skillFormDescPlaceholder: string;
  skillFormInstructionsLabel: string;
  skillFormInstructionsPlaceholder: string;
  skillFormMemoryEnabled: string;
  skillFormSaveChanges: string;
  skillDisabled: string;
  skillMemoryEnabled: string;
  skillToggleDisable: string;
  skillToggleEnable: string;

  // GitHub import panel
  ghImportTitle: string;
  ghImportDescription: string;
  ghImportClose: string;
  ghImportPreview: string;
  ghImportPreviewing: string;
  ghImportSelectAll: string;
  ghImportDeselectAll: string;
  ghImportSelected: string;
  ghImportCancel: string;
  ghImportConfirm: string;
  ghImportImporting: string;
  ghImportSuccess: string;
  ghImportRenamed: string;
  ghImportNeedsPermission: string;
  ghImportPreviewFailed: string;
  ghImportFailed: string;
  ghImportOpenRepo: string;
  ghImportSkillRenamed: string;
  ghImportMoreWarnings: string;

  // Scenario manager
  scenarioTitle: string;
  scenarioDescription: string;
  scenarioCustom: string;
  scenarioNamePlaceholder: string;
  scenarioTemplatePlaceholder: string;
  scenarioAdd: string;
  scenarioDelete: string;
  scenarioSave: string;
  scenarioEdit: string;

  // MCP page
  mcpTitle: string;
  mcpSummary: string;
  mcpAdd: string;
  mcpEmpty: string;
  mcpLoading: string;
  mcpFormCreate: string;
  mcpFormEdit: string;
  mcpFormEnabled: string;
  mcpFormName: string;
  mcpFormTransport: string;
  mcpFormServiceUrl: string;
  mcpFormNativeHost: string;
  mcpFormCommand: string;
  mcpFormArgs: string;
  mcpFormCwd: string;
  mcpFormEnv: string;
  mcpFormConnectMs: string;
  mcpFormRequestMs: string;
  mcpFormDiscoveryMs: string;
  mcpFormMaxResultBytes: string;
  mcpFormMaxToolCount: string;
  mcpFormExecution: string;
  mcpFormAllowInject: string;
  mcpFormAutoExec: string;
  mcpFormManualExec: string;
  mcpFormDisabledExec: string;
  mcpFormHeadersAdd: string;
  mcpFormSecretsAdd: string;
  mcpServerTest: string;
  mcpServerTesting: string;
  mcpServerRefresh: string;
  mcpServerRefreshing: string;
  mcpServerEdit: string;
  mcpServerDelete: string;
  mcpServerEnable: string;
  mcpServerGrant: string;
  mcpDetailStatus: string;
  mcpDetailLatency: string;
  mcpDetailLastConn: string;
  mcpDetailTransport: string;
  mcpDetailExecPolicy: string;
  mcpDetailTools: string;
  mcpDetailNoTools: string;
  mcpDetailHistory: string;
  mcpDetailNoHistory: string;
  mcpDetailInjecting: string;
  mcpDetailAutoLabel: string;
  mcpDetailDisabledLabel: string;
  mcpHistorySuccess: string;
  mcpHistoryFailed: string;
  mcpShellSetupTitle: string;
  mcpShellRunCommand: string;
  mcpShellNoteExtId: string;
  mcpShellNoteFixed: string;
  mcpShellNoteCapability: string;
  mcpShellNoteEnableAfter: string;
  mcpShellNoteRestartAfter: string;
  mcpShellExists: string;
  mcpShellCreateFailed: string;
  mcpShellCreated: string;
  mcpSaveError: string;
  mcpDeleteConfirm: string;
  mcpSchemaNoParams: string;
  mcpSchemaParams: string;
  mcpSchemaRequired: string;
  mcpTransportHintStreamable: string;
  mcpTransportHintHttp: string;
  mcpTransportHintSse: string;
  mcpTransportHintStdio: string;
  mcpTransportHintNative: string;
  mcpErrorNameEmpty: string;
  mcpErrorNativeHostEmpty: string;
  mcpErrorNativeHostInvalid: string;
  mcpErrorUrlEmpty: string;
  mcpErrorUrlProtocol: string;
  mcpErrorUrlInvalid: string;
  mcpErrorCommandEmpty: string;
  mcpErrorEnvInvalid: string;
  mcpErrorTimeoutInvalid: string;
  mcpErrorGranted: string;
  mcpErrorGrantDenied: string;
  mcpConnectSuccess: string;
  mcpGrantedOrigin: string;

  // Shell MCP setup messages
  shellErrorForbidden: string;
  shellErrorNotFound: string;
  shellErrorNativeUnavailable: string;
  shellErrorNetworkError: string;
  shellConnected: string;
  shellNotEnabled: string;
  shellNotInstalled: string;

  // Update banner
  updateAvailable: string;
  updateDownload: string;
  updateDismiss: string;
  updateInstallHint: string;

  // Settings update section
  settingsUpdateSection: string;
  settingsUpdateCurrent: string;
  settingsUpdateCheck: string;
  settingsUpdateChecking: string;
  settingsUpdateUpToDate: string;
  settingsUpdateAvailable: string;
  settingsUpdateLastChecked: string;
  settingsUpdateNeverChecked: string;
  settingsUpdateDownload: string;
  settingsUpdateError: string;
  settingsAutoUpdateSection: string;
  settingsAutoUpdatePathLabel: string;
  settingsAutoUpdatePathPlaceholder: string;
  settingsAutoUpdatePathHint: string;
  settingsAutoUpdateButton: string;
  settingsAutoUpdatePulling: string;
  settingsAutoUpdateBuilding: string;
  settingsAutoUpdateReloading: string;
  settingsAutoUpdateSuccess: string;
  settingsAutoUpdateErrorShell: string;
  settingsAutoUpdateNoShell: string;

  // About credits
  aboutFork: string;
  aboutTranslation: string;

  // Chat page
  chatTitle: string;
  chatNewSession: string;
  chatEmptyHint: string;
  chatInputPlaceholder: string;
  chatSend: string;
  chatSending: string;
  chatLoginRequired: string;
  chatLoginNote: string;
  chatSkillActive: string;
  chatSkillNotFound: string;
  chatSkillHint: string;
  chatLoginStep1: string;
  chatLoginStep2: string;
  chatLoginStep3: string;
  chatLoginOpen: string;
  chatLoginRetry: string;
  chatLoginWaiting: string;

  // Onboarding
  onboardingTitle: string;
  onboardingSubtitle: string;
  onboardingChoose: string;
  onboardingConfirm: string;
}

const it: Translations = {
  // Navigation
  tabChat: 'Chat',
  tabMemory: 'Memoria',
  tabSkill: 'Skill',
  tabPreset: 'Preset',
  tabAutomation: 'Automazione',
  tabMcp: 'MCP',
  tabTools: 'Strumenti',
  tabSettings: 'Impostazioni',
  navAriaLabel: 'Navigazione laterale',

  // Common
  loading: 'Caricamento...',
  cancel: 'Annulla',
  save: 'Salva',
  update: 'Aggiorna',
  create: 'Crea',
  delete: 'Elimina',
  edit: 'Modifica',
  confirm: 'Conferma',
  add: 'Aggiungi',
  import: 'Importa',
  export: 'Esporta',
  new: 'Nuovo',
  custom: 'Personalizzato',

  // Memory types
  memTypeUser: 'Utente',
  memTypeFeedback: 'Feedback',
  memTypeTopic: 'Argomento',
  memTypeReference: 'Riferimento',

  // Memory page
  memFilterAll: 'Tutti',
  memEmpty: 'Nessun ricordo — si accumuleranno durante le conversazioni',
  memEmptyCategory: 'Nessun ricordo in questa categoria',
  memTotal: 'Totale {n} ricordi',
  memAdd: 'Aggiungi',

  // Memory form
  memFormTitle: 'Titolo',
  memFormContent: 'Contenuto',
  memFormTags: 'Tag (separati da virgola)',

  // Memory card
  memCardPin: 'Fissa in cima',
  memCardEdit: 'Modifica',
  memCardDelete: 'Elimina',
  timeJustNow: 'Adesso',
  timeMinutesAgo: '{n} min fa',
  timeHoursAgo: '{n} ore fa',
  timeDaysAgo: '{n} giorni fa',

  // Preset page
  presetTitle: 'Preset di sistema',
  presetImport: 'Importa',
  presetNew: 'Nuovo',
  presetEmptyHint: 'Crea un preset di sistema per iniettarlo automaticamente all\'inizio di ogni nuova conversazione.',
  presetActiveHint: 'Il preset attivo viene iniettato automaticamente al primo messaggio di ogni nuova conversazione. Solo un preset può essere attivo alla volta.',
  presetActivated: 'Attivo',

  // Preset form
  presetFormNamePlaceholder: 'Nome preset (es. Assistente codice, Traduttore)',
  presetFormContentLabel: 'Contenuto del prompt di sistema',

  // Skill page
  skillTitle: 'Skill disponibili',
  skillCustom: 'Personalizzato',
  skillBuiltin: 'Integrato',
  skillOfficial: 'Ufficiale',
  skillRemote: 'GitHub',
  skillImportFile: 'Importa skill da file',
  skillExportFile: 'Esporta skill in file',
  skillExportEmpty: 'Nessuna skill personalizzata da esportare.',
  skillImportInvalid: 'File JSON non valido.',
  skillImportNone: 'Nessuna skill valida trovata nel file.',
  skillImportDone: 'Importate {n} skill.',
  skillGitHubSource: 'Sorgenti GitHub',
  skillGitHubImported: '{n} Skill',
  skillCheck: 'Controlla',
  skillSync: 'Sincronizza',
  skillRemove: 'Rimuovi',
  skillChecking: 'Controllo...',
  skillSyncing: 'Sincronizzazione...',
  skillNoUpdates: 'Nessun aggiornamento disponibile',
  skillUpdatesFound: 'Aggiornamenti trovati',
  skillHint: 'Digita /nomeSkill argomenti nella casella di DeepSeek per attivare uno skill. Es: /frontend-design crea una pagina login',
  skillCheckError: 'Errore durante il controllo aggiornamenti',
  skillSyncError: 'Errore durante la sincronizzazione',
  skillNeedsGitHubPermission: 'È necessario il permesso di accesso alle API GitHub per controllare gli aggiornamenti',
  skillDeleteSourceConfirm: 'Rimuovere i {n} Skill importati da {repo}?',

  // Automation page
  autoTitle: 'Automazione',
  autoTaskCount: '{total} task, {active} attivi',
  autoNew: 'Nuovo',
  autoEmpty: 'Nessuna automazione',
  autoFormName: 'Nome',
  autoFormNamePlaceholder: 'Nome task',
  autoFormModel: 'Modello',
  autoFormModelDefault: 'Predefinito',
  autoFormPromptLabel: 'Prompt',
  autoFormPromptPlaceholder: 'Inserisci il testo da inviare a DeepSeek in automatico',
  autoFormTrigger: 'Trigger',
  autoFormManual: 'Manuale',
  autoFormExpression: 'Espressione',
  autoFormTimezone: 'Fuso orario',
  autoFormSearch: 'Internet',
  autoFormThinking: 'Ragionamento',
  autoStatusActive: 'Attivo',
  autoStatusPaused: 'In pausa',
  autoNext: 'Prossima',
  autoLast: 'Ultima',
  autoSession: 'Sessione',
  autoRecent: 'Recente',
  autoNone: 'Nessuna',
  autoNoSession: 'Non creata',
  autoOpenSession: 'Apri sessione',
  autoRunNow: 'Esegui ora',
  autoRunning: 'In esecuzione',
  autoTogglePause: 'Metti in pausa',
  autoToggleResume: 'Riprendi',
  autoDeleteConfirm: 'Eliminare l\'automazione "{name}"?',
  autoValidationNamePrompt: 'Nome e Prompt non possono essere vuoti',
  autoValidationExpression: 'Inserisci un\'espressione di schedulazione',
  autoRunFailed: 'Fallito',
  autoRunQueued: 'In coda',
  autoRunSucceeded: 'Completato',
  autoRunTimeout: 'Timeout',
  autoRunCancelled: 'Annullato',
  autoRunSkipped: 'Saltato',

  // Tools page
  toolsTitle: 'Strumenti',
  toolsDescription: 'Se disabilitato, lo strumento non viene iniettato nella conversazione e l\'AI non può usarlo',
  toolsWebSearchName: 'Ricerca web (web_search)',
  toolsWebSearchDesc: 'Cerca su Bing e restituisce titoli, URL e descrizioni',
  toolsWebFetchName: 'Recupera pagina (web_fetch)',
  toolsWebFetchDesc: 'Scarica l\'URL specificato ed estrae il testo visibile',
  toolsDisabledNote: 'Gli strumenti disabilitati non saranno disponibili nelle nuove conversazioni. Le conversazioni già aperte non sono influenzate.',
  toolsDiagTitle: 'Diagnosi ricerca',
  toolsDiagDescription: 'Testa direttamente la ricerca, bypassando la conversazione AI',
  toolsDiagPlaceholder: 'Parola chiave di ricerca',
  toolsDiagRun: 'Diagnosi',
  toolsDiagRunning: 'Diagnosi...',
  toolsDiagBytes: 'byte',
  toolsDiagError: 'Errore',
  toolsPermTitle: 'Permessi web_fetch',
  toolsPermDescription: 'Per recuperare una pagina è necessario il permesso per quel sito. Inserisci l\'URL e concedi il permesso.',
  toolsPermGrant: 'Autorizza',
  toolsPermGranting: 'Richiesta...',
  toolsPermGranted: 'Permesso concesso, accesso al sito consentito',
  toolsPermDenied: 'Permesso negato — riprova o aggiungi manualmente in chrome://extensions',
  toolsPermInvalidUrl: 'URL non valido — inserisci un URL completo (es. https://example.com)',
  toolsGrantAllSites: 'Autorizza tutti i siti',
  toolsGrantAllSitesGranted: 'Tutti i siti autorizzati',
  toolsGrantAllSitesGranting: 'Richiesta in corso...',
  toolsGrantAllSitesHint: 'Concede all\'estensione il permesso di accedere a tutti i siti. Dopo questa operazione web_fetch non mostrerà più popup.',

  // MCP page
  mcpLoadError: 'Impossibile caricare la configurazione MCP',

  // Settings page
  settingsModelSection: 'Modello',
  settingsExpertMode: 'Modalità Expert',
  settingsExpertModeDesc: 'Usa il modello DeepSeek Expert per le conversazioni',
  settingsSidebarChat: 'Chat nella barra laterale',
  settingsSidebarChatDesc: 'Mostra la scheda chat nella barra laterale, supporta conversazioni dirette via API DeepSeek',
  settingsPet: 'Mascotte DeepSeek',
  settingsPetDesc: 'Mostra la mascotte animata nella pagina DeepSeek',
  settingsBgSection: 'Sfondo',
  settingsBgEnabled: 'Sfondo personalizzato',
  settingsBgEnabledDesc: 'Imposta un\'immagine di sfondo per la pagina DeepSeek',
  settingsBgUpload: 'Carica immagine',
  settingsBgUrlPlaceholder: 'Incolla URL immagine',
  settingsBgConfirm: 'Conferma',
  settingsBgPreview: 'Anteprima',
  settingsBgOpacity: 'Opacità sfondo',
  settingsBgClear: 'Rimuovi sfondo',
  settingsPetSection: 'Mascotte fluttuante',
  settingsPetPositionRight: 'Destra basso',
  settingsPetPositionLeft: 'Sinistra basso',
  settingsPetPositionCustom: 'Personalizzato',
  settingsPetSize: 'Dimensione',
  settingsPetOpacity: 'Opacità',
  settingsPetMotion: 'Animazione fluttuante',
  settingsPetMotionDesc: 'Disattiva per ridurre il movimento',
  settingsSyncSection: 'Sincronizzazione cloud',
  settingsSyncWebdavUrl: 'Indirizzo WebDAV',
  settingsSyncUsername: 'Utente',
  settingsSyncPassword: 'Password',
  settingsSyncRemotePath: 'Percorso remoto',
  settingsSyncTest: 'Testa connessione',
  settingsSyncUpload: 'Carica locale',
  settingsSyncDownload: 'Scarica cloud',
  settingsSyncLastSync: 'Ultima sincronizzazione: {time}',
  settingsSyncNever: 'Mai sincronizzato',
  settingsSyncSuccess: 'Operazione completata',
  settingsSyncTestSuccess: 'Connessione riuscita',
  settingsSyncUploadSuccess: 'Caricamento completato, dati cloud sostituiti. {counts}',
  settingsSyncDownloadSuccess: 'Download completato, dati locali sostituiti. {counts}',
  settingsSyncPermError: 'È necessario il permesso per connettersi al server WebDAV',
  settingsSyncFailed: 'Operazione fallita',
  settingsSyncUploadConfirm: 'Sovrascrivere i dati cloud con i ricordi, Skill e preset locali?',
  settingsSyncDownloadConfirm: 'Sovrascrivere i dati locali con i ricordi, Skill e preset cloud? Questa operazione è irreversibile.',
  settingsSyncCountFmt: '{memories} ricordi, {skills} Skill, {presets} preset',
  settingsDataSection: 'Gestione dati',
  settingsMemoryTotal: 'Ricordi totali',
  settingsExportMemory: 'Esporta ricordi',
  settingsImportMemory: 'Importa ricordi',
  settingsClearAll: 'Cancella tutti i ricordi',
  settingsClearConfirm: 'Cancellare tutti i ricordi? Questa operazione è irreversibile.',
  settingsJsonError: 'Formato JSON non valido',
  settingsAbout: 'Informazioni',
  settingsAboutDesc: 'Sistema agenziale di memoria e Skill',
  settingsLanguageSection: 'Lingua',
  settingsLanguageLabel: 'Lingua dell\'interfaccia',

  // Preset activate/deactivate
  presetActivate: 'Attiva',
  presetDeactivate: 'Disattiva',

  // Skill form
  skillFormNamePlaceholder: 'Nome (es. my-skill)',
  skillFormTriggerHint: 'Comando trigger: ',
  skillFormDescPlaceholder: 'Descrizione (quando usare questo skill)',
  skillFormInstructionsLabel: 'Istruzioni (Markdown, indicano all\'AI come eseguire)',
  skillFormInstructionsPlaceholder: 'Sei un esperto di...\n\n## Principi\n- ...',
  skillFormMemoryEnabled: 'Abilita iniezione memoria',
  skillFormSaveChanges: 'Salva modifiche',
  skillDisabled: 'Disabilitato',
  skillMemoryEnabled: 'Con memoria',
  skillToggleDisable: 'Disabilita',
  skillToggleEnable: 'Abilita',

  // GitHub import panel
  ghImportTitle: 'Importa Skill da GitHub',
  ghImportDescription: 'Supporta link a repository, directory o file SKILL.md. Il contenuto viene mostrato in anteprima prima dell\'importazione.',
  ghImportClose: 'Chiudi',
  ghImportPreview: 'Anteprima',
  ghImportPreviewing: 'Anteprima...',
  ghImportSelectAll: 'Seleziona tutto',
  ghImportDeselectAll: 'Deseleziona tutto',
  ghImportSelected: 'Selezionati {n} / {total} · {size}',
  ghImportCancel: 'Annulla',
  ghImportConfirm: 'Importa selezionati',
  ghImportImporting: 'Importazione...',
  ghImportSuccess: 'Importati {n} Skill',
  ghImportRenamed: '{n} Skill rinominati per conflitti di nome.',
  ghImportNeedsPermission: 'È necessario il permesso di accesso alle API GitHub per leggere il repository',
  ghImportPreviewFailed: 'Anteprima fallita',
  ghImportFailed: 'Importazione fallita',
  ghImportOpenRepo: 'Apri repository',
  ghImportSkillRenamed: 'Rinominato',
  ghImportMoreWarnings: '+ altri {n} avvisi',

  // Scenario manager
  scenarioTitle: 'Scenari menu contestuale',
  scenarioDescription: 'Seleziona del testo e fai clic destro per inviarlo alla chat della barra laterale',
  scenarioCustom: 'Scenari personalizzati',
  scenarioNamePlaceholder: 'Nome scenario',
  scenarioTemplatePlaceholder: 'Template Prompt (contiene {text})',
  scenarioAdd: 'Aggiungi',
  scenarioDelete: 'Elimina',
  scenarioSave: 'Salva',
  scenarioEdit: 'Modifica',

  // MCP page
  mcpTitle: 'MCP',
  mcpSummary: '{servers} server, {enabled} attivi, {tools} strumenti automatici',
  mcpAdd: 'Aggiungi',
  mcpEmpty: 'Nessun server MCP',
  mcpLoading: 'Caricamento configurazione MCP...',
  mcpFormCreate: 'Nuovo server MCP',
  mcpFormEdit: 'Modifica server MCP',
  mcpFormEnabled: 'Abilitato',
  mcpFormName: 'Nome',
  mcpFormTransport: 'Trasporto',
  mcpFormServiceUrl: 'URL servizio',
  mcpFormNativeHost: 'Native Host',
  mcpFormCommand: 'Comando',
  mcpFormArgs: 'Argomenti',
  mcpFormCwd: 'Directory di lavoro',
  mcpFormEnv: 'Variabili d\'ambiente',
  mcpFormConnectMs: 'Conn. ms',
  mcpFormRequestMs: 'Req. ms',
  mcpFormDiscoveryMs: 'Disc. ms',
  mcpFormMaxResultBytes: 'Byte max',
  mcpFormMaxToolCount: 'Max strumenti',
  mcpFormExecution: 'Esecuzione automatica',
  mcpFormAllowInject: 'Consenti iniezione',
  mcpFormAutoExec: 'Automatico',
  mcpFormManualExec: 'Manuale',
  mcpFormDisabledExec: 'Disabilitato',
  mcpFormHeadersAdd: 'Aggiungi',
  mcpFormSecretsAdd: 'Aggiungi',
  mcpServerTest: 'Test',
  mcpServerTesting: 'Test...',
  mcpServerRefresh: 'Aggiorna strumenti',
  mcpServerRefreshing: 'Aggiornamento...',
  mcpServerEdit: 'Modifica',
  mcpServerDelete: 'Elimina',
  mcpServerEnable: 'Abilitato',
  mcpServerGrant: 'Autorizza',
  mcpDetailStatus: 'Stato',
  mcpDetailLatency: 'Latenza',
  mcpDetailLastConn: 'Ultima conn.',
  mcpDetailTransport: 'Trasporto',
  mcpDetailExecPolicy: 'Politica esecuzione',
  mcpDetailTools: 'Strumenti trovati',
  mcpDetailNoTools: 'Nessuno strumento trovato',
  mcpDetailHistory: 'Chiamate recenti',
  mcpDetailNoHistory: 'Nessuna chiamata registrata',
  mcpDetailInjecting: 'Attualmente iniettando {n} strumenti; modalità disabilitata o manuale non entra nel prompt.',
  mcpDetailAutoLabel: 'Auto',
  mcpDetailDisabledLabel: 'Disabilitato',
  mcpHistorySuccess: 'OK',
  mcpHistoryFailed: 'Errore',
  mcpShellSetupTitle: 'Shell Native Host',
  mcpShellRunCommand: 'Apri il terminale ed esegui questo comando (una sola volta):',
  mcpShellNoteExtId: 'ID estensione {browser} rilevato automaticamente. Richiede Node.js/npm installato.',
  mcpShellNoteFixed: 'Firefox usa un ID estensione fisso — non è necessario specificarlo. Richiede Node.js/npm installato.',
  mcpShellNoteCapability: 'Shell MCP abilita l\'esecuzione di comandi locali e installa OfficeCLI.',
  mcpShellNoteEnableAfter: 'Dopo l\'installazione, attiva il servizio e clicca "Test" per verificare la connessione.',
  mcpShellNoteRestartAfter: 'Dopo l\'installazione riavvia il browser, poi clicca "Test" per verificare.',
  mcpShellExists: 'Shell MCP già esistente, selezionato.',
  mcpShellCreateFailed: 'Creazione preset Shell MCP fallita',
  mcpShellCreated: 'Preset Shell MCP creato. Esegui il comando di installazione e riavvia il browser.',
  mcpSaveError: 'Salvataggio server MCP fallito',
  mcpDeleteConfirm: 'Eliminare il server MCP "{name}"?',
  mcpSchemaNoParams: 'Parametri: nessuno',
  mcpSchemaParams: 'Parametri: {params}',
  mcpSchemaRequired: 'obbligatori: {required}',
  mcpTransportHintStreamable: 'Consigliato, compatibile con i nuovi server MCP HTTP',
  mcpTransportHintHttp: 'JSON-RPC over HTTP POST',
  mcpTransportHintSse: 'Trasporto MCP SSE legacy',
  mcpTransportHintStdio: 'Servizio bridge locale per avviare MCP stdio',
  mcpTransportHintNative: 'Accede alle funzionalità locali tramite Native Messaging',
  mcpErrorNameEmpty: 'Il nome non può essere vuoto',
  mcpErrorNativeHostEmpty: 'Native Host non può essere vuoto',
  mcpErrorNativeHostInvalid: 'Native Host può contenere solo lettere, cifre, punti, trattini bassi e trattini',
  mcpErrorUrlEmpty: 'URL servizio non può essere vuoto',
  mcpErrorUrlProtocol: 'L\'URL servizio supporta solo http/https',
  mcpErrorUrlInvalid: 'URL servizio non valido',
  mcpErrorCommandEmpty: 'Il comando Stdio Bridge non può essere vuoto',
  mcpErrorEnvInvalid: 'Formato variabile d\'ambiente non valido: {line}',
  mcpErrorTimeoutInvalid: '{label} deve essere un intero positivo',
  mcpErrorGranted: 'Autorizzato {origin}',
  mcpErrorGrantDenied: 'Autorizzazione negata',
  mcpConnectSuccess: 'Connessione OK, {count} strumenti, {latency}',
  mcpGrantedOrigin: 'Autorizzato {origin}',

  // Shell MCP setup messages
  shellErrorForbidden: 'Native Host installato ma non autorizzato per questo ID estensione. Riesegui il comando di installazione e riavvia il browser.',
  shellErrorNotFound: 'Native Host non trovato — esegui il comando di installazione e verifica che Node.js/npm siano installati.',
  shellErrorNativeUnavailable: 'Il browser non supporta Native Messaging. Usa Chrome, Edge o Firefox.',
  shellErrorNetworkError: 'Impossibile connettersi al Native Host — verifica l\'installazione e riavvia il browser.',
  shellConnected: 'Connesso, {count} strumenti trovati.',
  shellNotEnabled: 'Server creato ma non ancora abilitato. Installa prima il Native Host, poi abilita e testa.',
  shellNotInstalled: 'Installa prima il Native Host, poi clicca "Test" per verificare la connessione.',

  // Update banner
  updateAvailable: 'Aggiornamento disponibile: v{version}',
  updateDownload: 'Scarica e aggiorna',
  updateDismiss: 'Ignora',
  updateInstallHint: 'Scaricato! Estrai lo zip, poi in chrome://extensions ricarica l\'estensione dalla nuova cartella.',

  // Settings update section
  settingsUpdateSection: 'Aggiornamenti',
  settingsUpdateCurrent: 'Versione installata',
  settingsUpdateCheck: 'Cerca aggiornamenti',
  settingsUpdateChecking: 'Controllo in corso…',
  settingsUpdateUpToDate: '✓ Sei aggiornato',
  settingsUpdateAvailable: '↓ Disponibile v{version}',
  settingsUpdateLastChecked: 'Ultimo controllo: {time}',
  settingsUpdateNeverChecked: 'Non ancora verificato',
  settingsUpdateDownload: 'Scarica v{version}',
  settingsUpdateError: 'Errore di rete',
  settingsAutoUpdateSection: 'Aggiornamento automatico',
  settingsAutoUpdatePathLabel: 'Percorso del repository locale',
  settingsAutoUpdatePathPlaceholder: 'C:\\Users\\...\\deepseek-pp',
  settingsAutoUpdatePathHint: 'Cartella dove hai clonato il repo. Richiede Shell MCP attivo.',
  settingsAutoUpdateButton: '⚡ Aggiorna automaticamente',
  settingsAutoUpdatePulling: 'git pull in corso…',
  settingsAutoUpdateBuilding: 'Build in corso…',
  settingsAutoUpdateReloading: 'Ricarico l\'estensione…',
  settingsAutoUpdateSuccess: '✓ Aggiornato! Ricarico…',
  settingsAutoUpdateErrorShell: 'Errore Shell MCP — controlla che sia attivo e configurato',
  settingsAutoUpdateNoShell: 'Shell MCP non disponibile. Installa e configura Shell nella pagina MCP.',

  // About credits
  aboutFork: 'Fork di',
  aboutTranslation: 'Traduzione IT/EN: Boris Landoni & AI',

  // Chat page
  chatTitle: 'Chat',
  chatNewSession: 'Nuova sessione',
  chatEmptyHint: 'Digita un messaggio per iniziare',
  chatInputPlaceholder: 'Scrivi un messaggio... (Invio per inviare, Shift+Invio per andare a capo)',
  chatSend: 'Invia',
  chatSending: '...',
  chatLoginRequired: 'Accedi prima a chat.deepseek.com e invia un messaggio',
  chatLoginNote: 'Il plugin deve catturare le tue credenziali per la conversazione diretta',
  chatSkillActive: 'Skill attiva: /{name}',
  chatSkillNotFound: 'Skill /{name} non trovata',
  chatSkillHint: 'Digita / per usare una Skill',
  chatLoginStep1: '1. Apri chat.deepseek.com',
  chatLoginStep2: '2. Accedi al tuo account (se non sei già loggato)',
  chatLoginStep3: '3. Invia qualsiasi messaggio — l\'estensione catturerà le credenziali automaticamente',
  chatLoginOpen: 'Apri DeepSeek',
  chatLoginRetry: 'Ho inviato un messaggio →',
  chatLoginWaiting: 'In attesa delle credenziali…',

  // Onboarding
  onboardingTitle: 'Benvenuto in DeepSeek++',
  onboardingSubtitle: 'Scegli la lingua dell\'interfaccia',
  onboardingChoose: 'Puoi cambiare questa impostazione in qualsiasi momento nelle Impostazioni.',
  onboardingConfirm: 'Continua',
};

const en: Translations = {
  // Navigation
  tabChat: 'Chat',
  tabMemory: 'Memory',
  tabSkill: 'Skill',
  tabPreset: 'Presets',
  tabAutomation: 'Automation',
  tabMcp: 'MCP',
  tabTools: 'Tools',
  tabSettings: 'Settings',
  navAriaLabel: 'Side navigation',

  // Common
  loading: 'Loading...',
  cancel: 'Cancel',
  save: 'Save',
  update: 'Update',
  create: 'Create',
  delete: 'Delete',
  edit: 'Edit',
  confirm: 'Confirm',
  add: 'Add',
  import: 'Import',
  export: 'Export',
  new: 'New',
  custom: 'Custom',

  // Memory types
  memTypeUser: 'User',
  memTypeFeedback: 'Feedback',
  memTypeTopic: 'Topic',
  memTypeReference: 'Reference',

  // Memory page
  memFilterAll: 'All',
  memEmpty: 'No memories yet — they will accumulate during conversations',
  memEmptyCategory: 'No memories in this category',
  memTotal: 'Total {n} memories',
  memAdd: 'Add',

  // Memory form
  memFormTitle: 'Title',
  memFormContent: 'Content',
  memFormTags: 'Tags (comma-separated)',

  // Memory card
  memCardPin: 'Pin to top',
  memCardEdit: 'Edit',
  memCardDelete: 'Delete',
  timeJustNow: 'Just now',
  timeMinutesAgo: '{n}m ago',
  timeHoursAgo: '{n}h ago',
  timeDaysAgo: '{n}d ago',

  // Preset page
  presetTitle: 'System Prompt Presets',
  presetImport: 'Import',
  presetNew: 'New',
  presetEmptyHint: 'Create a system prompt preset to automatically inject it at the start of each new conversation.',
  presetActiveHint: 'The active preset is automatically injected into the first message of each new conversation. Only one preset can be active at a time.',
  presetActivated: 'Active',

  // Preset form
  presetFormNamePlaceholder: 'Preset name (e.g. Code Assistant, Translator)',
  presetFormContentLabel: 'System prompt content',

  // Skill page
  skillTitle: 'Available Skills',
  skillCustom: 'Custom',
  skillBuiltin: 'Built-in',
  skillOfficial: 'Official',
  skillRemote: 'GitHub',
  skillImportFile: 'Import skills from file',
  skillExportFile: 'Export skills to file',
  skillExportEmpty: 'No custom skills to export.',
  skillImportInvalid: 'Invalid JSON file.',
  skillImportNone: 'No valid skills found in the file.',
  skillImportDone: 'Imported {n} skills.',
  skillGitHubSource: 'GitHub Sources',
  skillGitHubImported: '{n} Skills',
  skillCheck: 'Check',
  skillSync: 'Sync',
  skillRemove: 'Remove',
  skillChecking: 'Checking...',
  skillSyncing: 'Syncing...',
  skillNoUpdates: 'No updates available',
  skillUpdatesFound: 'Updates found',
  skillHint: 'Type /skillName args in the DeepSeek input to trigger a skill. E.g.: /frontend-design create a login page',
  skillCheckError: 'Error checking for updates',
  skillSyncError: 'Error during sync',
  skillNeedsGitHubPermission: 'GitHub API access permission is required to check for updates',
  skillDeleteSourceConfirm: 'Remove the {n} Skills imported from {repo}?',

  // Automation page
  autoTitle: 'Automation',
  autoTaskCount: '{total} tasks, {active} active',
  autoNew: 'New',
  autoEmpty: 'No automations yet',
  autoFormName: 'Name',
  autoFormNamePlaceholder: 'Task name',
  autoFormModel: 'Model',
  autoFormModelDefault: 'Default',
  autoFormPromptLabel: 'Prompt',
  autoFormPromptPlaceholder: 'Enter the text to automatically send to DeepSeek',
  autoFormTrigger: 'Trigger',
  autoFormManual: 'Manual',
  autoFormExpression: 'Expression',
  autoFormTimezone: 'Timezone',
  autoFormSearch: 'Web search',
  autoFormThinking: 'Deep thinking',
  autoStatusActive: 'Active',
  autoStatusPaused: 'Paused',
  autoNext: 'Next',
  autoLast: 'Last',
  autoSession: 'Session',
  autoRecent: 'Recent',
  autoNone: 'None',
  autoNoSession: 'Not created',
  autoOpenSession: 'Open session',
  autoRunNow: 'Run now',
  autoRunning: 'Running',
  autoTogglePause: 'Pause',
  autoToggleResume: 'Resume',
  autoDeleteConfirm: 'Delete automation "{name}"?',
  autoValidationNamePrompt: 'Name and Prompt cannot be empty',
  autoValidationExpression: 'Please enter a schedule expression',
  autoRunFailed: 'Failed',
  autoRunQueued: 'Queued',
  autoRunSucceeded: 'Succeeded',
  autoRunTimeout: 'Timeout',
  autoRunCancelled: 'Cancelled',
  autoRunSkipped: 'Skipped',

  // Tools page
  toolsTitle: 'Tool Settings',
  toolsDescription: 'When disabled, the tool will not be injected into conversations and the AI cannot use it',
  toolsWebSearchName: 'Web Search (web_search)',
  toolsWebSearchDesc: 'Search Bing and return titles, URLs and summaries',
  toolsWebFetchName: 'Fetch Page (web_fetch)',
  toolsWebFetchDesc: 'Download a URL and extract visible text content',
  toolsDisabledNote: 'Disabled tools will not be available in new conversations. Existing conversations are not affected.',
  toolsDiagTitle: 'Search Diagnostics',
  toolsDiagDescription: 'Test search directly, bypassing the AI conversation chain',
  toolsDiagPlaceholder: 'Search keyword',
  toolsDiagRun: 'Diagnose',
  toolsDiagRunning: 'Diagnosing...',
  toolsDiagBytes: 'bytes',
  toolsDiagError: 'Error',
  toolsPermTitle: 'web_fetch Permissions',
  toolsPermDescription: 'Fetching a page requires permission for that site. Enter a URL and grant access.',
  toolsPermGrant: 'Grant',
  toolsPermGranting: 'Requesting...',
  toolsPermGranted: 'Permission granted, site access allowed',
  toolsPermDenied: 'Permission denied — try again or add manually in chrome://extensions',
  toolsPermInvalidUrl: 'Invalid URL — please enter a full URL (e.g. https://example.com)',
  toolsGrantAllSites: 'Authorize all sites',
  toolsGrantAllSitesGranted: 'All sites authorized',
  toolsGrantAllSitesGranting: 'Requesting...',
  toolsGrantAllSitesHint: 'Grant the extension access to all websites. After this, web_fetch will not show permission popups.',

  // MCP page
  mcpLoadError: 'Failed to load MCP configuration',

  // Settings page
  settingsModelSection: 'Model',
  settingsExpertMode: 'Expert Mode',
  settingsExpertModeDesc: 'Use the DeepSeek Expert model for conversations',
  settingsSidebarChat: 'Sidebar Chat',
  settingsSidebarChatDesc: 'Show the chat tab in the sidebar, supports direct DeepSeek API conversations',
  settingsPet: 'DeepSeek Mascot',
  settingsPetDesc: 'Show the animated mascot on the DeepSeek page',
  settingsBgSection: 'Background',
  settingsBgEnabled: 'Custom background',
  settingsBgEnabledDesc: 'Set a background image for the DeepSeek page',
  settingsBgUpload: 'Upload image',
  settingsBgUrlPlaceholder: 'Paste image URL',
  settingsBgConfirm: 'Confirm',
  settingsBgPreview: 'Preview',
  settingsBgOpacity: 'Background opacity',
  settingsBgClear: 'Remove background',
  settingsPetSection: 'Floating mascot',
  settingsPetPositionRight: 'Bottom right',
  settingsPetPositionLeft: 'Bottom left',
  settingsPetPositionCustom: 'Custom',
  settingsPetSize: 'Size',
  settingsPetOpacity: 'Opacity',
  settingsPetMotion: 'Floating animation',
  settingsPetMotionDesc: 'Disable to reduce motion',
  settingsSyncSection: 'Cloud sync',
  settingsSyncWebdavUrl: 'WebDAV URL',
  settingsSyncUsername: 'Username',
  settingsSyncPassword: 'Password',
  settingsSyncRemotePath: 'Remote path',
  settingsSyncTest: 'Test connection',
  settingsSyncUpload: 'Upload local',
  settingsSyncDownload: 'Download cloud',
  settingsSyncLastSync: 'Last sync: {time}',
  settingsSyncNever: 'Never synced',
  settingsSyncSuccess: 'Operation completed',
  settingsSyncTestSuccess: 'Connection successful',
  settingsSyncUploadSuccess: 'Upload complete, cloud data replaced. {counts}',
  settingsSyncDownloadSuccess: 'Download complete, local data replaced. {counts}',
  settingsSyncPermError: 'Permission required to connect to WebDAV server',
  settingsSyncFailed: 'Operation failed',
  settingsSyncUploadConfirm: 'Overwrite cloud data with local memories, Skills and presets?',
  settingsSyncDownloadConfirm: 'Overwrite local data with cloud memories, Skills and presets? This cannot be undone.',
  settingsSyncCountFmt: '{memories} memories, {skills} Skills, {presets} presets',
  settingsDataSection: 'Data management',
  settingsMemoryTotal: 'Total memories',
  settingsExportMemory: 'Export memories',
  settingsImportMemory: 'Import memories',
  settingsClearAll: 'Clear all memories',
  settingsClearConfirm: 'Clear all memories? This cannot be undone.',
  settingsJsonError: 'Invalid JSON format',
  settingsAbout: 'About',
  settingsAboutDesc: 'Agentic memory and Skill system',
  settingsLanguageSection: 'Language',
  settingsLanguageLabel: 'Interface language',

  // Preset activate/deactivate
  presetActivate: 'Activate',
  presetDeactivate: 'Deactivate',

  // Skill form
  skillFormNamePlaceholder: 'Name (e.g. my-skill)',
  skillFormTriggerHint: 'Trigger command: ',
  skillFormDescPlaceholder: 'Description (when to use this skill)',
  skillFormInstructionsLabel: 'Instructions (Markdown, tell the AI how to execute)',
  skillFormInstructionsPlaceholder: 'You are an expert in...\n\n## Core principles\n- ...',
  skillFormMemoryEnabled: 'Enable memory injection',
  skillFormSaveChanges: 'Save changes',
  skillDisabled: 'Disabled',
  skillMemoryEnabled: 'Memory',
  skillToggleDisable: 'Disable',
  skillToggleEnable: 'Enable',

  // GitHub import panel
  ghImportTitle: 'Import Skills from GitHub',
  ghImportDescription: 'Supports repo, directory or SKILL.md links. Content is previewed before import and will not overwrite local custom skills.',
  ghImportClose: 'Close',
  ghImportPreview: 'Preview',
  ghImportPreviewing: 'Previewing...',
  ghImportSelectAll: 'Select all',
  ghImportDeselectAll: 'Deselect all',
  ghImportSelected: 'Selected {n} / {total} · {size}',
  ghImportCancel: 'Cancel',
  ghImportConfirm: 'Import selected',
  ghImportImporting: 'Importing...',
  ghImportSuccess: 'Imported {n} Skills',
  ghImportRenamed: '{n} Skills were renamed due to naming conflicts.',
  ghImportNeedsPermission: 'GitHub API access permission is required to read the repository',
  ghImportPreviewFailed: 'Preview failed',
  ghImportFailed: 'Import failed',
  ghImportOpenRepo: 'Open repository',
  ghImportSkillRenamed: 'Renamed',
  ghImportMoreWarnings: '+ {n} more warnings',

  // Scenario manager
  scenarioTitle: 'Context menu scenarios',
  scenarioDescription: 'Select text and right-click to send it to the sidebar chat',
  scenarioCustom: 'Custom scenarios',
  scenarioNamePlaceholder: 'Scenario name',
  scenarioTemplatePlaceholder: 'Prompt template (contains {text})',
  scenarioAdd: 'Add',
  scenarioDelete: 'Delete',
  scenarioSave: 'Save',
  scenarioEdit: 'Edit',

  // MCP page
  mcpTitle: 'MCP',
  mcpSummary: '{servers} servers, {enabled} enabled, {tools} auto tools',
  mcpAdd: 'Add',
  mcpEmpty: 'No MCP servers',
  mcpLoading: 'Loading MCP configuration...',
  mcpFormCreate: 'New MCP server',
  mcpFormEdit: 'Edit MCP server',
  mcpFormEnabled: 'Enabled',
  mcpFormName: 'Name',
  mcpFormTransport: 'Transport',
  mcpFormServiceUrl: 'Service URL',
  mcpFormNativeHost: 'Native Host',
  mcpFormCommand: 'Command',
  mcpFormArgs: 'Arguments',
  mcpFormCwd: 'Working directory',
  mcpFormEnv: 'Environment variables',
  mcpFormConnectMs: 'Conn. ms',
  mcpFormRequestMs: 'Req. ms',
  mcpFormDiscoveryMs: 'Disc. ms',
  mcpFormMaxResultBytes: 'Max bytes',
  mcpFormMaxToolCount: 'Max tools',
  mcpFormExecution: 'Auto execution',
  mcpFormAllowInject: 'Allow injection',
  mcpFormAutoExec: 'Automatic',
  mcpFormManualExec: 'Manual',
  mcpFormDisabledExec: 'Disabled',
  mcpFormHeadersAdd: 'Add',
  mcpFormSecretsAdd: 'Add',
  mcpServerTest: 'Test',
  mcpServerTesting: 'Testing...',
  mcpServerRefresh: 'Refresh tools',
  mcpServerRefreshing: 'Refreshing...',
  mcpServerEdit: 'Edit',
  mcpServerDelete: 'Delete',
  mcpServerEnable: 'Enabled',
  mcpServerGrant: 'Authorize',
  mcpDetailStatus: 'Status',
  mcpDetailLatency: 'Latency',
  mcpDetailLastConn: 'Last conn.',
  mcpDetailTransport: 'Transport',
  mcpDetailExecPolicy: 'Execution policy',
  mcpDetailTools: 'Discovered tools',
  mcpDetailNoTools: 'No tools discovered yet',
  mcpDetailHistory: 'Recent calls',
  mcpDetailNoHistory: 'No call history',
  mcpDetailInjecting: 'Currently injecting {n} tools; disabled or manual mode won\'t appear in DeepSeek prompt.',
  mcpDetailAutoLabel: 'Auto',
  mcpDetailDisabledLabel: 'Disabled',
  mcpHistorySuccess: 'OK',
  mcpHistoryFailed: 'Error',
  mcpShellSetupTitle: 'Shell Native Host',
  mcpShellRunCommand: 'Open a terminal and run this command (once only):',
  mcpShellNoteExtId: '{browser} extension ID auto-detected. Requires Node.js/npm installed.',
  mcpShellNoteFixed: 'Firefox uses a fixed extension ID — no need to specify it. Requires Node.js/npm installed.',
  mcpShellNoteCapability: 'Shell MCP enables local command execution and installs OfficeCLI by default.',
  mcpShellNoteEnableAfter: 'After installation, enable the service and click "Test" to verify the connection.',
  mcpShellNoteRestartAfter: 'After installation restart the browser, then click "Test" to verify.',
  mcpShellExists: 'Shell MCP already exists, selected.',
  mcpShellCreateFailed: 'Failed to create Shell MCP preset',
  mcpShellCreated: 'Shell MCP preset created. Run the install command and restart the browser.',
  mcpSaveError: 'Failed to save MCP server',
  mcpDeleteConfirm: 'Delete MCP server "{name}"?',
  mcpSchemaNoParams: 'Params: none',
  mcpSchemaParams: 'Params: {params}',
  mcpSchemaRequired: 'required: {required}',
  mcpTransportHintStreamable: 'Recommended, compatible with new MCP HTTP servers',
  mcpTransportHintHttp: 'JSON-RPC over HTTP POST',
  mcpTransportHintSse: 'Legacy MCP SSE transport',
  mcpTransportHintStdio: 'Local bridge service to launch stdio MCP',
  mcpTransportHintNative: 'Access local capabilities via Native Messaging Host',
  mcpErrorNameEmpty: 'Name cannot be empty',
  mcpErrorNativeHostEmpty: 'Native Host cannot be empty',
  mcpErrorNativeHostInvalid: 'Native Host can only contain letters, digits, dots, underscores and hyphens',
  mcpErrorUrlEmpty: 'Service URL cannot be empty',
  mcpErrorUrlProtocol: 'Service URL only supports http/https',
  mcpErrorUrlInvalid: 'Invalid service URL',
  mcpErrorCommandEmpty: 'Stdio Bridge command cannot be empty',
  mcpErrorEnvInvalid: 'Invalid environment variable format: {line}',
  mcpErrorTimeoutInvalid: '{label} must be a positive integer',
  mcpErrorGranted: 'Authorized {origin}',
  mcpErrorGrantDenied: 'Authorization denied',
  mcpConnectSuccess: 'Connected, {count} tools, {latency}',
  mcpGrantedOrigin: 'Authorized {origin}',

  // Shell MCP setup messages
  shellErrorForbidden: 'Native Host installed but not authorized for this extension ID. Re-run the install command and restart the browser.',
  shellErrorNotFound: 'Native Host not found — run the install command and verify Node.js/npm are installed.',
  shellErrorNativeUnavailable: 'Browser does not support Native Messaging. Use Chrome, Edge or Firefox.',
  shellErrorNetworkError: 'Cannot connect to Native Host — verify installation and restart the browser.',
  shellConnected: 'Connected, {count} tools found.',
  shellNotEnabled: 'Server created but not yet enabled. Install the Native Host first, then enable and test.',
  shellNotInstalled: 'Install the Native Host first, then click "Test" to verify the connection.',

  // Update banner
  updateAvailable: 'Update available: v{version}',
  updateDownload: 'Download & update',
  updateDismiss: 'Dismiss',
  updateInstallHint: 'Downloaded! Extract the zip, then in chrome://extensions reload the extension from the new folder.',

  // Settings update section
  settingsUpdateSection: 'Updates',
  settingsUpdateCurrent: 'Installed version',
  settingsUpdateCheck: 'Check for updates',
  settingsUpdateChecking: 'Checking…',
  settingsUpdateUpToDate: '✓ You are up to date',
  settingsUpdateAvailable: '↓ Available v{version}',
  settingsUpdateLastChecked: 'Last checked: {time}',
  settingsUpdateNeverChecked: 'Never checked',
  settingsUpdateDownload: 'Download v{version}',
  settingsUpdateError: 'Network error',
  settingsAutoUpdateSection: 'Auto-update',
  settingsAutoUpdatePathLabel: 'Local repository path',
  settingsAutoUpdatePathPlaceholder: 'C:\\Users\\...\\deepseek-pp',
  settingsAutoUpdatePathHint: 'Folder where you cloned the repo. Requires Shell MCP active.',
  settingsAutoUpdateButton: '⚡ Update automatically',
  settingsAutoUpdatePulling: 'Running git pull…',
  settingsAutoUpdateBuilding: 'Building…',
  settingsAutoUpdateReloading: 'Reloading extension…',
  settingsAutoUpdateSuccess: '✓ Updated! Reloading…',
  settingsAutoUpdateErrorShell: 'Shell MCP error — check it is active and configured',
  settingsAutoUpdateNoShell: 'Shell MCP not available. Install and configure Shell in the MCP page.',

  // About credits
  aboutFork: 'Fork of',
  aboutTranslation: 'IT/EN translation: Boris Landoni & AI',

  // Chat page
  chatTitle: 'Chat',
  chatNewSession: 'New session',
  chatEmptyHint: 'Type a message to start',
  chatInputPlaceholder: 'Type a message... (Enter to send, Shift+Enter for newline)',
  chatSend: 'Send',
  chatSending: '...',
  chatLoginRequired: 'Please log in to chat.deepseek.com and send a message first',
  chatLoginNote: 'The extension needs to capture your credentials for direct conversation',
  chatSkillActive: 'Active skill: /{name}',
  chatSkillNotFound: 'Skill /{name} not found',
  chatSkillHint: 'Type / to use a Skill',
  chatLoginStep1: '1. Open chat.deepseek.com',
  chatLoginStep2: '2. Log in to your account (if not already logged in)',
  chatLoginStep3: '3. Send any message — the extension will capture your credentials automatically',
  chatLoginOpen: 'Open DeepSeek',
  chatLoginRetry: 'I sent a message →',
  chatLoginWaiting: 'Waiting for credentials…',

  // Onboarding
  onboardingTitle: 'Welcome to DeepSeek++',
  onboardingSubtitle: 'Choose your interface language',
  onboardingChoose: 'You can change this at any time in Settings.',
  onboardingConfirm: 'Continue',
};

export const TRANSLATIONS: Record<Language, Translations> = { it, en };

export const LANGUAGE_NAMES: Record<Language, string> = {
  it: 'Italiano',
  en: 'English',
};
