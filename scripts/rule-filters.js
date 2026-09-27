/**
 * Colorization pour OnlyOffice — Filtres de règles phonologiques
 * Port JavaScript de AutomRuleFilter.cs (Pierre-Alain Etique, GPL-3.0)
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    var WL; // Will be set to C.WordLists

    function init() {
        WL = C.WordLists;
    }

    /**
     * Helper: remove accents from lowercase string
     */
    function sansAccents(s) {
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Helper: remove trailing 's' if present
     */
    function sansSFinal(s) {
        return (s.length > 1 && s[s.length - 1] === 's') ? s.substring(0, s.length - 1) : s;
    }

    /**
     * Helper: remove trailing 'e' if present
     */
    function sansEFinal(s) {
        return (s.length > 1 && s[s.length - 1] === 'e') ? s.substring(0, s.length - 1) : s;
    }

    /**
     * Helper: reconstruct the full word from before + current char + after
     */
    function getWord(before, ch, after) {
        return before + ch + after;
    }

    // ========================================================================
    // RULE FUNCTIONS
    // Each takes (word, pos, before, after) and returns boolean
    // ========================================================================

    /**
     * Regle_ient: verbes du 1er groupe terminés par 'ier' conjugués
     * à la 3ème personne du pluriel (-ient)
     */
    function Regle_ient(word, pos, before, after) {
        if (!WL) init();
        // Check if 'ient' is at end
        if (!/ent(s?)$/i.test(after)) return false;
        // Reconstruct the infinitive: replace -ient with -ier
        var w = before + after;
        // Extract the verb stem
        var stem = w.replace(/ent(s?)$/, '');
        var infinitive = stem + 'er';
        return WL.verbes_ier.has(infinitive);
    }

    /**
     * Regle_mots_ent: mots (adverbes ou noms) terminés par 'ent'
     * où 'en' se prononce [ã]
     */
    function Regle_mots_ent(word, pos, before, after) {
        if (!WL) init();
        if (!/nt(s?)$/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        // Check the word without trailing 's'
        var w = sansSFinal(fullWord);
        return WL.mots_ent.has(w) || WL.mots_ent.has(fullWord);
    }

    /**
     * Regle_ment: mots terminés par 'ment' prononcés [ã]
     * sauf s'il s'agit d'un verbe en -mer
     */
    function Regle_ment(word, pos, before, after) {
        if (!WL) init();
        if (!/nt(s?)$/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        // If it's a verb in -mer conjugated, return false
        // Extract potential verb stem: remove -ment, add -mer
        if (w.length > 4) {
            var stem = w.substring(0, w.length - 4);
            if (WL.verbes_mer.has(stem + 'mer')) return false;
        }
        // Check if it ends with 'ment' (not a verb)
        return /ment(s?)$/i.test(w);
    }

    /**
     * Regle_er: mots terminés par 'er' prononcés [ER] (pas [e])
     */
    function Regle_er(word, pos, before, after) {
        if (!WL) init();
        if (!/r(s?)$/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.exceptions_final_er.has(w);
    }

    /**
     * Regle_nc_ai_final: noms terminés par 'ai' prononcé [ɛ]
     */
    function Regle_nc_ai_final(word, pos, before, after) {
        if (!WL) init();
        if (!/i(s?)$/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.noms_ai.has(w);
    }

    /**
     * Regle_avoir: formes conjuguées du verbe avoir (eu, eut, etc.)
     */
    function Regle_avoir(word, pos, before, after) {
        if (!WL) init();
        if (!/u/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        return WL.avoir_eu.has(fullWord);
    }

    /**
     * Regle_s_final: mots où le 's' final se prononce
     */
    function Regle_s_final(word, pos, before, after) {
        if (!WL) init();
        if (!/$/i.test(after) && after !== '' && after !== 's') return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        return WL.mots_s_final.has(fullWord) || WL.mots_s_final.has(sansSFinal(fullWord));
    }

    /**
     * Regle_t_final: mots où le 't' final se prononce
     */
    function Regle_t_final(word, pos, before, after) {
        if (!WL) init();
        if (!(/(s?)$/i.test(after))) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.mots_t_final.has(w) || WL.mots_t_final.has(fullWord);
    }

    /**
     * Regle_tien: 'tien' où 't' se prononce [t] (pas [s])
     */
    function Regle_tien(word, pos, before, after) {
        if (!/ien/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        // Regex patterns from C# source
        if (/capétien/i.test(fullWord) || /lutétien/i.test(fullWord)) return false;
        if (/.+[beéfhns]tien/i.test(fullWord)) return true;
        if (/(^chré|^sou|^appar|^dé|^ap|^ar|^astar|ch(a|â)|flauber|lacer)tien/i.test(fullWord)) return true;
        return false;
    }

    /**
     * Regle_finD: mots où le 'd' final se prononce
     */
    function Regle_finD(word, pos, before, after) {
        if (!WL) init();
        if (!(/(s?)$/i.test(after))) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.mots_d_final.has(w) || WL.mots_d_final.has(fullWord);
    }

    /**
     * Regle_ill: exceptions où 'ill' se prononce [il] (pas [j])
     */
    function Regle_ill(word, pos, before, after) {
        if (!WL) init();
        var fullWord;
        if (typeof word === 'string') {
            fullWord = word.toLowerCase();
        } else {
            fullWord = (before + word[pos] + after).toLowerCase();
        }
        return WL.except_ill.has(fullWord) || WL.except_ill.has(sansSFinal(fullWord));
    }

    /**
     * Regle_ierConjI: verbes en -ier conjugués au futur/conditionnel (position sur 'i')
     */
    function Regle_ierConjI(word, pos, before, after) {
        if (!WL) init();
        // Check if followed by -erai, -erais, -erait, -erons, etc.
        if (!/e(r(ai|as|a|ons|ez|ont|ais|ait|ions|iez|aient))/i.test(after)) return false;
        // Reconstruct infinitive
        var stem = before;
        var infinitive = stem + 'ier';
        return WL.verbes_ier.has(infinitive);
    }

    /**
     * Regle_ierConjE: verbes en -ier conjugués au futur/conditionnel (position sur 'e')
     */
    function Regle_ierConjE(word, pos, before, after) {
        if (!WL) init();
        // Check that we're in a future/conditional form
        if (!/r(ai|as|a|ons|ez|ont|ais|ait|ions|iez|aient)(s?)$/i.test(after)) return false;
        // The 'i' before 'e' should be part of a -ier verb
        if (before.length < 1 || before[before.length - 1] !== 'i') return false;
        var stem = before.substring(0, before.length - 1);
        var infinitive = stem + 'ier';
        return WL.verbes_ier.has(infinitive);
    }

    /**
     * Regle_VerbesTer: verbes en -ter à l'imparfait (nous -tions)
     */
    function Regle_VerbesTer(word, pos, before, after) {
        if (!WL) init();
        if (!/ion(s|z)/i.test(after)) return false;
        var stem = before;
        var infinitive = stem + 'ter';
        return WL.verbesTer.has(infinitive);
    }

    /**
     * Regle_MotsUM: mots en -um prononcés [ɔm]
     */
    function Regle_MotsUM(word, pos, before, after) {
        if (!WL) init();
        if (!/m(s?)$/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.motsUM.has(w) || WL.motsUM.has(fullWord);
    }

    /**
     * Regle_X_Final: mots où le 'x' final se prononce
     */
    function Regle_X_Final(word, pos, before, after) {
        if (!WL) init();
        if (after !== '' && after !== 's') return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        var w = sansSFinal(fullWord);
        return WL.motsX.has(w) || WL.motsX.has(fullWord);
    }

    /**
     * Regle_ChK: 'ch' prononcé [k] (mots d'origine grecque etc.)
     */
    function Regle_ChK(word, pos, before, after) {
        if (!WL) init();
        if (!/h/i.test(after)) return false;
        var fullWord;
        if (typeof word === 'string') {
            fullWord = word.toLowerCase();
        } else {
            fullWord = (before + word[pos] + after).toLowerCase();
        }
        return WL.motsChK.has(fullWord) || WL.motsChK.has(sansSFinal(fullWord));
    }

    /**
     * Regle_MotsUN_ON: 'un' prononcé [ɔ̃]
     */
    function Regle_MotsUN_ON(word, pos, before, after) {
        if (!WL) init();
        var fullWord = (before + word[pos] + after).toLowerCase();
        return WL.motsUN_on.has(fullWord) || WL.motsUN_on.has(sansSFinal(fullWord));
    }

    /**
     * RegleMotsQUkw: 'qu' prononcé [kw]
     */
    function RegleMotsQUkw(word, pos, before, after) {
        if (!WL) init();
        var fullWord;
        if (typeof word === 'string') {
            fullWord = word.toLowerCase();
        } else {
            fullWord = (before + word[pos] + after).toLowerCase();
        }
        return WL.motsQUkw.has(fullWord) || WL.motsQUkw.has(sansSFinal(fullWord));
    }

    /**
     * RegleMotsEn5: 'en' prononcé [ɛ̃]
     */
    function RegleMotsEn5(word, pos, before, after) {
        if (!WL) init();
        if (!/n/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        return WL.motsEn5.has(fullWord) || WL.motsEn5.has(sansSFinal(fullWord));
    }

    /**
     * RegleMotsGnGN: 'gn' prononcé [gn] (pas [ɲ])
     */
    function RegleMotsGnGN(word, pos, before, after) {
        if (!/n/i.test(after)) return false;
        // Words where gn = [g][n] are rare: gnome, gnose, diagnostic, etc.
        var fullWord = (before + word[pos] + after).toLowerCase();
        // Pattern: words starting with gn-, or diagnostic, stagnant, etc.
        return /^gn/i.test(fullWord) ||
               /(diagno|stagna|igné|cogn(it|os)|incogn|récogn|magn(um|at|olia|ésie|étite|éto)|sign(al|ifi|atu|et))/i.test(fullWord);
    }

    /**
     * RegleMotsOYoj: 'oy' prononcé [oj] (pas [waj])
     */
    function RegleMotsOYoj(word, pos, before, after) {
        if (!WL) init();
        if (!/y/i.test(after)) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        return WL.motsOYoj.has(fullWord) || WL.motsOYoj.has(sansSFinal(fullWord));
    }

    /**
     * RegleMotsRe: 're-' quelque chose où le 'e' se prononce [ə]
     */
    function RegleMotsRe(word, pos, before, after) {
        if (!WL) init();
        // Check that we're at the beginning of the word after 'r'
        if (!/^(r|^dér|^prér)/i.test(before + word[pos])) return false;
        var fullWord = (before + word[pos] + after).toLowerCase();
        // Check the first 6 chars against the re- prefix list
        if (fullWord.length >= 6) {
            var prefix6 = fullWord.substring(0, 6);
            if (WL.motsRe6.has(prefix6)) return true;
        }
        // Also check for common re- patterns
        if (/^re[bcçdfghjklmnpqrstvwxz]{2}/i.test(fullWord)) return true;
        if (/^re[bcçdfghjklmnpqrstvwxz][aeiouyéèêàùûüîïôë]/i.test(fullWord)) return true;
        return false;
    }

    // Export all rule functions
    C.RuleFilters = {
        Regle_ient: Regle_ient,
        Regle_mots_ent: Regle_mots_ent,
        Regle_ment: Regle_ment,
        Regle_er: Regle_er,
        Regle_nc_ai_final: Regle_nc_ai_final,
        Regle_avoir: Regle_avoir,
        Regle_s_final: Regle_s_final,
        Regle_t_final: Regle_t_final,
        Regle_tien: Regle_tien,
        Regle_finD: Regle_finD,
        Regle_ill: Regle_ill,
        Regle_ierConjI: Regle_ierConjI,
        Regle_ierConjE: Regle_ierConjE,
        Regle_VerbesTer: Regle_VerbesTer,
        Regle_MotsUM: Regle_MotsUM,
        Regle_X_Final: Regle_X_Final,
        Regle_ChK: Regle_ChK,
        Regle_MotsUN_ON: Regle_MotsUN_ON,
        RegleMotsQUkw: RegleMotsQUkw,
        RegleMotsEn5: RegleMotsEn5,
        RegleMotsGnGN: RegleMotsGnGN,
        RegleMotsOYoj: RegleMotsOYoj,
        RegleMotsRe: RegleMotsRe
    };

})(window.Colorization);
