/**
 * Colorization pour OnlyOffice — Colorizer
 * Applique les couleurs phonémiques, syllabiques, BPDQ et V/C au document.
 *
 * Architecture « safe 2-step » :
 *   1. callCommand() pour extraire les textes (sélection OU tout le document)
 *   2. Analyse côté plugin (hors sandbox) — accès à C.Automat, C.Syllables, C.Config
 *   3. callCommand() pour appliquer les colorMaps via Asc.scope (données sérialisables)
 *
 * Règle : si du texte est sélectionné → ne coloriser que la sélection.
 *         Sinon → coloriser tout le document.
 */

window.Colorization = window.Colorization || {};

(function (C) {
    'use strict';

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Execute une callCommand OnlyOffice en surveillant les erreurs :
     * la fonction interne doit renvoyer normalement ; une exception est
     * capturee et renvoyee comme { error }. Affiche une alerte a
     * l'enseignant en cas d'echec au lieu de rester silencieux.
     */
    // Nombre de paragraphes traités par appel callCommand dans applyColorMaps.
    // Sur un document de plusieurs milliers de paragraphes, tout traiter en un
    // seul appel peut geler l'éditeur le temps du traitement ; découper en
    // lots successifs laisse l'interface respirer entre deux lots.
    var APPLY_BATCH_SIZE = 300;

    function runGuardedCommand(innerFn, onSuccess, failureMessage) {
        window.Asc.plugin.callCommand(function () {
            try {
                innerFn();
                return { ok: true };
            } catch (e) {
                return { error: e.message || String(e) };
            }
        }, false, false, function (result) {
            if (!result || result.error) {
                var msg = (result && result.error) || 'reponse vide de OnlyOffice';
                console.error('[Colorizer] ' + failureMessage + ': ' + msg);
                window.alert('Colorisation : ' + failureMessage + ' (' + msg + ').');
                return;
            }
            if (onSuccess) onSuccess();
        });
    }

    var WORD_RE = /[a-zàáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúūÿçñ\u2019']+/gi;

    /**
     * Extract texts from the SELECTION if one exists,
     * otherwise from ALL paragraphs in the document.
     *
     * Returns via callback:
     *   { mode: 'selection'|'document', texts: string[], paraIndices: number[]|null }
     *
     * In 'selection' mode, paraIndices contains the absolute paragraph indices
     * of the selected paragraphs so we can target them when applying colors.
     */
    function extractTexts(callback) {
        window.Asc.plugin.callCommand(function () {
          try {
            var oDocument = Api.GetDocument();
            var allParagraphs = oDocument.GetAllParagraphs();

            // Texte de tous les paragraphes, construit une seule fois : sert
            // à la fois au repli "document entier" et à la recherche de la
            // sélection ci-dessous.
            var allTexts = [];
            for (var pi = 0; pi < allParagraphs.length; pi++) {
                allTexts.push(allParagraphs[pi].GetText());
            }

            // Texte sélectionné, si l'API le permet directement.
            var selectedText = '';
            try {
                selectedText = oDocument.GetSelectedText();
            } catch (e) {
                selectedText = '';
            }

            // Repli : si GetSelectedText() n'a rien donné mais qu'un objet
            // Range est disponible, reconstituer le texte sélectionné à
            // partir de ses paragraphes (sert seulement à retrouver la
            // position ci-dessous, pas à identifier les paragraphes eux-mêmes).
            if (!selectedText) {
                try {
                    var range = Api.GetSelection ? Api.GetSelection() : null;
                    var rangeParagraphs = (range && range.GetAllParagraphs) ? range.GetAllParagraphs() : null;
                    if (rangeParagraphs && rangeParagraphs.length > 0) {
                        var rangeTexts = [];
                        for (var ri = 0; ri < rangeParagraphs.length; ri++) {
                            rangeTexts.push(rangeParagraphs[ri].GetText());
                        }
                        selectedText = rangeTexts.join('\n');
                    }
                } catch (e2) { /* pas de Range non plus, tant pis */ }
            }

            if (selectedText) {
                // On ne dispose que du TEXTE de la sélection, pas d'un
                // pointeur vers les paragraphes concernés (l'API ne l'expose
                // pas ici). On le localise donc par une recherche GLOBALE et
                // UNIQUE (indexOf = première occurrence) dans le texte complet
                // du document, puis on retrouve la plage contiguë de
                // paragraphes correspondant à cette position par décalage de
                // caractères.
                //
                // Limite assumée : si le texte sélectionné est identique à un
                // autre passage plus tôt dans le document, c'est ce premier
                // passage qui sera colorisé (comportement documenté, pas un
                // plantage). C'est strictement meilleur que l'ancienne
                // approche, qui comparait chaque paragraphe indépendamment et
                // pouvait fusionner des paragraphes non contigus dès qu'un
                // même mot/fragment apparaissait ailleurs dans le document.
                var normalizedSel = selectedText.replace(/\r\n/g, '\n').trim();

                if (normalizedSel) {
                    var fullText = allTexts.join('\n');
                    var startChar = fullText.indexOf(normalizedSel);

                    if (startChar !== -1) {
                        var endChar = startChar + normalizedSel.length;
                        var startPara = -1, endPara = -1, offset = 0;

                        for (var api2 = 0; api2 < allTexts.length; api2++) {
                            var paraStart = offset;
                            var paraEnd = paraStart + allTexts[api2].length;

                            if (startPara === -1 && endChar > paraStart && startChar < paraEnd + 1) {
                                startPara = api2;
                            }
                            if (startChar < paraEnd + 1 && endChar <= paraEnd + 1) {
                                endPara = api2;
                                break;
                            }
                            offset = paraEnd + 1; // +1 pour le séparateur '\n'
                        }
                        if (startPara === -1) startPara = 0;
                        if (endPara === -1) endPara = allTexts.length - 1;

                        var foundIndices = [];
                        var foundTexts = [];
                        for (var fi = startPara; fi <= endPara; fi++) {
                            foundIndices.push(fi);
                            foundTexts.push(allTexts[fi]);
                        }
                        return { mode: 'selection', texts: foundTexts, paraIndices: foundIndices };
                    }
                }
            }

            // Pas de sélection, ou sélection non localisable — document entier.
            return { mode: 'document', texts: allTexts, paraIndices: null };

          } catch (e) {
            return { error: e.message || String(e) };
          }
        }, false, false, function (result) {
            if (!result || result.error) {
                var msg = (result && result.error) || 'réponse vide de OnlyOffice';
                console.error('[Colorizer] extractTexts: ' + msg);
                window.alert('Coloriƨation : impossible de lire le texte du document (' + msg + '). Réessayez, ou vérifiez qu\'aucun tableau/en-tête complexe n\'est sélectionné.');
                return;
            }
            if (!result.texts) {
                console.error('[Colorizer] extractTexts: pas de texte renvoyé');
                return;
            }
            callback(result);
        });
    }

    /**
     * Apply pre-computed colorMaps to document paragraphs.
     *
     * @param {Object} extraction   – the result from extractTexts
     * @param {Array}  allColorMaps – one entry per extracted paragraph
     * @param {string} defBeh       – 'noir' → force black, else leave as-is
     */
    function applyColorMaps(extraction, allColorMaps, defBeh) {
        var mode = extraction.mode;
        var paraIndices = extraction.paraIndices;
        var total = allColorMaps.length;
        var offset = 0;
        var totalErrors = 0;

        function runOneBatch() {
            var batchMaps = allColorMaps.slice(offset, offset + APPLY_BATCH_SIZE);
            var batchParaIndices = (mode === 'selection' && paraIndices)
                ? paraIndices.slice(offset, offset + APPLY_BATCH_SIZE)
                : null;

            Asc.scope.maps = batchMaps;
            Asc.scope.defBeh = defBeh || 'transparent';
            Asc.scope.mode = mode;
            Asc.scope.paraIndices = batchParaIndices;
            Asc.scope.offset = offset;

            window.Asc.plugin.callCommand(function () {
                var oDocument = Api.GetDocument();
                var paragraphs = oDocument.GetAllParagraphs();
                var maps = Asc.scope.maps;
                var defBeh = Asc.scope.defBeh;
                var mode = Asc.scope.mode;
                var paraIndices = Asc.scope.paraIndices;
                var batchOffset = Asc.scope.offset;
                var errorCount = 0;

                for (var mi = 0; mi < maps.length; mi++) {
                    if (!maps[mi]) continue;

                    try {
                        // Determine which paragraph to modify
                        var pi = (mode === 'selection' && paraIndices)
                            ? paraIndices[mi]
                            : (batchOffset + mi);

                        if (pi >= paragraphs.length) continue;

                        var para = paragraphs[pi];
                        var text = para.GetText();
                        if (!text) continue;

                        var colorMap = maps[mi];

                        // Remove existing runs and rebuild with colored ones
                        para.RemoveAllElements();

                        var currentColor = null;
                        var currentText = '';

                        for (var i = 0; i < text.length; i++) {
                            var c = colorMap[String(i)] || colorMap[i] || null;

                            var colorKey = c
                                ? (c.r + ',' + c.g + ',' + c.b + ',' + (c.bold || 0) + ',' + (c.italic || 0) + ',' + (c.underline || 0))
                                : 'none';
                            var prevKey = currentColor
                                ? (currentColor.r + ',' + currentColor.g + ',' + currentColor.b + ',' + (currentColor.bold || 0) + ',' + (currentColor.italic || 0) + ',' + (currentColor.underline || 0))
                                : 'none';

                            if (colorKey !== prevKey) {
                                if (currentText) {
                                    var run = Api.CreateRun();
                                    run.AddText(currentText);
                                    if (currentColor) {
                                        run.SetColor(currentColor.r, currentColor.g, currentColor.b);
                                        if (currentColor.bold) run.SetBold(true);
                                        if (currentColor.italic) run.SetItalic(true);
                                        if (currentColor.underline) run.SetUnderline(true);
                                    } else if (defBeh === 'noir') {
                                        run.SetColor(0, 0, 0);
                                    }
                                    para.AddElement(run);
                                }
                                currentColor = c;
                                currentText = text[i];
                            } else {
                                currentText += text[i];
                            }
                        }

                        // Flush last run
                        if (currentText) {
                            var run2 = Api.CreateRun();
                            run2.AddText(currentText);
                            if (currentColor) {
                                run2.SetColor(currentColor.r, currentColor.g, currentColor.b);
                                if (currentColor.bold) run2.SetBold(true);
                                if (currentColor.italic) run2.SetItalic(true);
                                if (currentColor.underline) run2.SetUnderline(true);
                            } else if (defBeh === 'noir') {
                                run2.SetColor(0, 0, 0);
                            }
                            para.AddElement(run2);
                        }
                    } catch (e) {
                        // Un paragraphe protégé (tableau, en-tête...) ne doit pas
                        // interrompre le traitement des autres paragraphes.
                        errorCount++;
                    }
                }

                return { errorCount: errorCount };
            }, false, false, function (result) {
                if (!result) {
                    console.error('[Colorizer] applyColorMaps: réponse vide de OnlyOffice sur un lot');
                    window.alert('Coloriƨation : le traitement s\'est interrompu de façon inattendue. Une partie du document a peut-être été colorée.');
                    return;
                }

                totalErrors += result.errorCount || 0;
                offset += APPLY_BATCH_SIZE;

                if (offset < total) {
                    runOneBatch();
                } else if (totalErrors > 0) {
                    console.error('[Colorizer] applyColorMaps: ' + totalErrors + '/' + total + ' paragraphe(s) non traité(s)');
                    window.alert('Coloriƨation : ' + totalErrors + ' paragraphe(s) n\'ont pas pu être colorés (probablement un tableau ou un en-tête). Le reste du document a été traité.');
                }
            });
        }

        if (total > 0) runOneBatch();
    }

    // ─────────────────────────────────────────────────────────────
    //  Surligner une ligne sur deux
    // ─────────────────────────────────────────────────────────────

    /**
     * Applique un surlignage (shading) sur une ligne/paragraphe sur deux.
     * Couleurs douces pour ne pas gêner la lecture.
     */
    function highlightAlternateLines() {
        var config = C.Config.current;
        var color1 = config.altLineColor1 || { r: 219, g: 234, b: 254 }; // bleu pâle
        var color2 = config.altLineColor2 || null;                         // null = pas de fond

        Asc.scope.color1 = color1;
        Asc.scope.color2 = color2;

        runGuardedCommand(function () {
            var oDocument = Api.GetDocument();
            var paragraphs = oDocument.GetAllParagraphs();
            var c1 = Asc.scope.color1;
            var c2 = Asc.scope.color2;

            for (var pi = 0; pi < paragraphs.length; pi++) {
                var para = paragraphs[pi];
                if (pi % 2 === 0) {
                    // Ligne paire : surlignée
                    para.SetShd('clear', c1.r, c1.g, c1.b);
                } else {
                    // Ligne impaire : fond blanc ou couleur 2
                    if (c2) {
                        para.SetShd('clear', c2.r, c2.g, c2.b);
                    } else {
                        para.SetShd('clear', 255, 255, 255);
                    }
                }
            }
        }, null, 'le surlignage alterné a échoué');
    }

    /**
     * Supprime le surlignage de toutes les lignes (fond blanc).
     */
    function removeAlternateLines() {
        runGuardedCommand(function () {
            var oDocument = Api.GetDocument();
            var paragraphs = oDocument.GetAllParagraphs();

            for (var pi = 0; pi < paragraphs.length; pi++) {
                paragraphs[pi].SetShd('clear', 255, 255, 255);
            }
        }, null, 'la suppression du surlignage a échoué');
    }

    // ─────────────────────────────────────────────────────────────
    //  Découper en 1 phrase = 1 paragraphe
    // ─────────────────────────────────────────────────────────────

    /**
     * Découpe chaque paragraphe en phrases distinctes (1 phrase = 1 paragraphe).
     * Permet un surlignage 1 ligne / 2 plus fidèle.
     *
     * NOTE : Contournement d'une limitation de l'API OnlyOffice qui ne donne
     *        pas accès aux lignes visuelles, seulement aux paragraphes.
     *        Le découpage se fait sur . ! ? suivis d'un espace ou fin de texte.
     *        L'enseignant peut toujours fusionner les paragraphes manuellement.
     */
    function splitSentences() {
        runGuardedCommand(function () {
            var oDocument = Api.GetDocument();
            var paragraphs = oDocument.GetAllParagraphs();

            // Sentence-end pattern: . ! ? followed by space or end
            // We process in reverse to avoid index shifting
            for (var pi = paragraphs.length - 1; pi >= 0; pi--) {
                var para = paragraphs[pi];
                var text = para.GetText();
                if (!text || text.length < 2) continue;

                // Split text into sentences
                var sentences = [];
                var current = '';
                for (var i = 0; i < text.length; i++) {
                    current += text[i];
                    var ch = text[i];
                    var next = (i + 1 < text.length) ? text[i + 1] : '';
                    if ((ch === '.' || ch === '!' || ch === '?') &&
                        (next === ' ' || next === '' || next === '\t' || i === text.length - 1)) {
                        sentences.push(current.trim());
                        current = '';
                        // Skip the space after punctuation
                        if (next === ' ' || next === '\t') i++;
                    }
                }
                if (current.trim()) sentences.push(current.trim());

                // Only split if there are multiple sentences
                if (sentences.length <= 1) continue;

                // Replace the original paragraph with the first sentence
                para.RemoveAllElements();
                var run0 = Api.CreateRun();
                run0.AddText(sentences[0]);
                para.AddElement(run0);

                // Insert new paragraphs for remaining sentences AFTER the current one
                // We need the paragraph index in the document
                for (var si = sentences.length - 1; si >= 1; si--) {
                    var newPara = Api.CreateParagraph();
                    var newRun = Api.CreateRun();
                    newRun.AddText(sentences[si]);
                    newPara.AddElement(newRun);
                    // InsertParagraph after the current one
                    para.AddElement(newPara);
                }
            }
        }, null, 'la découpe en phrases a échoué');
    }

    // ─────────────────────────────────────────────────────────────
    //  Public colorization functions
    // ─────────────────────────────────────────────────────────────

    function colorizePhonemes() {
        var config = C.Config.current;

        extractTexts(function (extraction) {
            var texts = extraction.texts;
            var allColorMaps = [];

            for (var i = 0; i < texts.length; i++) {
                if (!texts[i] || !texts[i].trim()) {
                    allColorMaps.push(null);
                    continue;
                }

                var analysis = C.Automat.analyzeText(texts[i], config);
                var colorMap = {};

                for (var wi = 0; wi < analysis.length; wi++) {
                    var wordInfo = analysis[wi];
                    for (var phi = 0; phi < wordInfo.phonemes.length; phi++) {
                        var phon = wordInfo.phonemes[phi];
                        var color = C.Config.getPhonemeColor(phon.phoneme);
                        if (color) {
                            for (var ci = phon.start; ci <= phon.end; ci++) {
                                colorMap[wordInfo.start + ci] = color;
                            }
                        }
                    }
                }

                allColorMaps.push(colorMap);
            }

            applyColorMaps(extraction, allColorMaps, config.defBeh);
        });
    }

    function colorizeSyllables() {
        var config = C.Config.current;

        extractTexts(function (extraction) {
            var texts = extraction.texts;
            var allColorMaps = [];

            for (var i = 0; i < texts.length; i++) {
                if (!texts[i] || !texts[i].trim()) {
                    allColorMaps.push(null);
                    continue;
                }

                var text = texts[i];
                var colorMap = {};
                var match;
                var sylIdx = 0;

                WORD_RE.lastIndex = 0;

                while ((match = WORD_RE.exec(text)) !== null) {
                    var syllables = C.Syllables.syllabify(match[0], config);
                    if (config.sylIgnoreMono && syllables.length <= 1) continue;

                    for (var si = 0; si < syllables.length; si++) {
                        var syl = syllables[si];
                        var color = config.sylColors[sylIdx % config.sylNumColors];
                        for (var ci = syl.start; ci <= syl.end; ci++) {
                            colorMap[match.index + ci] = color;
                        }
                        sylIdx++;
                    }
                }

                allColorMaps.push(colorMap);
            }

            applyColorMaps(extraction, allColorMaps, 'transparent');
        });
    }

    function colorizeBPDQ() {
        var config = C.Config.current;
        var bpdqColors = config.bpdq;

        extractTexts(function (extraction) {
            var texts = extraction.texts;
            var allColorMaps = [];

            for (var i = 0; i < texts.length; i++) {
                if (!texts[i]) {
                    allColorMaps.push(null);
                    continue;
                }

                var text = texts[i];
                var colorMap = {};
                var hasColor = false;

                for (var ci = 0; ci < text.length; ci++) {
                    var ch = text[ci].toLowerCase();
                    if (bpdqColors[ch]) {
                        colorMap[ci] = bpdqColors[ch];
                        hasColor = true;
                    }
                }

                allColorMaps.push(hasColor ? colorMap : null);
            }

            applyColorMaps(extraction, allColorMaps, 'transparent');
        });
    }

    function colorizeVoyCons() {
        var config = C.Config.current;
        var voyColor = config.voyelles;
        var consColor = config.consonnes;
        var voyRegex = /[aeiouyàáâäæãåèéêëîïíôöòóœøõûüùúÿ]/i;
        var consRegex = /[bcdfghjklmnpqrstvwxzç]/i;

        extractTexts(function (extraction) {
            var texts = extraction.texts;
            var allColorMaps = [];

            for (var i = 0; i < texts.length; i++) {
                if (!texts[i]) {
                    allColorMaps.push(null);
                    continue;
                }

                var text = texts[i];
                var colorMap = {};

                for (var ci = 0; ci < text.length; ci++) {
                    if (voyRegex.test(text[ci])) {
                        colorMap[ci] = voyColor;
                    } else if (consRegex.test(text[ci])) {
                        colorMap[ci] = consColor;
                    }
                }

                allColorMaps.push(colorMap);
            }

            applyColorMaps(extraction, allColorMaps, 'transparent');
        });
    }

    function removeColors() {
        runGuardedCommand(function () {
            var oDocument = Api.GetDocument();
            var paragraphs = oDocument.GetAllParagraphs();

            for (var pi = 0; pi < paragraphs.length; pi++) {
                var para = paragraphs[pi];
                var count = para.GetElementsCount();
                for (var i = 0; i < count; i++) {
                    var el = para.GetElement(i);
                    if (el && el.GetClassType && el.GetClassType() === 'run') {
                        el.SetColor(0, 0, 0, false);
                        el.SetBold(false);
                        el.SetItalic(false);
                        el.SetUnderline(false);
                    }
                }
            }
        }, null, 'la suppression des couleurs a échoué');
    }

    // ─────────────────────────────────────────────────────────────
    //  Public API
    // ─────────────────────────────────────────────────────────────

    C.Colorizer = {
        colorizePhonemes:        colorizePhonemes,
        colorizeSyllables:       colorizeSyllables,
        colorizeBPDQ:            colorizeBPDQ,
        colorizeVoyCons:         colorizeVoyCons,
        removeColors:            removeColors,
        highlightAlternateLines: highlightAlternateLines,
        removeAlternateLines:    removeAlternateLines,
        splitSentences:          splitSentences
    };

})(window.Colorization);
