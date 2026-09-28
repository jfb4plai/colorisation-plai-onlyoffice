/**
 * Colorization pour OnlyOffice — Configuration et gestion UI des sons
 * Port JavaScript de ColConfWin.cs / SylConfig.cs (Pierre-Alain Etique, GPL-3.0)
 *
 * Système de graphèmes liés :
 *   Chaque son peut regrouper plusieurs phonèmes (ex: son 'o' = [o] simple + [o_comp] eau/au).
 *   Chaque phonème variant peut être activé/désactivé individuellement.
 *   Les presets régionaux (BE/FR) pré-configurent ces graphèmes liés.
 *   L'enseignant peut toujours intervenir manuellement.
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    // ══════════════════════════════════════════════════════════════
    //  Runtime configuration
    // ══════════════════════════════════════════════════════════════

    var currentConfig = {
        flags: {
            IllCeras: true,
            IllLireCouleur: false
        },
        sons: {},           // {sonName: {enabled, color, graphemes: {phoneme: bool}}}
        region: 'be',
        defBeh: 'transparent',
        sylMode: 'ecrit',
        sylColors: [
            { r: 0, g: 0, b: 255 },
            { r: 255, g: 0, b: 0 },
            { r: 0, g: 170, b: 0 },
            { r: 255, g: 136, b: 0 }
        ],
        sylNumColors: 2,
        sylIgnoreMono: false,
        bpdq: {
            b: { r: 255, g: 0, b: 0 },
            p: { r: 0, g: 100, b: 0 },
            d: { r: 0, g: 0, b: 255 },
            q: { r: 139, g: 69, b: 19 }
        },
        voyelles: { r: 255, g: 0, b: 0 },
        consonnes: { r: 0, g: 0, b: 255 }
    };

    // ══════════════════════════════════════════════════════════════
    //  Graphemes liés — helpers
    // ══════════════════════════════════════════════════════════════

    /**
     * Build the graphemes sub-config for a given son.
     * Each phoneme in SonMap[son] gets an entry: true (enabled) or false.
     */
    function buildGraphemes(son, region) {
        // Sons à graphies distinctes (an/am/en/em, in/im/ain/ein...) : toutes
        // les graphies activées par défaut, indépendamment de la région.
        if (C.SpellingGroups && C.SpellingGroups[son]) {
            var spellingGraphemes = {};
            var groupKeys = Object.keys(C.SpellingGroups[son]);
            for (var gi = 0; gi < groupKeys.length; gi++) {
                spellingGraphemes[groupKeys[gi]] = true;
            }
            return spellingGraphemes;
        }

        var phonemes = C.SonMap[son];
        if (!phonemes || phonemes.length <= 1) return null; // no sub-config needed

        var defaults = (region === 'fr') ? C.GraphemeDefaultsFR : C.GraphemeDefaultsBE;
        var graphemes = {};
        for (var i = 0; i < phonemes.length; i++) {
            var p = phonemes[i];
            graphemes[p] = (defaults[p] !== undefined) ? defaults[p] : true;
        }
        return graphemes;
    }

    /**
     * Check if a specific occurrence (phoneme + graphie réellement écrite) is
     * enabled within its son (both the son must be enabled AND the grapheme
     * must be enabled). Pour les sons à graphies distinctes (spellingBased),
     * la clé vérifiée est la graphie classée via classifySpelling, pas le
     * phonème du moteur (qui ne distingue pas an/en).
     */
    function isPhonemeEnabled(sonConfig, phoneme, chars) {
        if (!sonConfig || !sonConfig.enabled) return false;
        // If no graphemes sub-config, all phonemes in the son are enabled
        if (!sonConfig.graphemes) return true;

        if (sonConfig.spellingBased) {
            var son = C.phonemeToSon[phoneme];
            var key = C.classifySpelling(son, chars);
            if (!key) return true;
            return sonConfig.graphemes[key] !== false;
        }

        // Check specific grapheme
        return sonConfig.graphemes[phoneme] !== false;
    }

    // ══════════════════════════════════════════════════════════════
    //  Initialization
    // ══════════════════════════════════════════════════════════════

    function initCerasRose() {
        var region = currentConfig.region || 'be';
        var sons = {};
        var allSons = Object.keys(C.SonInfo);

        for (var i = 0; i < allSons.length; i++) {
            var son = allSons[i];
            sons[son] = {
                enabled: false,
                color: { r: 0, g: 0, b: 0 },
                graphemes: buildGraphemes(son, region),
                spellingBased: !!(C.SpellingGroups && C.SpellingGroups[son])
            };
        }

        // Enable CERAS-rose defaults
        var defaults = C.DefaultSonConfig;
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                sons[key].enabled = defaults[key].enabled;
                sons[key].color = {
                    r: defaults[key].color.r,
                    g: defaults[key].color.g,
                    b: defaults[key].color.b,
                    bold: defaults[key].color.bold || false,
                    italic: defaults[key].color.italic || false,
                    underline: defaults[key].color.underline || false
                };
            }
        }

        currentConfig.sons = sons;
        currentConfig.flags.IllCeras = true;
        currentConfig.flags.IllLireCouleur = false;
    }

    function initCeras() {
        initCerasRose();
        if (currentConfig.sons['é']) {
            currentConfig.sons['é'].color = { r: 0, g: 20, b: 208 };
        }
    }

    /**
     * Apply region preset: update grapheme defaults for all sons
     */
    function applyRegionPreset(region) {
        currentConfig.region = region;
        var defaults = (region === 'fr') ? C.GraphemeDefaultsFR : C.GraphemeDefaultsBE;

        for (var son in currentConfig.sons) {
            if (!currentConfig.sons.hasOwnProperty(son)) continue;
            var sonCfg = currentConfig.sons[son];
            if (!sonCfg.graphemes) continue;
            for (var p in sonCfg.graphemes) {
                if (defaults[p] !== undefined) {
                    sonCfg.graphemes[p] = defaults[p];
                }
            }
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  Color lookup
    // ══════════════════════════════════════════════════════════════

    /**
     * Get the color for a given phoneme based on current config
     * Checks both son-level AND grapheme-level enable
     */
    function getPhonemeColor(phoneme, chars) {
        var son = C.phonemeToSon[phoneme];
        if (!son) return null;

        var sonConfig = currentConfig.sons[son];
        if (!isPhonemeEnabled(sonConfig, phoneme, chars)) {
            if (currentConfig.defBeh === 'noir') {
                return { r: 0, g: 0, b: 0 };
            }
            return null;
        }
        return sonConfig.color;
    }

    // ══════════════════════════════════════════════════════════════
    //  UI — Sound grid with graphèmes liés
    // ══════════════════════════════════════════════════════════════

    function buildSoundGrid() {
        var grid = document.getElementById('sound-grid');
        if (!grid) return;
        grid.innerHTML = '';

        var sonOrder = [
            'a', 'i', 'u', 'y', 'o', 'é', 'è', 'eu',
            'an', 'on', 'in', '1', 'oi', 'oin',
            'p', 'b', 't', 'd', 'k', 'g',
            'f', 'v', 's', 'z', 'ch', 'ge',
            'm', 'n', 'l', 'r', 'gn', 'ks', 'gz',
            'j', 'ill', 'w', 'ng', 'ij',
            '_muet', 'q_caduc', 'q'
        ];

        for (var i = 0; i < sonOrder.length; i++) {
            var son = sonOrder[i];
            var info = C.SonInfo[son];
            if (!info) continue;

            var config = currentConfig.sons[son] ||
                         { enabled: false, color: { r: 128, g: 128, b: 128 }, graphemes: null };

            // ── Sound item container ──
            var wrapper = document.createElement('div');
            wrapper.className = 'sound-wrapper';

            var item = document.createElement('div');
            item.className = 'sound-item' + (config.enabled ? ' enabled' : '');
            item.dataset.son = son;

            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = config.enabled;

            var label = document.createElement('span');
            label.className = 'sound-label';
            label.textContent = info.label;
            label.title = info.example;

            var colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = rgbToHex(config.color);

            // ── Avertissement de contraste (WCAG AA sur fond blanc) ──
            var contrastWarning = document.createElement('span');
            contrastWarning.className = 'contrast-warning';
            contrastWarning.textContent = '⚠';
            contrastWarning.style.display = 'none';

            function refreshContrastWarning(color) {
                var ratio = contrastRatioOnWhite(color);
                if (ratio < 4.5) {
                    contrastWarning.style.display = '';
                    contrastWarning.title = 'Contraste faible sur fond blanc (' + ratio.toFixed(1) +
                        ':1, seuil recommandé 4.5:1). Peut être difficile à lire pour un élève malvoyant.';
                } else {
                    contrastWarning.style.display = 'none';
                }
            }
            refreshContrastWarning(config.color);

            item.appendChild(cb);
            item.appendChild(label);
            item.appendChild(colorPicker);
            item.appendChild(contrastWarning);

            // ── Graphemes liés (expand toggle) ──
            var hasGraphemes = config.graphemes && Object.keys(config.graphemes).length > 1;

            if (hasGraphemes) {
                var toggleBtn = document.createElement('span');
                toggleBtn.className = 'grapheme-toggle';
                toggleBtn.textContent = '▸';
                toggleBtn.title = 'Graphèmes liés';
                item.appendChild(toggleBtn);
            }

            wrapper.appendChild(item);

            // ── Graphemes panel (hidden by default) ──
            if (hasGraphemes) {
                var panel = document.createElement('div');
                panel.className = 'grapheme-panel';
                panel.style.display = 'none';

                var phonemes, getGraphemeInfo;
                if (config.spellingBased && C.SpellingGroups[son]) {
                    phonemes = Object.keys(C.SpellingGroups[son]);
                    getGraphemeInfo = function (k) { return C.SpellingGroups[son][k]; };
                } else {
                    phonemes = C.SonMap[son];
                    getGraphemeInfo = function (k) { return C.GraphemeInfo[k]; };
                }

                for (var pi = 0; pi < phonemes.length; pi++) {
                    var phoneme = phonemes[pi];
                    var gInfo = getGraphemeInfo(phoneme);
                    if (!gInfo) continue;

                    var gRow = document.createElement('label');
                    gRow.className = 'grapheme-row';

                    var gCb = document.createElement('input');
                    gCb.type = 'checkbox';
                    gCb.checked = config.graphemes[phoneme] !== false;
                    gCb.dataset.son = son;
                    gCb.dataset.phoneme = phoneme;

                    var gLabel = document.createElement('span');
                    gLabel.className = 'grapheme-label';
                    gLabel.textContent = gInfo.label;

                    var gExample = document.createElement('span');
                    gExample.className = 'grapheme-example';
                    gExample.textContent = gInfo.example;

                    gRow.appendChild(gCb);
                    gRow.appendChild(gLabel);
                    gRow.appendChild(gExample);
                    panel.appendChild(gRow);

                    // Grapheme checkbox handler
                    (function(s, p) {
                        gCb.addEventListener('change', function() {
                            if (currentConfig.sons[s] && currentConfig.sons[s].graphemes) {
                                currentConfig.sons[s].graphemes[p] = this.checked;
                            }
                            updatePreview();
                        });
                    })(son, phoneme);
                }

                wrapper.appendChild(panel);

                // Toggle handler
                (function(toggleEl, panelEl) {
                    toggleEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        var visible = panelEl.style.display !== 'none';
                        panelEl.style.display = visible ? 'none' : 'block';
                        toggleEl.textContent = visible ? '▸' : '▾';
                    });
                })(toggleBtn, panel);
            }

            grid.appendChild(wrapper);

            // ── Sound-level event handlers ──
            (function(s, itemEl, wrapperEl) {
                cb.addEventListener('change', function() {
                    if (currentConfig.sons[s]) {
                        currentConfig.sons[s].enabled = this.checked;
                    }
                    itemEl.className = 'sound-item' + (this.checked ? ' enabled' : '');
                    updatePreview();
                });
                colorPicker.addEventListener('input', function() {
                    var rgb = hexToRgb(this.value);
                    if (currentConfig.sons[s]) {
                        currentConfig.sons[s].color = rgb;
                    }
                    refreshContrastWarning(rgb);
                    updatePreview();
                });
            })(son, item, wrapper);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  UI — Lettres à discriminer (liste éditable, ex. b/d/p/q, v/f, t/d)
    // ══════════════════════════════════════════════════════════════

    /**
     * Ajoute une lettre à discriminer avec sa couleur.
     * Refuse les doublons et les caractères qui ne sont pas une lettre.
     */
    function addLettre(letter, color) {
        letter = (letter || '').trim().toLowerCase().charAt(0);
        if (!letter || !/[a-zàâäéèêëîïôöùûüç]/.test(letter)) return false;
        if (currentConfig.bpdq[letter]) return false;
        currentConfig.bpdq[letter] = color || { r: 51, g: 51, b: 51 };
        return true;
    }

    function removeLettre(letter) {
        delete currentConfig.bpdq[letter];
    }

    function buildLettresGrid() {
        var grid = document.getElementById('lettres-grid');
        if (!grid) return;
        grid.innerHTML = '';

        var letters = Object.keys(currentConfig.bpdq);
        for (var i = 0; i < letters.length; i++) {
            var letter = letters[i];
            var color = currentConfig.bpdq[letter];

            var item = document.createElement('div');
            item.className = 'lettre-item';

            var span = document.createElement('span');
            span.className = 'lettre-letter';
            span.textContent = letter;
            span.style.color = rgbToHex(color);

            var picker = document.createElement('input');
            picker.type = 'color';
            picker.value = rgbToHex(color);

            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'lettre-remove';
            removeBtn.textContent = '×';
            removeBtn.title = 'Retirer cette lettre';

            item.appendChild(span);
            item.appendChild(picker);
            item.appendChild(removeBtn);
            grid.appendChild(item);

            (function (l, spanEl) {
                picker.addEventListener('input', function () {
                    currentConfig.bpdq[l] = hexToRgb(this.value);
                    spanEl.style.color = this.value;
                });
                removeBtn.addEventListener('click', function () {
                    removeLettre(l);
                    buildLettresGrid();
                });
            })(letter, span);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  Preview
    // ══════════════════════════════════════════════════════════════

    function updatePreview() {
        var previewEl = document.getElementById('preview-text');
        if (!previewEl) return;

        var text = 'Le petit chat boit du lait dans un bol bleu.';
        var analysis = C.Automat.analyzeText(text, currentConfig);

        var html = '';
        var lastIdx = 0;

        for (var i = 0; i < analysis.length; i++) {
            var wordInfo = analysis[i];
            if (wordInfo.start > lastIdx) {
                html += escapeHtml(text.substring(lastIdx, wordInfo.start));
            }
            for (var j = 0; j < wordInfo.phonemes.length; j++) {
                var phon = wordInfo.phonemes[j];
                var chars = wordInfo.word.substring(phon.start, phon.end + 1);
                var color = getPhonemeColor(phon.phoneme, chars);

                if (color) {
                    var style = 'color:rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
                    if (color.bold) style += ';font-weight:bold';
                    if (color.italic) style += ';font-style:italic';
                    if (color.underline) style += ';text-decoration:underline';
                    html += '<span style="' + style + '">' + escapeHtml(chars) + '</span>';
                } else {
                    html += escapeHtml(chars);
                }
            }
            lastIdx = wordInfo.start + wordInfo.word.length;
        }
        if (lastIdx < text.length) {
            html += escapeHtml(text.substring(lastIdx));
        }

        previewEl.innerHTML = html;
    }

    // ══════════════════════════════════════════════════════════════
    //  Utilities
    // ══════════════════════════════════════════════════════════════

    /**
     * Ratio de contraste WCAG d'une couleur de texte sur fond blanc
     * (formule officielle de luminance relative sRGB).
     * Seuils WCAG AA : 4.5:1 texte normal, 3:1 texte large/gras/souligné.
     */
    function contrastRatioOnWhite(c) {
        function lin(v) {
            v = v / 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        }
        var L = 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
        return 1.05 / (L + 0.05);
    }

    function rgbToHex(c) {
        return '#' + ((1 << 24) + ((c.r || 0) << 16) + ((c.g || 0) << 8) + (c.b || 0)).toString(16).slice(1);
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ══════════════════════════════════════════════════════════════
    //  Persistence
    // ══════════════════════════════════════════════════════════════

    function saveConfig() {
        try {
            localStorage.setItem('colorization-plai-config', JSON.stringify(currentConfig));
        } catch (e) { /* ignore */ }
    }

    function loadConfig() {
        try {
            var saved = localStorage.getItem('colorization-plai-config');
            if (saved) {
                var parsed = JSON.parse(saved);
                for (var key in parsed) {
                    if (currentConfig.hasOwnProperty(key)) {
                        currentConfig[key] = parsed[key];
                    }
                }
            }
        } catch (e) { /* ignore */ }
    }

    function exportConfig() {
        var blob = new Blob([JSON.stringify(currentConfig, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'colorization-plai-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ══════════════════════════════════════════════════════════════
    //  Public API
    // ══════════════════════════════════════════════════════════════

    C.Config = {
        current: currentConfig,
        initCerasRose: initCerasRose,
        initCeras: initCeras,
        applyRegionPreset: applyRegionPreset,
        getPhonemeColor: getPhonemeColor,
        buildSoundGrid: buildSoundGrid,
        addLettre: addLettre,
        removeLettre: removeLettre,
        buildLettresGrid: buildLettresGrid,
        updatePreview: updatePreview,
        saveConfig: saveConfig,
        loadConfig: loadConfig,
        exportConfig: exportConfig,
        rgbToHex: rgbToHex,
        hexToRgb: hexToRgb,
        contrastRatioOnWhite: contrastRatioOnWhite
    };

})(window.Colorization);
