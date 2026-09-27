/**
 * Colorization pour OnlyOffice — Plugin lifecycle et gestion UI
 * Point d'entrée principal du plugin OnlyOffice
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    // ========================================================================
    // Plugin lifecycle
    // ========================================================================

    window.Asc.plugin.init = function() {
        // Initialize configuration
        C.Config.initCerasRose();
        C.Config.loadConfig();

        // Build UI
        C.Config.buildSoundGrid();
        initTabs();
        initEventHandlers();

        // Initial preview
        try {
            C.Config.updatePreview();
        } catch (e) {
            // Preview might fail if engine not fully loaded yet
            console.log('Preview init deferred:', e.message);
        }
    };

    window.Asc.plugin.button = function(id) {
        this.executeCommand('close', '');
    };

    // ========================================================================
    // Tab navigation
    // ========================================================================

    function initTabs() {
        var tabs = document.querySelectorAll('.tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function() {
                // Deactivate all tabs
                var allTabs = document.querySelectorAll('.tab');
                var allContents = document.querySelectorAll('.tab-content');
                for (var j = 0; j < allTabs.length; j++) {
                    allTabs[j].classList.remove('active');
                    allContents[j].classList.remove('active');
                }
                // Activate clicked tab
                this.classList.add('active');
                var targetId = 'tab-' + this.dataset.tab;
                var target = document.getElementById(targetId);
                if (target) target.classList.add('active');
            });
        }
    }

    // ========================================================================
    // Event handlers
    // ========================================================================

    function initEventHandlers() {
        // Phoneme colorization
        var btnPhon = document.getElementById('btn-colorize-phonemes');
        if (btnPhon) {
            btnPhon.addEventListener('click', function() {
                C.Colorizer.colorizePhonemes();
            });
        }

        // Remove colors
        var btnRemove = document.getElementById('btn-remove-colors');
        if (btnRemove) {
            btnRemove.addEventListener('click', function() {
                C.Colorizer.removeColors();
            });
        }

        // Syllable colorization
        var btnSyl = document.getElementById('btn-colorize-syllables');
        if (btnSyl) {
            btnSyl.addEventListener('click', function() {
                C.Colorizer.colorizeSyllables();
            });
        }

        // BPDQ colorization
        var btnBpdq = document.getElementById('btn-colorize-bpdq');
        if (btnBpdq) {
            btnBpdq.addEventListener('click', function() {
                C.Colorizer.colorizeBPDQ();
            });
        }

        // Voyelles/Consonnes colorization
        var btnVoyCons = document.getElementById('btn-colorize-voycons');
        if (btnVoyCons) {
            btnVoyCons.addEventListener('click', function() {
                C.Colorizer.colorizeVoyCons();
            });
        }

        // Preset selector
        var presetSelect = document.getElementById('preset-select');
        if (presetSelect) {
            presetSelect.addEventListener('change', function() {
                switch (this.value) {
                    case 'ceras-rose':
                        C.Config.initCerasRose();
                        break;
                    case 'ceras':
                        C.Config.initCeras();
                        break;
                    case 'custom':
                        // Keep current config
                        break;
                }
                C.Config.buildSoundGrid();
                C.Config.updatePreview();
            });
        }

        // Syllable mode
        var sylMode = document.getElementById('syl-mode');
        if (sylMode) {
            sylMode.addEventListener('change', function() {
                C.Config.current.sylMode = this.value;
            });
        }

        // Syllable colors
        var sylColors = document.querySelectorAll('.syl-color');
        for (var i = 0; i < sylColors.length; i++) {
            sylColors[i].addEventListener('input', function() {
                var idx = parseInt(this.dataset.idx);
                C.Config.current.sylColors[idx] = C.Config.hexToRgb(this.value);
            });
        }

        // Syllable number of colors
        var sylNumColors = document.getElementById('syl-num-colors');
        if (sylNumColors) {
            sylNumColors.addEventListener('change', function() {
                C.Config.current.sylNumColors = parseInt(this.value);
            });
        }

        // Ignore monosyllables
        var sylIgnoreMono = document.getElementById('syl-ignore-mono');
        if (sylIgnoreMono) {
            sylIgnoreMono.addEventListener('change', function() {
                C.Config.current.sylIgnoreMono = this.checked;
            });
        }

        // BPDQ color pickers
        ['b', 'p', 'd', 'q'].forEach(function(letter) {
            var picker = document.getElementById('bpdq-' + letter);
            if (picker) {
                picker.addEventListener('input', function() {
                    C.Config.current.bpdq[letter] = C.Config.hexToRgb(this.value);
                    var letterEl = this.parentElement.querySelector('.bpdq-letter');
                    if (letterEl) letterEl.style.color = this.value;
                });
            }
        });

        // Voyelles/Consonnes color pickers
        var colorVoy = document.getElementById('color-voyelles');
        if (colorVoy) {
            colorVoy.addEventListener('input', function() {
                C.Config.current.voyelles = C.Config.hexToRgb(this.value);
            });
        }

        var colorCons = document.getElementById('color-consonnes');
        if (colorCons) {
            colorCons.addEventListener('input', function() {
                C.Config.current.consonnes = C.Config.hexToRgb(this.value);
            });
        }

        // Region selector (Belgium / France)
        var regionSelect = document.getElementById('phonology-region');
        if (regionSelect) {
            regionSelect.addEventListener('change', function() {
                C.Config.applyRegionPreset(this.value);
                C.Config.buildSoundGrid();
                C.Config.updatePreview();
            });
        }

        // Config tab handlers
        // Ill rule
        var illRadios = document.querySelectorAll('input[name="ill-rule"]');
        for (var i = 0; i < illRadios.length; i++) {
            illRadios[i].addEventListener('change', function() {
                C.Config.current.flags.IllCeras = (this.value === 'ceras');
                C.Config.current.flags.IllLireCouleur = (this.value === 'lirecouleur');
                C.Config.updatePreview();
            });
        }

        // Global bar — Alternate line highlighting
        var btnAltLines = document.getElementById('btn-alt-lines-global');
        if (btnAltLines) {
            btnAltLines.addEventListener('click', function() {
                var colorInput = document.getElementById('alt-line-color-global');
                if (colorInput) {
                    var rgb = C.Config.hexToRgb(colorInput.value);
                    C.Config.current.altLineColor1 = rgb;
                }
                C.Colorizer.highlightAlternateLines();
            });
        }

        var btnAltLinesOff = document.getElementById('btn-alt-lines-off-global');
        if (btnAltLinesOff) {
            btnAltLinesOff.addEventListener('click', function() {
                C.Colorizer.removeAlternateLines();
            });
        }

        // Global bar — Split sentences (1 phrase = 1 ligne)
        var btnSplit = document.getElementById('btn-split-sentences');
        if (btnSplit) {
            btnSplit.addEventListener('click', function() {
                C.Colorizer.splitSentences();
            });
        }

        // Global bar — Remove all colors
        var btnRemoveGlobal = document.getElementById('btn-remove-colors-global');
        if (btnRemoveGlobal) {
            btnRemoveGlobal.addEventListener('click', function() {
                C.Colorizer.removeColors();
            });
        }

        // Default behavior
        var defBehRadios = document.querySelectorAll('input[name="def-beh"]');
        for (var i = 0; i < defBehRadios.length; i++) {
            defBehRadios[i].addEventListener('change', function() {
                C.Config.current.defBeh = this.value;
                C.Config.updatePreview();
            });
        }

        // Save/Load/Export config
        var btnSave = document.getElementById('btn-save-config');
        if (btnSave) {
            btnSave.addEventListener('click', function() {
                C.Config.saveConfig();
            });
        }

        var btnExport = document.getElementById('btn-export-config');
        if (btnExport) {
            btnExport.addEventListener('click', function() {
                C.Config.exportConfig();
            });
        }
    }

})(window.Colorization);
