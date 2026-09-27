/**
 * Colorization pour OnlyOffice — Automate phonologique
 * Port JavaScript fidèle de AutomAutomat.cs (Pierre-Alain Etique, GPL-3.0)
 * https://github.com/paColor/Colorization
 */

window.Colorization = window.Colorization || {};

(function(C) {
    'use strict';

    var RF = null; // Will be set to C.RuleFilters after init

    /**
     * The automaton: for each letter, an ordered list of rules.
     * Each rule: [filter, phoneme, increment, optionalFlag]
     * filter: {'+': /regex/i, '-': /regex/i} or a function(pw, pos, before, after)
     * phoneme: string matching Phonemes keys
     * increment: number of chars consumed
     * optionalFlag: 'IllCeras' or 'IllLireCouleur' (checked against config)
     */
    function buildAutomat() {
        RF = C.RuleFilters;
        return {
'a': {
    order: ['u','il','in','nc_ai_fin','ai_fin','fais','i','n','m','adam','nm','y_except','y_fin','yat','taylor','y','ae_e','coach','saoul','*'],
    rules: {
        'u':        [{'+': /u/i}, 'o_comp', 2],
        'il':       [{'+': /il((s?)$|l)/i}, 'a', 1],
        'in':       [{'+': /i[nm]([bcçdfghjklnmpqrstvwxz]|$)/i}, 'e_tilda', 3],
        'nc_ai_fin':[RF.Regle_nc_ai_final, 'E_comp', 2],
        'ai_fin':   [{'+': /i$/i}, 'e_comp', 2],
        'fais':     [{'-': /f/i, '+': /is[aeiouy]/i}, 'q', 2],
        'i':        [{'+': /[iî]/i}, 'E_comp', 2],
        'n':        [{'+': /n[bcçdfgjklmpqrstvwxz]/i}, 'a_tilda', 2],
        'm':        [{'+': /m[bp]/i}, 'a_tilda', 2],
        'adam':     [{'-': /^ad/i, '+': /m(s?)$/i}, 'a_tilda', 2],
        'nm':       [{'+': /n(s?)$/i}, 'a_tilda', 2],
        'y_except': [{'-': /(^b|cob|cip|^k|^m|^f|mal|bat|^bisc)/i, '+': /y/i}, 'a', 1],
        'y_fin':    [{'+': /y(s?)$/i}, 'E_comp', 2],
        'yat':      [{'+': /yat/i}, 'a', 1],
        'taylor':   [{'-': /t/i, '+': /ylor/i}, 'E_comp', 2],
        'y':        [{'+': /y/i}, 'E_comp', 1],
        'ae_e':     [{'+': /e/i}, 'e', 2],
        'coach':    [{'-': /co/i, '+': /(ch|lt)/i}, '_muet', 1],
        'saoul':    [{'-': /s/i, '+': /oul/i}, '_muet', 1],
        '*':        [{}, 'a', 1]
    }
},
'â': { order: ['*'], rules: { '*': [{}, 'a', 1] } },
'à': { order: ['*'], rules: { '*': [{}, 'a', 1] } },
'ä': { order: ['*'], rules: { '*': [{}, 'a', 1] } },

'b': {
    order: ['b','plomb','*'],
    rules: {
        'b':     [{'+': /b/i}, 'b', 2],
        'plomb': [{'-': /om/i, '+': /(s?)$/i}, '_muet', 1],
        '*':     [{}, 'b', 1]
    }
},

'c': {
    order: ['eiy','choeur','psycho','brachio','schizo','tech','tachy','batra','chK','h','cciey','cc','cisole','c_muet_fin','c_k_fin','@','ct_fin','apostrophe','coe','seconde','*'],
    rules: {
        'eiy':       [{'+': /([eiyéèêëîï]|ae)/i}, 's_c', 1],
        'choeur':    [{'+': /h(oe|œ|or|éo|r|estr|esti|irop|irom|lo|lam)/i}, 'k', 2],
        'psycho':    [{'-': /psy/i, '+': /h[oa]/i}, 'k', 2],
        'brachio':   [{'-': /bra/i, '+': /hio/i}, 'k', 2],
        'schizo':    [{'-': /s/i, '+': /(hi[aoz]|hato)/i}, 'k', 2],
        'tech':      [{'-': /te/i, '+': /hn/i}, 'k', 2],
        'tachy':     [{'-': /ta/i, '+': /hy/i}, 'k', 2],
        'batra':     [{'-': /batra/i, '+': /h/i}, 'k', 2],
        'chK':       [RF.Regle_ChK, 'k', 2],
        'h':         [{'+': /h/i}, 'S', 2],
        'cciey':     [{'+': /c[eiyéèêëîï]/i}, 'k', 1],
        'cc':        [{'+': /[ck]/i}, 'k', 2],
        'cisole':    [{'+': /$/i, '-': /^/i}, 's_c', 1],
        'c_muet_fin':[{'-': /taba|accro|estoma|bro|capo|cro|escro|raccro|caoutchou|mar/i, '+': /(s?)$/i}, '_muet', 1],
        'c_k_fin':   [{'-': /([aeiouïé]|^on|don|ar|ur|s|l)/i, '+': /(s?)$/i}, 'k', 1],
        '@':         [{'+': /(s?)$/i}, '_muet', 1],
        'ct_fin':    [{'-': /(spe|in)/i, '+': /t(s?)$/i}, '_muet', 1],
        'apostrophe':[{'+': /('|')/i}, 's_c', 2],
        'coe':       [{'+': /(œ)(l|n|c)/i}, 's_c', 1],
        'seconde':   [{'-': /se/i, '+': /ond/i}, 'g', 1],
        '*':         [{}, 'k', 1]
    }
},

'ç': { order: ['*'], rules: { '*': [{}, 's', 1] } },

'd': {
    order: ['d','disole','except','dmuet','dt','*'],
    rules: {
        'd':      [{'+': /d/i}, 'd', 2],
        'except': [RF.Regle_finD, 'd', 1],
        'disole': [{'+': /$/i, '-': /^/i}, 'd', 1],
        'dmuet':  [{'+': /(s?)$/i}, '_muet', 1],
        'dt':     [{'+': /t/i}, '_muet', 1],
        '*':      [{}, 'd', 1]
    }
},

'e': {
    order: ['conj_v_ier','uient','ien_0','scien','orient','ien','ien2','examen','zen','_ent','adv_emment_fin','ment','imparfait','verbe_3_pluriel','hier','au','avoir','eu','in','orgueil','eil','y','iy','enn_debut_mot','t_final','eclm_final','d_except','drz_final','except_en2','n','adv_emment_a','lemme','em_gene','nm','eno','tclesmesdes_fr','tclesmesdes_be','jtcnslemede','jean','ge','eoi','ex','ef','reqquechose','entre','except_evr','2consonnes','abbaye','que_gue_final','e_muet','e_deb','@','ier_Conj','hyper','*'],
    rules: {
        'conj_v_ier':       [RF.Regle_ient, '_muet', 3],
        'uient':            [{'-': /ui/i, '+': /nt$/i}, '_muet', 3],
        'ien_0':            [{'-': /(fic|n|quot|ingréd)i/i, '+': /nt(s?)$/i}, 'a_tilda', 2],
        'scien':            [{'-': /((aud|sc|cl|^fa|([éf]fic)|pat|émoll|expé[dr]|^farn|^résil|obéd)[iï])/i, '+': /n/i}, 'a_tilda', 2],
        'orient':           [{'-': /(ori|gradi)/i, '+': /nt/i}, 'a_tilda', 2],
        'ien':              [{'-': /([bcdégklmnrstvhz]i|ï)/i, '+': /n([bcçdfghjklpqrstvwxz]|(s?)$)/i}, 'e_tilda', 2],
        'ien2':             [{'-': /pi/i, '+': /n(s?)$/i}, 'e_tilda', 2],
        'examen':           [{'-': /(exam|mino|édu|apexi|^api|loqui|\wy|é|^b(r?))/i, '+': /n(s?)$/i}, 'e_tilda', 2],
        'zen':              [{'-': /([a-z]m|gold|poll|^[yz]|^av|bigoud|coh|^éd)/i, '+': /n(s?)$/i}, 'E_comp', 1],
        '_ent':             [RF.Regle_mots_ent, 'a_tilda', 2],
        'adv_emment_fin':   [{'-': /emm/i, '+': /nt/i}, 'a_tilda', 2],
        'ment':             [RF.Regle_ment, 'a_tilda', 2],
        'imparfait':        [{'-': /ai/i, '+': /nt$/i}, 'verb_3p', 3],
        'verbe_3_pluriel':  [{'+': /nt$/i}, 'q_caduc', 1],
        'hier':             [RF.Regle_er, 'E_comp', 1],
        'au':               [{'+': /au/i}, 'o_comp', 3],
        'avoir':            [RF.Regle_avoir, 'y', 2],
        'eu':               [{'+': /(u|û)/i}, 'x2', 2],
        'in':               [{'+': /i[nm]([bcçdfghjklnmpqrstvwxz]|$)/i}, 'e_tilda', 3],
        'orgueil':          [{'-': /gu/i, '+': /il/i}, 'x2', 1],
        'eil':              [{'+': /il/i}, 'E_comp', 1],
        'y':                [{'+': /y[aeiouéèêààäôâ]/i}, 'E_comp', 1],
        'iy':               [{'+': /[iy]/i}, 'E_comp', 2],
        'enn_debut_mot':    [{'-': /(^|dés)/i, '+': /nn[^ié]/i}, 'a_tilda', 2],
        't_final':          [{'+': /[t]$/i}, 'E_comp', 2],
        'eclm_final':       [{'+': /[clm](s?)$/i}, 'E_comp', 1],
        'd_except':         [{'-': /(^bl|^ou|^damn)/i, '+': /d(s?)$/i}, 'E_comp', 1],
        'drz_final':        [{'+': /[drz](s?)$/i}, 'e_comp', 2],
        'except_en2':       [RF.RegleMotsEn5, 'e_tilda', 2],
        'n':                [{'+': /n[bcdfghjklmpqrstvwxzç]/i}, 'a_tilda', 2],
        'adv_emment_a':     [{'+': /mment/i}, 'a', 1],
        'lemme':            [{'-': /([ltg]|^p|^syn|^systr)/i, '+': /mm/i}, 'E_comp', 1],
        'em_gene':          [{'+': /m[bcçdfghjklmpqrstvwxz]/i}, 'a_tilda', 2],
        'nm':               [{'+': /[nm]$/i}, 'a_tilda', 2],
        'eno':              [{'-': /(^|dés)/i, '+': /n[aio]/i}, 'a_tilda', 1],
        'tclesmesdes_fr':   [{'-': /^[tcslmd]/i, '+': /s$/i}, 'e_comp', 2, 'regionFR'],
        'tclesmesdes_be':   [{'-': /^[tcslmd]/i, '+': /s$/i}, 'E_comp', 2, 'regionBE'],
        'que_gue_final':    [{'-': /[gq]u/i, '+': /(s?)$/i}, 'q_caduc', 1],
        'jtcnslemede':      [{'-': /^[jtcnslmd]/i, '+': /$/i}, 'q', 1],
        'jean':             [{'-': /j/i, '+': /an/i}, '_muet', 1],
        'ge':               [{'-': /g/i, '+': /[aouàäôâ]/i}, '_muet', 1],
        'eoi':              [{'+': /oi/i}, '_muet', 1],
        'ex':               [{'+': /x/i}, 'E_comp', 1],
        'ef':               [{'+': /[bf](s?)$/i}, 'E_comp', 1],
        'reqquechose':      [RF.RegleMotsRe, 'q', 1],
        'entre':            [{'-': /^((ré)?)entr|^contr|^autor|^maugr/i}, 'q', 1],
        'except_evr':       [{'+': /([cfv]r)/i}, 'q', 1],
        '2consonnes':       [{'+': /[bcçdfghjklmnpqrstvwxz]{2}/i}, 'E_comp', 1],
        'abbaye':           [{'-': /abbay/i, '+': /(s?)$/i}, '_muet', 1],
        'e_muet':           [{'-': /[aeiouéèêà]/i, '+': /(s?)$/i}, '_muet', 1],
        'e_deb':            [{'-': /^/i}, 'q', 1],
        '@':                [{'+': /(s?)$/i}, 'q_caduc', 1],
        'ier_Conj':         [RF.Regle_ierConjE, '_muet', 1],
        'hyper':            [{'-': /(hyp|^int)/i, '+': /r/i}, 'E_comp', 1],
        '*':                [{}, 'q', 1]
    }
},

'é': { order: ['*'], rules: { '*': [{}, 'e', 1] } },
'è': { order: ['*'], rules: { '*': [{}, 'E', 1] } },
'ê': { order: ['*'], rules: { '*': [{}, 'E', 1] } },
'ë': { order: ['*'], rules: { '*': [{}, 'E', 1] } },

'f': {
    order: ['f','oeufs','*'],
    rules: {
        'f':     [{'+': /f/i}, 'f', 2],
        'oeufs': [{'-': /(oeu|œu)/i, '+': /s/i}, '_muet', 1],
        '*':     [{}, 'f', 1]
    }
},

'g': {
    order: ['sugg','g','ao','eiy','aiguille','u_consonne','ngui','u','except_n','n','vingt','g_muet_oin','g_muet_our','g_muet_an','*'],
    rules: {
        'sugg':        [{'-': /su/i, '+': /g(e|é)/i}, 'g', 1],
        'g':           [{'+': /g/i}, 'g', 2],
        'ao':          [{'+': /(a|o)/i}, 'g', 1],
        'eiy':         [{'+': /[eéèêëïiîy]/i}, 'Z', 1],
        'aiguille':    [{'-': /ai/i, '+': /(u(ill|iér|ï|ité|(s?)$))/i}, 'g', 1],
        'u_consonne':  [{'+': /u[bcçdfghjklmnpqrstvwxz]/i}, 'g', 1],
        'ngui':        [{'-': /n/i, '+': /ui(st|sm|fè|cu)/i}, 'g', 1],
        'u':           [{'+': /u/i}, 'g_u', 2],
        'except_n':    [RF.RegleMotsGnGN, 'g', 1],
        'n':           [{'+': /n/i}, 'N', 2],
        'vingt':       [{'-': /vin/i, '+': /t/i}, '_muet', 1],
        'g_muet_oin':  [{'-': /oi(n?)/i}, '_muet', 1],
        'g_muet_our':  [{'-': /ou(r)/i}, '_muet', 1],
        'g_muet_an':   [{'-': /((s|^ét|^r|^harf|^il)an|lon|haren|ein)/i, '+': /(s?)$/i}, '_muet', 1],
        '*':           [{}, 'g', 1]
    }
},

'h': { order: ['*'], rules: { '*': [{}, '_muet', 1] } },

'i': {
    order: ['ing','inh','sprint','n','m','nm','prec_2cons','lldeb','vill','tranquille','ill','except_ill','bacille','ill_Ceras','@ill','@il','ll','@il_Ceras','ll_Ceras','ui','ient_1','ient_2','ie','ier_Conj','i_voyelle','flirt','*'],
    rules: {
        'ing':         [{'-': /[bcçdfghjklmnpqrstvwxz]/i, '+': /ng(s?)$/i}, 'i', 1],
        'inh':         [{'+': /nh/i}, 'i', 1],
        'sprint':      [{'-': /(^spr|^sw|^tram|^sp|^sh|^pidg|^park|^muezz|^ingu)/i, '+': /n/i}, 'i', 1],
        'n':           [{'+': /n[bcçdfghjklmpqrstvwxz]/i}, 'e_tilda', 2],
        'm':           [{'+': /m[bcçdfghjklnpqrstvwxz]/i}, 'e_tilda', 2],
        'nm':          [{'+': /[n|m]$/i}, 'e_tilda', 2],
        'prec_2cons':  [{'-': /[ptkcbdgfv][lr]/i, '+': /[aäâeéèêëoôöuù]/i}, 'i_j', 1],
        'lldeb':       [{'-': /^/i, '+': /ll/i}, 'i', 1],
        'vill':        [{'-': /(v|^m)/i, '+': /ll/i}, 'i', 1, 'IllCeras'],
        'tranquille':  [{'-': /(ach|tranqu)/i, '+': /ll/i}, 'i', 1, 'IllCeras'],
        'ill':         [{'+': /ll/i, '-': /[bcçdfghjklmnpqrstvwxz](u?)/i}, 'i', 1, 'IllLireCouleur'],
        'except_ill':  [RF.Regle_ill, 'i', 1],
        'bacille':     [{'-': /(bac|dist|inst)/i, '+': /ll/i}, 'i', 1],
        'ill_Ceras':   [{'+': /ll/i, '-': /[bcçdfghjklmnpqrstvwxz](u?)/i}, 'i_j_ill', 3, 'IllCeras'],
        '@ill':        [{'-': /[aeoœ]/i, '+': /ll/i}, 'j', 3, 'IllLireCouleur'],
        '@il':         [{'-': /[aeouœ]/i, '+': /l(s?)$/i}, 'j', 2, 'IllLireCouleur'],
        'll':          [{'+': /ll/i}, 'j', 3, 'IllLireCouleur'],
        '@il_Ceras':   [{'-': /[aeouœ]/i, '+': /l(s?)$/i}, 'j_ill', 2, 'IllCeras'],
        'll_Ceras':    [{'+': /ll/i}, 'j_ill', 3, 'IllCeras'],
        'ui':          [{'-': /u/i, '+': /ent/i}, 'i', 1],
        'ient_1':      [RF.Regle_ient, 'i', 1],
        'ient_2':      [{'+': /ent(s?)$/i}, 'j', 1],
        'ie':          [{'+': /e(s?)$/i}, 'i', 1],
        'ier_Conj':    [RF.Regle_ierConjI, 'i', 1],
        'i_voyelle':   [{'+': /[aäâeéèêëoôöuù]/i}, 'ji', 1],
        'flirt':       [{'-': /^fl/i, '+': /rt/i}, 'x2', 1],
        '*':           [{}, 'i', 1]
    }
},

'ï': {
    order: ['thai','aie','n','m','nm','*'],
    rules: {
        'thai': [{'-': /t(h?)a/i}, 'j', 1],
        'aie':  [{'-': /[ao]/i, '+': /e/i}, 'j', 1],
        'n':    [{'+': /n[bcçdfghjklmpqrstvwxz]/i}, 'e_tilda', 2],
        'm':    [{'+': /m[bcçdfghjklnpqrstvwxz]/i}, 'e_tilda', 2],
        'nm':   [{'+': /[n|m]$/i}, 'e_tilda', 2],
        '*':    [{}, 'i', 1]
    }
},

'î': {
    order: ['n','*'],
    rules: {
        'n':  [{'+': /n[bcçdfghjklmpqrstvwxz]/i}, 'e_tilda', 2],
        '*':  [{}, 'i', 1]
    }
},

'j': { order: ['*'], rules: { '*': [{}, 'Z', 1] } },
'k': { order: ['*'], rules: { '*': [{}, 'k', 1] } },

'l': {
    order: ['vill','tranquille','illdeb','except_ill_l','bacille','ill','eil','ll','excep_il','*'],
    rules: {
        'vill':         [{'-': /(^v|vaudev|banv|^ov|bougainv|interv|cav|^m)i/i, '+': /l/i}, 'l', 2],
        'tranquille':   [{'-': /(achi|tranqui)/i, '+': /l/i}, 'l', 2],
        'illdeb':       [{'-': /^i/i, '+': /l/i}, 'l', 2],
        'except_ill_l': [RF.Regle_ill, 'l', 2],
        'bacille':      [{'-': /(baci|disti|insti)/i, '+': /l/i}, 'l', 2],
        'ill':          [{'-': /.i/i, '+': /l/i}, 'j', 2],
        'eil':          [{'-': /e(u?)i/i}, 'j', 1],
        'll':           [{'+': /l/i}, 'l', 2],
        'excep_il':     [{'-': /(fusi|outi|genti|sourci|persi)/i, '+': /(s?)$/i}, '_muet', 1],
        '*':            [{}, 'l', 1]
    }
},

'm': {
    order: ['m','tomn','damn','*'],
    rules: {
        'm':    [{'+': /m/i}, 'm', 2],
        'damn': [{'-': /da/i, '+': /n/i}, '_muet', 1],
        'tomn': [{'-': /to/i, '+': /n/i}, '_muet', 1],
        '*':    [{}, 'm', 1]
    }
},

'n': {
    order: ['n','ent','ing','*'],
    rules: {
        'n':   [{'+': /n/i}, 'n', 2],
        'ent': [{'-': /e/i, '+': /t$/i}, 'verb_3p', 2],
        'ing': [{'-': /i/i, '+': /g(s?)$/i}, 'J', 2],
        '*':   [{}, 'n', 1]
    }
},

'o': {
    order: ['in','except_y','i','tomn','faonner','n','m','nm','u','boo','alcool','oeu_defaut','oe_0','oe_2','oe_3','oe_4','oe_defaut','toast','*'],
    rules: {
        'in':          [{'+': /i[nm]([bcçdfghjklpqrstvwxz]|$)/i}, 'w_e_tilda', 3],
        'except_y':    [RF.RegleMotsOYoj, 'o', 1],
        'i':           [{'+': /(i|î|y)/i}, 'oi', 2],
        'tomn':        [{'-': /t/i, '+': /mn/i}, 'o', 1],
        'faonner':     [{'-': /^fa/i, '+': /nn/i}, '_muet', 1],
        'n':           [{'+': /n[bcçdfgjklmpqrstvwxz]/i}, 'o_tilda', 2],
        'm':           [{'+': /m[bcçdfgjkpqrstvwxz]/i}, 'o_tilda', 2],
        'nm':          [{'+': /[nm]$/i}, 'o_tilda', 2],
        'u':           [{'+': /[uwûù]/i}, 'u', 2],
        'boo':         [{'-': /(al|b|bl|baz|f|gl|gr|lm|pr|^r|sc|sh|sl|w)/i, '+': /o/i}, 'u', 2],
        'alcool':      [{'-': /(alc|hyper|waterl|witl)/i, '+': /o/i}, 'o', 2],
        'oeu_defaut':  [{'+': /eu/i}, 'x2', 3],
        'oe_0':        [{'+': /ê/i}, 'oi', 2],
        'oe_2':        [{'-': /m/i, '+': /e/i}, 'oi', 2],
        'oe_3':        [{'-': /f/i, '+': /et/i}, 'e', 2],
        'oe_4':        [{'-': /(gastr|électr|inc|min|c|aér|angi|benz)/i, '+': /e/i}, 'o', 1],
        'oe_defaut':   [{'+': /e/i}, 'x2', 2],
        'toast':       [{'-': /t/i, '+': /ast/i}, 'o', 2],
        '*':           [{}, 'o', 1]
    }
},

'œ': {
    order: ['oeu','coe','oe_e','*'],
    rules: {
        'oeu': [{'+': /u/i}, 'x2', 2],
        'coe':  [{'-': /c/i, '+': /n/i}, 'e', 1],
        'oe_e': [{'+': /(l|c|b|t)/i}, 'e', 1],
        '*':    [{}, 'x2', 1]
    }
},

'ô': { order: ['*'], rules: { '*': [{}, 'o', 1] } },
'ö': { order: ['*'], rules: { '*': [{}, 'o', 1] } },

'p': {
    order: ['p','h','oup','sculpt','*'],
    rules: {
        'p':      [{'+': /p/i}, 'p', 2],
        'h':      [{'+': /h/i}, 'f_ph', 2],
        'oup':    [{'-': /([cl]ou|dra|[ti]ro|alo|[rm])/i, '+': /(s?)$/i}, '_muet', 1],
        'sculpt': [{'-': /(scul|ba|com|corrom)/i, '+': /t/i}, '_muet', 1],
        '*':      [{}, 'p', 1]
    }
},

'q': {
    order: ['qua_w','qu','k','*'],
    rules: {
        'qua_w': [RF.RegleMotsQUkw, 'k', 1],
        'qu':    [{'+': /u[bcçdfgjklmnpqrstvwxz]/i}, 'k', 1],
        'k':     [{'+': /u/i}, 'k_qu', 2],
        '*':     [{}, 'k', 1]
    }
},

'r': {
    order: ['r','*'],
    rules: {
        'r':  [{'+': /r/i}, 'R', 2],
        '*':  [{}, 'R', 1]
    }
},

's': {
    order: ['schizo','sch','transs','s','s_final','@','parasit','balsa','subside','asept','pasZ','pasZ2','déss','prés_s','z','dész','h','fasci','*'],
    rules: {
        'schizo':  [{'+': /(chi[aoz]|chato)/i}, 's', 1],
        'sch':     [{'+': /ch/i}, 'S', 3],
        'transs':  [{'-': /tran/i, '+': /s/i}, 's', 1],
        's':       [{'+': /s/i}, 's', 2],
        's_final': [RF.Regle_s_final, 's', 1],
        '@':       [{'+': /$/i}, '_muet', 1],
        'parasit': [{'-': /para/i, '+': /it/i}, 'z_s', 1],
        'balsa':   [{'-': /(tran|bal)/i, '+': /(i|hum|a)/i}, 'z_s', 1],
        'subside': [{'-': /sub/i, '+': /i/i}, 'z_s', 1],
        'asept':   [{'-': /a/i, '+': /(ep(s|t)i|ex|ocia|y(m|n|s))/i}, 's', 1],
        'pasZ':    [{'-': /(^para|^contre|^mono|^vrai|^vivi|^uni|^ultra|^alcoo|^antidy|^anti|^auto|batracho|^bio|^su|^carbo|^chéno|^ortho|^déca|^co|^soubre|^crypto|^cupro|^cyno|^deuto|^dodéca|^écho|(^[ée]qui))/i}, 's', 1],
        'pasZ2':   [{'-': /(^énnéa|^entre|^géo|^gira|^gymno|^hélio|^hendéca|^hétéro|^homo|^hydro|^hypo|^poly|^psycho|^prime|^psycho|^radio|^tourne|^péri|^impari|^idio|^hydrogéno|^invrai|^micro|^octo|^photo|^proto)/i}, 's', 1],
        'déss':    [{'-': /^dé/i, '+': /(acra|ensibi|olida)/i}, 's', 1],
        'prés_s':  [{'-': /^pré/i, '+': /(éanc|échoir|élect|ériel|exu|uppo|ylvi|yndic)/i}, 's', 1],
        'z':       [{'-': /[aeiyouéèàâüûùëöêîôïœ]/i, '+': /[aeiyouéèàâüûùëöêîôïœ]/i}, 'z_s', 1],
        'dész':    [{'-': /(^dé|^di|^dy|^e|^phy|^tran)/i, '+': /[aiyouéèàâüûùëöêîôïh]/i}, 'z_s', 1],
        'h':       [{'+': /h/i}, 'S', 2],
        'fasci':   [{'-': /fa/i, '+': /cis/i}, 'S', 2],
        '*':       [{}, 's', 1]
    }
},

't': {
    order: ['t_deb','t','tisole','except_tien','_tien','ex_tiot','verb_tions','ex_tie','tie','tiaot','tiaos','vingt','ourt','_inct','_spect','_ct','_est','t_final','tmuet','ex_tiel','_tiel','courtci','@','*'],
    rules: {
        't_deb':       [{'-': /^/i}, 't', 1],
        't':           [{'+': /t/i}, 't', 2],
        'tisole':      [{'+': /$/i, '-': /^/i}, 't', 1],
        'except_tien': [RF.Regle_tien, 't', 1],
        '_tien':       [{'+': /ien/i}, 's_t', 1],
        'ex_tie':      [{'-': /minu/i, '+': /ie(r|z)/i}, 't', 1],
        'tie':         [{'-': /(ambi|albu|cra|lvi|[^r]essen|idio|iner|ini|minu|ipé|oten|phé|oba|iaba|argu|automa|balbu|^cani|cap|tan|conten|dévo|féren|ploma|facé|^fac|^goé|thé|^inep|^impa|^impéri|^infec|sat)/i, '+': /i(e|é|èr)/i}, 's_t', 1],
        'ex_tiot':     [{'-': /(cré|plé|jé|([^r]|^)essen|^dui|intui)/i, '+': /i[ao]/i}, 's_t', 1],
        'tiaot':       [{'-': /([eéèêës]|[sc]en|(^|h|n)an|f(l?)[uû]|(ch|^str|galim|fum)[aâ]|rb[io]|^ca|^tri)/i, '+': /i[aâou]/i}, 't', 1],
        'verb_tions':  [RF.Regle_VerbesTer, 't', 1],
        'tiaos':       [{'+': /i[aâou]/i}, 's_t', 1],
        'vingt':       [{'-': /ving/i, '+': /$/i}, 't', 1],
        'ourt':        [{'-': /(a|h|g)our/i, '+': /$/i}, 't', 1],
        '_inct':       [{'-': /inc/i, '+': /(s?)$/i}, '_muet', 1],
        '_spect':      [{'-': /spec/i, '+': /(s?)$/i}, '_muet', 1],
        '_ct':         [{'-': /c/i, '+': /(s?)$/i}, 't', 1],
        '_est':        [{'-': /es/i, '+': /(s?)$/i}, 't', 1],
        't_final':     [RF.Regle_t_final, 't', 1],
        'tmuet':       [{'+': /(s?)$/i}, '_muet', 1],
        'ex_tiel':     [{'-': /céles/i}, 't', 1],
        '_tiel':       [{'+': /iel((le)?)(s?)/i}, 's_t', 1],
        'courtci':     [{'-': /^cour/i, '+': /circ/i}, '_muet', 1],
        '*':           [{}, 't', 1],
        '@':           [{'+': /$/i}, '_muet', 1]
    }
},

'u': {
    order: ['um','circum','n_on','n','nm','ueil','trust','bluff','qua_w','umb','*'],
    rules: {
        'um':     [RF.Regle_MotsUM, 'o', 1],
        'circum': [{'-': /(circ|^cent)/i, '+': /m/i}, 'o', 1],
        'n_on':   [RF.Regle_MotsUN_ON, 'o_tilda', 2],
        'n':      [{'+': /n[bcçdfgjklmpqrstvwxz]/i}, 'x_tilda', 2],
        'nm':     [{'+': /[nm]$/i}, 'x_tilda', 2],
        'ueil':   [{'+': /eil/i}, 'x2', 2],
        'trust':  [{'-': /tr/i, '+': /st/i}, 'x2', 1],
        'bluff':  [{'-': /bl/i, '+': /ff/i}, 'x2', 1],
        'qua_w':  [RF.RegleMotsQUkw, 'w', 1],
        'umb':    [{'-': /(l|rh|^)/i, '+': /mb([aio]|ra|(s?)$)/i}, 'o_tilda', 2],
        '*':      [{}, 'y', 1]
    }
},

'û': { order: ['*'], rules: { '*': [{}, 'y', 1] } },
'ù': { order: ['*'], rules: { '*': [{}, 'y', 1] } },
'ü': { order: ['*'], rules: { '*': [{}, 'y', 1] } },

'v': { order: ['*'], rules: { '*': [{}, 'v', 1] } },

'w': {
    order: ['wurst','*'],
    rules: {
        'wurst': [{'+': /((u|ü)r|ag(o|n|uin)|rr|lk|isi|e(stp|rn|l(t|che)|i)|arrant|yando|orm|olfram|ill(é|e)|alky)/i}, 'v', 1, 'regionFR'],
        '*':     [{}, 'w', 1]
    }
},

'x': {
    order: ['six_dix','dixième','gz_1','gz_2','gz_3','gz_4','gz_5','_aeox','fix','xisole','x_final','@','*'],
    rules: {
        'six_dix':  [{'-': /(s|d)i/i, '+': /$/i}, 's_x', 1],
        'dixième':  [{'-': /(s|d)i/i, '+': /iè/i}, 'z', 1],
        'gz_1':     [{'-': /^/i, '+': /[aeuéèàüëêûù]/i}, 'gz', 1],
        'gz_2':     [{'-': /^(h?)e/i, '+': /(h?)[aeiouéèàüëöêîôûù]/i}, 'gz', 1],
        'gz_3':     [{'-': /^coe/i, '+': /[aeiouéèàüëöêîôûù]/i}, 'gz', 1],
        'gz_4':     [{'-': /^ine/i, '+': /[aeiouéèàüëöêîôûù]/i}, 'gz', 1],
        'gz_5':     [{'-': /^(p?)rée/i, '+': /[aeiouéèàüëöêîôûù]/i}, 'gz', 1],
        '_aeox':    [{'-': /[aeo]/i}, 'ks', 1],
        'fix':      [{'-': /fi/i}, 'ks', 1],
        'xisole':   [{'-': /^/i, '+': /$/i}, 'ks', 1],
        'x_final':  [RF.Regle_X_Final, 'ks', 1],
        '*':        [{}, 'ks', 1],
        '@':        [{'+': /$/i}, '_muet', 1]
    }
},

'y': {
    order: ['m','n','nm','abbaye','y_voyelle','*'],
    rules: {
        'm':         [{'+': /m[mpb]/i}, 'e_tilda', 2],
        'n':         [{'+': /n[bcçdfghjklmpqrstvwxz]/i}, 'e_tilda', 2],
        'nm':        [{'+': /[n|m]$/i}, 'e_tilda', 2],
        'abbaye':    [{'-': /abba/i, '+': /e/i}, 'i', 1],
        'y_voyelle': [{'+': /[aâeiouéèàüëöêîôûù]/i}, 'j', 1],
        '*':         [{}, 'i', 1]
    }
},

'z': {
    order: ['riz','aio_z','razzia','zsch','tz','zisole','@','*'],
    rules: {
        'riz':    [{'-': /^r(i|a)/i, '+': /$/i}, '_muet', 1],
        'aio_z':  [{'-': /(a|i|o)/i, '+': /$/i}, 'z', 1],
        'razzia': [{'+': /z/i}, 'd', 1],
        'zsch':   [{'+': /sch/i}, 'S', 4],
        'tz':     [{'-': /t/i}, 's', 1],
        'zisole': [{'-': /^/i, '+': /$/i}, 'z', 1],
        '@':      [{'+': /$/i}, '_muet', 1],
        '*':      [{}, 'z', 1]
    }
},

'æ': { order: ['*'], rules: { '*': [{}, 'e', 1] } },

// Digits
'0': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'1': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'2': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'3': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'4': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'5': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'6': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'7': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'8': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},
'9': { order: ['unité','dizaine','centaine','mil','*'], rules: {
    'unité':   [{'+': /($|[^\d])/i}, 'unité', 1],
    'dizaine': [{'+': /\d($|[^\d])/i}, 'dizaine', 1],
    'centaine':[{'+': /\d\d($|[^\d])/i}, 'centaine', 1],
    'mil':     [{'+': /\d\d\d($|[^\d])/i}, 'milliers', 1],
    '*':       [{}, 'chiffre', 1]
}},

'\u2019': { order: ['*'], rules: { '*': [{}, 'chiffre', 1] } },
"'":      { order: ['*'], rules: { '*': [{}, 'chiffre', 1] } },
'*':      { order: ['*'], rules: { '*': [{}, 'chiffre', 1] } }

        }; // end of automat definition
    } // end buildAutomat

    var automat = null;

    /**
     * Check if a rule filter matches
     * @param {Object|Function} filter - regex filter object or function
     * @param {string} word - the full word
     * @param {number} pos - current position in word
     * @param {string} before - substring before current char
     * @param {string} after - substring after current char
     * @returns {boolean}
     */
    /**
     * Cache for anchored regex (avoids re-creating on every call)
     */
    var anchoredCache = new WeakMap();

    function anchorStart(re) {
        // '+' patterns must match from the START of 'after'
        if (re.source[0] === '^') return re;
        var cached = anchoredCache.get(re);
        if (cached) return cached;
        var anchored = new RegExp('^(?:' + re.source + ')', re.flags);
        anchoredCache.set(re, anchored);
        return anchored;
    }

    function anchorEnd(re) {
        // '-' patterns must match at the END of 'before'
        if (re.source[re.source.length - 1] === '$') return re;
        var cached = anchoredCache.get(re);
        if (cached) return cached;
        var anchored = new RegExp('(?:' + re.source + ')$', re.flags);
        anchoredCache.set(re, anchored);
        return anchored;
    }

    function checkFilter(filter, word, pos, before, after) {
        if (typeof filter === 'function') {
            return filter(word, pos, before, after);
        }
        // Object with regex patterns — auto-anchored
        var plusOk = true, minusOk = true;
        if (filter['+']) {
            plusOk = anchorStart(filter['+']).test(after);
        }
        if (filter['-']) {
            minusOk = anchorEnd(filter['-']).test(before);
        }
        return plusOk && minusOk;
    }

    /**
     * Find phonemes in a word
     * @param {string} word - lowercase word to analyze
     * @param {Object} config - configuration with flag settings
     * @returns {Array} array of {start, end, phoneme, rule} objects
     */
    function findPhonemes(word, config) {
        if (!automat) {
            automat = buildAutomat();
        }

        // Check exception dictionary first
        var dictResult = C.Dictionary.lookup(word);
        if (dictResult) {
            return dictResult;
        }

        // Build effective flags: merge explicit flags + region-derived flags
        var flags = {};
        if (config && config.flags) {
            for (var k in config.flags) {
                if (config.flags.hasOwnProperty(k)) flags[k] = config.flags[k];
            }
        }
        // Derive regionFR / regionBE from config.region (default: 'be')
        var region = (config && config.region) || 'be';
        flags.regionFR = (region === 'fr');
        flags.regionBE = (region === 'be');

        var phonemes = [];
        var pos = 0;
        var w = word.toLowerCase();

        while (pos < w.length) {
            var ch = w[pos];
            var letterEntry = automat[ch] || automat['*'];

            if (!letterEntry) {
                // Unknown character, skip
                pos++;
                continue;
            }

            var before = w.substring(0, pos);
            var after = (pos < w.length - 1) ? w.substring(pos + 1) : '';
            var found = false;

            for (var i = 0; i < letterEntry.order.length; i++) {
                var ruleName = letterEntry.order[i];
                var rule = letterEntry.rules[ruleName];

                if (!rule) continue;

                var filter = rule[0];
                var phoneme = rule[1];
                var incr = rule[2];
                var flag = rule[3] || null;

                // Check flag (IllCeras, IllLireCouleur, regionFR, regionBE)
                if (flag) {
                    if (!flags[flag]) {
                        continue;
                    }
                }

                if (checkFilter(filter, w, pos, before, after)) {
                    phonemes.push({
                        start: pos,
                        end: pos + incr - 1,
                        phoneme: phoneme,
                        rule: ruleName
                    });
                    pos += incr;
                    found = true;
                    break;
                }
            }

            if (!found) {
                // Fallback: treat as unknown character
                phonemes.push({
                    start: pos,
                    end: pos,
                    phoneme: 'chiffre',
                    rule: 'fallback'
                });
                pos++;
            }
        }

        return phonemes;
    }

    /**
     * Analyze a full text: split into words and find phonemes for each
     * @param {string} text - the text to analyze
     * @param {Object} config - configuration
     * @returns {Array} array of {word, start, phonemes} objects
     */
    function analyzeText(text, config) {
        var results = [];
        // Split text preserving positions
        var wordRegex = /[a-zàáâäæãåāèéêëēėęîïíīįìôöòóœøōõûüùúūÿçñ\u2019']+/gi;
        var match;

        while ((match = wordRegex.exec(text)) !== null) {
            var word = match[0].toLowerCase();
            var phonemes = findPhonemes(word, config);
            results.push({
                word: match[0],
                start: match.index,
                phonemes: phonemes
            });
        }

        return results;
    }

    C.Automat = {
        findPhonemes: findPhonemes,
        analyzeText: analyzeText
    };

})(window.Colorization);
