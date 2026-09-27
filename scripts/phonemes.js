/**
 * Colorization pour OnlyOffice — Définitions des phonèmes
 * Port JavaScript du projet Colorization de Pierre-Alain Etique (GPL-3.0)
 * https://github.com/paColor/Colorization
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    // Phoneme identifiers - mirrors the C# Phonemes enum
    const Phonemes = {
        a: 'a',             // bat, plat
        q: 'q',             // le e de je, te, me (schwa)
        q_caduc: 'q_caduc', // e final (correctes)
        i: 'i',             // lit, émis
        o: 'o',             // sot, automne (o ouvert)
        o_comp: 'o_comp',   // eau, au (o fermé)
        u: 'u',             // roue (ou)
        y: 'y',             // lu (u)
        e: 'e',             // été (e fermé)
        E: 'E',             // paire, treize (e ouvert)
        E_comp: 'E_comp',   // e ouvert composé
        e_comp: 'e_comp',   // clef, nez (e fermé composé)
        e_tilda: 'e_tilda', // in - cinq, linge
        a_tilda: 'a_tilda', // an - ange
        o_tilda: 'o_tilda', // on - savon
        x_tilda: 'x_tilda', // un - parfum
        x2: 'x2',           // eu - deux, oeuf
        oi: 'oi',           // oi
        w_e_tilda: 'w_e_tilda', // oin - poing
        w: 'w',             // kiwi (semi-voyelle)
        j: 'j',             // paille, yeux (semi-voyelle)
        J: 'J',             // ng final anglais
        i_j: 'i_j',         // affrioler
        N: 'N',             // gn - agneau
        p: 'p',             // père
        b: 'b',             // bon
        t: 't',             // terre
        d: 'd',             // dans
        k: 'k',             // carre
        g: 'g',             // gare
        f: 'f',             // feu
        v: 'v',             // vous
        s: 's',             // sale
        z: 'z',             // zéro
        S: 'S',             // ch - chat
        Z: 'Z',             // j/ge - gilet
        m: 'm',             // main
        n: 'n',             // nous
        l: 'l',             // lent
        R: 'R',             // rue
        f_ph: 'f_ph',       // ph - philosophie
        k_qu: 'k_qu',       // qu - quel
        g_u: 'g_u',         // gu - gueule
        s_c: 's_c',         // c doux - ceci
        s_t: 's_t',         // ti - partition
        s_x: 's_x',         // x - six, dix
        z_s: 'z_s',         // s intervocalique
        ks: 'ks',           // x - rixe
        gz: 'gz',           // x - examiner
        verb_3p: 'verb_3p', // -nt conjugaison 3e pers
        _muet: '_muet',     // lettre muette
        j_ill: 'j_ill',     // ill (CERAS)
        i_j_ill: 'i_j_ill', // ill (CERAS)
        ji: 'ji',           // i devant voyelle
        chiffre: 'chiffre',
        unite: 'unité',
        dizaine: 'dizaine',
        centaine: 'centaine',
        milliers: 'milliers'
    };

    // Map sounds ("sons") to their phonemes - for configuration UI
    const SonMap = {
        'a':      [Phonemes.a],
        'q':      [Phonemes.q],
        'i':      [Phonemes.i],
        'y':      [Phonemes.y],
        '1':      [Phonemes.x_tilda],
        'u':      [Phonemes.u],
        'é':      [Phonemes.e, Phonemes.e_comp],
        'o':      [Phonemes.o, Phonemes.o_comp],
        'è':      [Phonemes.E, Phonemes.E_comp],
        'an':     [Phonemes.a_tilda],
        'on':     [Phonemes.o_tilda],
        'eu':     [Phonemes.x2],
        'oi':     [Phonemes.oi],
        'in':     [Phonemes.e_tilda],
        'w':      [Phonemes.w],
        'j':      [Phonemes.j, Phonemes.ji],
        'ill':    [Phonemes.j_ill, Phonemes.i_j_ill],
        'ng':     [Phonemes.J],
        'gn':     [Phonemes.N],
        'l':      [Phonemes.l],
        'v':      [Phonemes.v],
        'f':      [Phonemes.f, Phonemes.f_ph],
        'p':      [Phonemes.p],
        'b':      [Phonemes.b],
        'm':      [Phonemes.m],
        'z':      [Phonemes.z, Phonemes.z_s],
        's':      [Phonemes.s, Phonemes.s_c, Phonemes.s_t, Phonemes.s_x],
        't':      [Phonemes.t],
        'd':      [Phonemes.d],
        'ks':     [Phonemes.ks],
        'gz':     [Phonemes.gz],
        'r':      [Phonemes.R],
        'n':      [Phonemes.n],
        'ge':     [Phonemes.Z],
        'ch':     [Phonemes.S],
        'k':      [Phonemes.k, Phonemes.k_qu],
        'g':      [Phonemes.g, Phonemes.g_u],
        'ij':     [Phonemes.i_j],
        'oin':    [Phonemes.w_e_tilda],
        '47':     [Phonemes.chiffre],
        'uni':    [Phonemes.unite],
        'diz':    [Phonemes.dizaine],
        'cen':    [Phonemes.centaine],
        'mil':    [Phonemes.milliers],
        '_muet':  [Phonemes.verb_3p, Phonemes._muet],
        'q_caduc':[Phonemes.q_caduc]
    };

    // Sound display labels and examples
    const SonInfo = {
        'a':   { label: '[a]',   example: 'ta, plat' },
        'q':   { label: '[e]',   example: 'le, me, je' },
        'i':   { label: '[i]',   example: 'lit, émis' },
        'y':   { label: '[y]',   example: 'lu, tue' },
        '1':   { label: '[œ̃]',  example: 'un, parfum' },
        'u':   { label: '[u]',   example: 'roue, où' },
        'é':   { label: '[e]',   example: 'clé, nez' },
        'o':   { label: '[o]',   example: 'eau, auto' },
        'è':   { label: '[ɛ]',   example: 'treize, mère' },
        'an':  { label: '[ɑ̃]',  example: 'ange, temps' },
        'on':  { label: '[ɔ̃]',  example: 'savon, bon' },
        'eu':  { label: '[ø]',   example: 'deux, oeuf' },
        'oi':  { label: '[wa]',  example: 'roi, voix' },
        'in':  { label: '[ɛ̃]',  example: 'cinq, linge' },
        'w':   { label: '[w]',   example: 'kiwi' },
        'j':   { label: '[j]',   example: 'paille, yeux' },
        'ill': { label: '[ij]',  example: 'fille, bille' },
        'ng':  { label: '[ŋ]',   example: 'parking' },
        'gn':  { label: '[ɲ]',   example: 'agneau, vigne' },
        'l':   { label: '[l]',   example: 'lent, sol' },
        'v':   { label: '[v]',   example: 'vous, rêve' },
        'f':   { label: '[f]',   example: 'feu, neuf, photo' },
        'p':   { label: '[p]',   example: 'père, soupe' },
        'b':   { label: '[b]',   example: 'bon, robe' },
        'm':   { label: '[m]',   example: 'main, ferme' },
        'z':   { label: '[z]',   example: 'zéro, maison' },
        's':   { label: '[s]',   example: 'sale, dessous' },
        't':   { label: '[t]',   example: 'terre, vite' },
        'd':   { label: '[d]',   example: 'dans, aide' },
        'ks':  { label: '[ks]',  example: 'rixe, axe' },
        'gz':  { label: '[gz]',  example: 'examiner' },
        'r':   { label: '[ʁ]',   example: 'rue, venir' },
        'n':   { label: '[n]',   example: 'nous, tonne' },
        'ge':  { label: '[ʒ]',   example: 'gilet, juge' },
        'ch':  { label: '[ʃ]',   example: 'chat, tache' },
        'k':   { label: '[k]',   example: 'carré, laque' },
        'g':   { label: '[g]',   example: 'gare, bague' },
        'ij':  { label: '[ij]',  example: 'affrioler' },
        'oin': { label: '[wɛ̃]', example: 'poing, loin' },
        '_muet':  { label: 'muet', example: 'h, lettres finales' },
        'q_caduc':{ label: '[ə]',  example: 'e final' }
    };

    /**
     * CERAS predefined colors (RGB).
     *
     * Ces couleurs reproduisent le code couleur CERAS officiel utilisé par les
     * enseignants (supports papier existants) — elles ne sont PAS choisies
     * librement par ce projet et ne doivent pas être modifiées pour améliorer
     * le contraste sans concertation, sous peine de désynchroniser l'outil
     * numérique des supports papier CERAS déjà utilisés en classe.
     *
     * Contraste WCAG mesuré sur fond blanc (page Word), formule de luminance
     * relative sRGB standard, ratio (L_blanc + 0.05) / (L_couleur + 0.05) :
     * CERAS_oi:    21.00:1  AA texte normal
     * CERAS_o:     1.39:1  sous le seuil AA
     * CERAS_an:    2.77:1  sous le seuil AA
     * CERAS_in:    3.57:1  AA texte large / gras seulement
     * CERAS_E:     5.82:1  AA texte normal
     * CERAS_e:     10.44:1  AA texte normal
     * CERAS_u:     4.00:1  AA texte large / gras seulement
     * CERAS_on:    3.79:1  AA texte large / gras seulement
     * CERAS_eu:    4.07:1  AA texte large / gras seulement
     * CERAS_oin:   2.02:1  sous le seuil AA
     * CERAS_muet:  2.43:1  sous le seuil AA
     * CERAS_rose:  2.72:1  sous le seuil AA
     * CERAS_ill:   1.45:1  sous le seuil AA
     * CERAS_1:     1.35:1  sous le seuil AA
     *
     * → La majorité des couleurs CERAS n'atteint PAS le seuil WCAG AA (4.5:1)
     *   sur fond blanc : c'est un compromis assumé au profit de la fidélité
     *   au référentiel CERAS existant, pas un oubli technique. À signaler
     *   explicitement à l'enseignant (voir docs/pourquoi-colorisation-plai.html).
     *
     * Daltonisme : CERAS_u (rouge) et CERAS_in (vert) codent deux sons
     * différents avec des teintes qu'un daltonisme rouge-vert (proto/
     * deutéranopie, ~8% des hommes) peut confondre. Trois sons compensent
     * déjà en partie par un second canal non-couleur (CERAS_oi = gras,
     * CERAS_ill = italique, CERAS_1 = souligné) ; les autres sons reposent
     * uniquement sur la teinte.
     */
    const CerasColors = {
        CERAS_oi:    { r: 0,   g: 0,   b: 0,   bold: true },    // noir + gras
        CERAS_o:     { r: 240, g: 222, b: 0 },                    // jaune
        CERAS_an:    { r: 237, g: 125, b: 49 },                   // orange
        CERAS_in:    { r: 51,  g: 153, b: 102 },                  // vert sapin
        CERAS_E:     { r: 164, g: 20,  b: 210 },                  // violet
        CERAS_e:     { r: 0,   g: 20,  b: 208 },                  // bleu foncé
        CERAS_u:     { r: 255, g: 0,   b: 0 },                    // rouge
        CERAS_on:    { r: 171, g: 121, b: 66 },                   // marron
        CERAS_eu:    { r: 71,  g: 115, b: 255 },                  // bleu
        CERAS_oin:   { r: 15,  g: 201, b: 221 },                  // turquoise
        CERAS_muet:  { r: 166, g: 166, b: 166 },                  // gris
        CERAS_rose:  { r: 255, g: 100, b: 177 },                  // rose
        CERAS_ill:   { r: 127, g: 241, b: 0, italic: true },      // vert grenouille + italique
        CERAS_1:     { r: 222, g: 222, b: 222, underline: true }  // souligné
    };

    // Default CERAS-rose configuration: which sounds are enabled and their color
    const DefaultSonConfig = {
        'o':      { enabled: true, color: CerasColors.CERAS_o },
        'an':     { enabled: true, color: CerasColors.CERAS_an },
        'in':     { enabled: true, color: CerasColors.CERAS_in },
        'è':      { enabled: true, color: CerasColors.CERAS_E },
        'é':      { enabled: true, color: CerasColors.CERAS_rose },  // CERAS-rose override
        'u':      { enabled: true, color: CerasColors.CERAS_u },
        'oi':     { enabled: true, color: CerasColors.CERAS_oi },
        'on':     { enabled: true, color: CerasColors.CERAS_on },
        'eu':     { enabled: true, color: CerasColors.CERAS_eu },
        'oin':    { enabled: true, color: CerasColors.CERAS_oin },
        '1':      { enabled: true, color: CerasColors.CERAS_1 },
        '_muet':  { enabled: true, color: CerasColors.CERAS_muet },
        'ill':    { enabled: true, color: CerasColors.CERAS_ill }
    };

    // Grapheme info: labels and examples for each phoneme variant within a son
    // Used for the "graphèmes liés" UI (per-phoneme toggle)
    const GraphemeInfo = {
        // Son 'é' — 2 variants
        'e':        { label: 'e',           example: 'le, de, me' },
        'e_comp':   { label: 'er, ez, é, et, ed', example: 'nez, clé, pied' },
        // Son 'o' — 2 variants
        'o':        { label: 'o',           example: 'bol, mot, col' },
        'o_comp':   { label: 'au, eau, ô',  example: 'chapeau, auto' },
        // Son 'è' — 2 variants
        'E':        { label: 'e (+cons)',    example: 'sel, bec, mer' },
        'E_comp':   { label: 'ai, ei, ê, è', example: 'maison, neige' },
        // Son 'f' — 2 variants
        'f':        { label: 'f',           example: 'feu, neuf' },
        'f_ph':     { label: 'ph',          example: 'photo, phare' },
        // Son 's' — 4 variants
        's':        { label: 's, ss',       example: 'sel, poisson' },
        's_c':      { label: 'c (+e,i)',    example: 'ceci, glace' },
        's_t':      { label: 'ti (+on)',    example: 'attention' },
        's_x':      { label: 'x (six)',     example: 'six, dix' },
        // Son 'z' — 2 variants
        'z':        { label: 'z',           example: 'zoo, zéro' },
        'z_s':      { label: 's (entre voy.)', example: 'maison, rose' },
        // Son 'k' — 2 variants
        'k':        { label: 'c, k',       example: 'car, kilo' },
        'k_qu':     { label: 'qu',          example: 'quel, qui' },
        // Son 'g' — 2 variants
        'g':        { label: 'g',           example: 'gare, bague' },
        'g_u':      { label: 'gu',          example: 'gueule, gui' },
        // Son 'j' — 2 variants
        'j':        { label: 'y, il',       example: 'payer, yeux' },
        'ji':       { label: 'i (+voy.)',   example: 'piano, lion' },
        // Son 'ill' — 2 variants
        'j_ill':    { label: 'ill',         example: 'fille, bille' },
        'i_j_ill':  { label: 'il (final)',  example: 'soleil, travail' },
        // Son '_muet' — 2 variants
        'verb_3p':  { label: '-ent (verbe)', example: 'ils chantent' },
        '_muet':    { label: 'h, lettres fin.', example: 'heure, doigt' }
    };

    // Default grapheme-level config for Belgian preset
    // true = colorized, false = not colorized
    const GraphemeDefaultsBE = {
        'o':      false,  // "o" simple = transparent en BE, ne pas coloriser
        'o_comp': true,   // "eau/au" = complexe, coloriser
        'E':      true,   // "è" simple = coloriser (non transparent)
        'E_comp': true,   // "ai/ei" = coloriser
        'e':      true,   // schwa "e" = coloriser
        'e_comp': true,   // "er/ez/é" = coloriser
        'f':      true,   'f_ph':    true,
        's':      true,   's_c':     true,   's_t': true,  's_x': true,
        'z':      true,   'z_s':     true,
        'k':      true,   'k_qu':    true,
        'g':      true,   'g_u':     true,
        'j':      true,   'ji':      true,
        'j_ill':  true,   'i_j_ill': true,
        'verb_3p': true,  '_muet':   true
    };

    // Default grapheme-level config for French preset
    const GraphemeDefaultsFR = {
        'o':      true,   // "o" simple = coloriser en FR (même son)
        'o_comp': true,
        'E':      true,   'E_comp': true,
        'e':      true,   'e_comp': true,
        'f':      true,   'f_ph':    true,
        's':      true,   's_c':     true,   's_t': true,  's_x': true,
        'z':      true,   'z_s':     true,
        'k':      true,   'k_qu':    true,
        'g':      true,   'g_u':     true,
        'j':      true,   'ji':      true,
        'j_ill':  true,   'i_j_ill': true,
        'verb_3p': true,  '_muet':   true
    };

    // Phoneme to sound reverse map (for quick lookup during colorization)
    const phonemeToSon = {};
    for (const [son, phons] of Object.entries(SonMap)) {
        for (const p of phons) {
            phonemeToSon[p] = son;
        }
    }

    // Classification of phonemes
    const vowelPhonemes = new Set([
        'a','q','q_caduc','i','o','o_comp','u','y','e','E','E_comp','e_comp',
        'e_tilda','a_tilda','o_tilda','x_tilda','x2','oi','w_e_tilda'
    ]);
    const consonantPhonemes = new Set([
        'p','b','t','d','k','g','f','v','s','z','S','Z','m','n','l','R',
        'f_ph','k_qu','g_u','s_c','s_t','s_x','z_s','ks','gz','N'
    ]);
    const semiVowelPhonemes = new Set(['w','j','J','i_j','j_ill','i_j_ill','ji']);
    const muetPhonemes = new Set(['verb_3p','_muet']);

    C.Phonemes = Phonemes;
    C.SonMap = SonMap;
    C.SonInfo = SonInfo;
    C.CerasColors = CerasColors;
    C.DefaultSonConfig = DefaultSonConfig;
    C.GraphemeInfo = GraphemeInfo;
    C.GraphemeDefaultsBE = GraphemeDefaultsBE;
    C.GraphemeDefaultsFR = GraphemeDefaultsFR;
    C.phonemeToSon = phonemeToSon;
    C.vowelPhonemes = vowelPhonemes;
    C.consonantPhonemes = consonantPhonemes;
    C.semiVowelPhonemes = semiVowelPhonemes;
    C.muetPhonemes = muetPhonemes;

})(window.Colorization);
