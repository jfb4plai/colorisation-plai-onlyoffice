/**
 * Colorization pour OnlyOffice — Syllabification
 * Port JavaScript de PhonWord.cs / SylInW.cs (Pierre-Alain Etique, GPL-3.0)
 * https://github.com/paColor/Colorization
 *
 * Algorithme en 7 étapes :
 * 1. Une syllabe par phonème (init)
 * 2. Traitement des consonnes doublées
 * 3. Fusion des groupes consonantiques (bl, tr, cr, pl...)
 * 4. Regroupement des consonnes devant voyelle
 * 5. Rattachement des consonnes finales
 * 6. Traitement des monosyllabes
 * 7. Traitement du schwa selon le mode (écrit/oral)
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    var P = null; // Will reference C.Phonemes

    // Onset clusters that cannot be split (attaque branchante)
    var onsetClusters = new Set([
        'bl','br','ch','cl','cr','dr','fl','fr','gl','gr',
        'pl','pr','tr','vr','ph','th','gn','pn',
        'ps','pt' // for Greek-origin words
    ]);

    // Vowel phonemes (for syllable nucleus detection)
    var vowelPhons = new Set([
        'a','q','q_caduc','i','o','o_comp','u','y','e','E','E_comp','e_comp',
        'e_tilda','a_tilda','o_tilda','x_tilda','x2','oi','w_e_tilda'
    ]);

    // Consonant phonemes
    var consonantPhons = new Set([
        'p','b','t','d','k','g','f','v','s','z','S','Z','m','n','l','R',
        'f_ph','k_qu','g_u','s_c','s_t','s_x','z_s','ks','gz','N'
    ]);

    function isVowelPhon(p) { return vowelPhons.has(p); }
    function isConsonantPhon(p) { return consonantPhons.has(p); }

    /**
     * Get the grapheme (letter) at position in word corresponding to a phoneme
     */
    function getGrapheme(word, phon) {
        return word.substring(phon.start, phon.end + 1);
    }

    /**
     * Check if two consecutive consonant graphemes form an onset cluster
     */
    function isOnsetCluster(word, phon1, phon2) {
        var g1 = getGrapheme(word, phon1);
        var g2 = getGrapheme(word, phon2);
        // Take last char of g1 and first char of g2
        var pair = g1[g1.length - 1] + g2[0];
        return onsetClusters.has(pair.toLowerCase());
    }

    /**
     * Compute syllables from phonemes
     * @param {string} word - the original word
     * @param {Array} phonemes - array of {start, end, phoneme, rule}
     * @param {string} mode - 'ecrit' or 'oral'
     * @returns {Array} array of syllable objects: {start, end, phonemes}
     */
    function computeSyllables(word, phonemes, mode) {
        if (!phonemes || phonemes.length === 0) return [];
        mode = mode || 'ecrit';

        // Step 1: Initialize — one syllable per phoneme
        var syls = phonemes.map(function(p) {
            return { start: p.start, end: p.end, phonemes: [p] };
        });

        // Step 2: Handle doubled consonants (merge them)
        syls = mergeDoubledConsonants(syls);

        // Step 3: Fusion of onset clusters (consonant + liquid: bl, tr, cr...)
        syls = fuseOnsetClusters(word, syls);

        // Step 4: Group consonants before vowels (attach to following vowel)
        syls = attachConsonantsToVowels(syls);

        // Step 5: Attach trailing consonants to last syllable
        syls = attachTrailingConsonants(syls);

        // Step 6: Handle final schwa (mode-dependent)
        if (mode === 'oral') {
            syls = handleOralSchwa(syls);
        }

        // Step 7: Merge result into proper syllable boundaries
        return finalizeSyllables(word, syls);
    }

    /**
     * Step 2: Merge doubled consonants
     */
    function mergeDoubledConsonants(syls) {
        var result = [];
        var i = 0;
        while (i < syls.length) {
            if (i + 1 < syls.length) {
                var p1 = syls[i].phonemes[0];
                var p2 = syls[i + 1].phonemes[0];
                // If same consonant phoneme repeated, merge
                if (isConsonantPhon(p1.phoneme) && p1.phoneme === p2.phoneme) {
                    result.push({
                        start: p1.start,
                        end: p2.end,
                        phonemes: [p1, p2]
                    });
                    i += 2;
                    continue;
                }
            }
            result.push(syls[i]);
            i++;
        }
        return result;
    }

    /**
     * Step 3: Fuse onset clusters (consonant + liquid before vowel)
     */
    function fuseOnsetClusters(word, syls) {
        var result = [];
        var i = 0;
        while (i < syls.length) {
            if (i + 1 < syls.length) {
                var lastP = syls[i].phonemes[syls[i].phonemes.length - 1];
                var nextP = syls[i + 1].phonemes[0];
                if (isConsonantPhon(lastP.phoneme) && isConsonantPhon(nextP.phoneme)) {
                    if (isOnsetCluster(word, lastP, nextP)) {
                        // Merge these two into one
                        var merged = {
                            start: syls[i].start,
                            end: syls[i + 1].end,
                            phonemes: syls[i].phonemes.concat(syls[i + 1].phonemes)
                        };
                        result.push(merged);
                        i += 2;
                        continue;
                    }
                }
            }
            result.push(syls[i]);
            i++;
        }
        return result;
    }

    /**
     * Step 4: Attach consonants to the following vowel
     */
    function attachConsonantsToVowels(syls) {
        var result = [];
        var i = 0;
        while (i < syls.length) {
            var current = syls[i];
            var lastPhon = current.phonemes[current.phonemes.length - 1];

            // If current is consonant(s) and next is vowel, merge
            if (isConsonantPhon(lastPhon.phoneme) && i + 1 < syls.length) {
                var nextLastPhon = syls[i + 1].phonemes[syls[i + 1].phonemes.length - 1];
                if (isVowelPhon(nextLastPhon.phoneme) || i + 1 === syls.length - 1) {
                    var merged = {
                        start: current.start,
                        end: syls[i + 1].end,
                        phonemes: current.phonemes.concat(syls[i + 1].phonemes)
                    };
                    result.push(merged);
                    i += 2;
                    continue;
                }
            }
            result.push(current);
            i++;
        }
        return result;
    }

    /**
     * Step 5: Attach trailing consonants to the previous syllable
     */
    function attachTrailingConsonants(syls) {
        if (syls.length <= 1) return syls;
        var result = [syls[0]];
        for (var i = 1; i < syls.length; i++) {
            var current = syls[i];
            var hasVowel = false;
            for (var j = 0; j < current.phonemes.length; j++) {
                if (isVowelPhon(current.phonemes[j].phoneme)) {
                    hasVowel = true;
                    break;
                }
            }
            if (!hasVowel && result.length > 0) {
                // No vowel in this syllable — attach to previous
                var prev = result[result.length - 1];
                result[result.length - 1] = {
                    start: prev.start,
                    end: current.end,
                    phonemes: prev.phonemes.concat(current.phonemes)
                };
            } else {
                result.push(current);
            }
        }
        return result;
    }

    /**
     * Step 6 (oral mode): Merge final schwa syllable with previous
     */
    function handleOralSchwa(syls) {
        if (syls.length <= 1) return syls;
        var last = syls[syls.length - 1];
        var lastPhons = last.phonemes;
        // Check if last syllable contains only schwa (q_caduc) + optional consonants
        var hasOnlySchwa = true;
        var hasSchwa = false;
        for (var i = 0; i < lastPhons.length; i++) {
            if (lastPhons[i].phoneme === 'q_caduc') {
                hasSchwa = true;
            } else if (isVowelPhon(lastPhons[i].phoneme)) {
                hasOnlySchwa = false;
            }
        }
        if (hasSchwa && hasOnlySchwa && syls.length > 1) {
            var prev = syls[syls.length - 2];
            syls[syls.length - 2] = {
                start: prev.start,
                end: last.end,
                phonemes: prev.phonemes.concat(last.phonemes)
            };
            syls.pop();
        }
        return syls;
    }

    /**
     * Step 7: Finalize — convert to simple {start, end} syllable boundaries
     */
    function finalizeSyllables(word, syls) {
        return syls.map(function(s) {
            return {
                start: s.start,
                end: s.end,
                text: word.substring(s.start, s.end + 1)
            };
        });
    }

    /**
     * High-level: syllabify a word using the phoneme engine
     * @param {string} word - the word to syllabify
     * @param {Object} config - configuration (mode, flags)
     * @returns {Array} array of {start, end, text}
     */
    function syllabify(word, config) {
        var phonemes = C.Automat.findPhonemes(word.toLowerCase(), config);
        var mode = (config && config.sylMode) || 'ecrit';
        return computeSyllables(word, phonemes, mode);
    }

    C.Syllables = {
        computeSyllables: computeSyllables,
        syllabify: syllabify
    };

})(window.Colorization);
