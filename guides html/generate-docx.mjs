import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak, ImageRun } from 'docx';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const logoBuffer = readFileSync(new URL('./plai-logo.jpg', import.meta.url));
// Logo PLAI : ratio non carré ~2.56:1 (1276×498px) — hauteur fixée, largeur proportionnelle.
const logoImage = () => new ImageRun({ type: 'jpg', data: logoBuffer, transformation: { width: 62, height: 24 } });

const TEAL = '0A9370';
const ORANGE = 'F97316';
const BLACK = '1A1A1A';
const GRAY = '666666';
const WHITE = 'FFFFFF';
const LIGHT_TEAL = 'E1F5EE';
const LIGHT_YELLOW = 'FFFDE7';
const LIGHT_GRAY = 'F5F5F5';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Shared styles — language set to French Belgium to avoid spell-check red underlines
const baseStyles = {
  default: { document: { run: { font: 'Segoe UI', size: 21, language: { value: 'fr-BE' } } } },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 32, bold: true, font: 'Segoe UI', color: TEAL },
      paragraph: { spacing: { before: 280, after: 120 }, border: { left: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 26, bold: true, font: 'Segoe UI', color: TEAL },
      paragraph: { spacing: { before: 200, after: 100 }, border: { left: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 6 } }, outlineLevel: 1 } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 23, bold: true, font: 'Segoe UI', color: BLACK },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
  ]
};

const numbering = {
  config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
    { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
  ]
};

function bullet(runs) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, children: Array.isArray(runs) ? runs : [runs], spacing: { after: 60 } });
}
function numbered(runs) {
  return new Paragraph({ numbering: { reference: 'numbers', level: 0 }, children: Array.isArray(runs) ? runs : [runs], spacing: { after: 60 } });
}
function p(runs, opts = {}) {
  return new Paragraph({ children: Array.isArray(runs) ? runs : [runs], spacing: { after: 100 }, ...opts });
}
function t(text, opts = {}) { return new TextRun({ text, ...opts }); }
function bold(text, opts = {}) { return new TextRun({ text, bold: true, ...opts }); }
function teal(text, opts = {}) { return new TextRun({ text, color: TEAL, bold: true, ...opts }); }
function gray(text) { return new TextRun({ text, color: GRAY, size: 18 }); }

function headerFooter(title) {
  return {
    headers: { default: new Header({ children: [
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        logoImage(),
        new TextRun({ text: '  PLAI', bold: true, color: ORANGE, size: 16 }),
        new TextRun({ text: ` \u2014 ${title}`, color: GRAY, size: 16 }),
      ], border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: TEAL, space: 4 } } })
    ] }) },
    footers: { default: new Footer({ children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'PLAI \u2014 P\u00f4le Li\u00e9geois d\'Accompagnement vers une \u00c9cole Inclusive', size: 15, color: GRAY }),
        new TextRun({ text: '  |  Page ', size: 15, color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], size: 15, color: GRAY }),
      ] })
    ] }) }
  };
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((c, i) => new TableCell({
      borders,
      margins: cellMargins,
      width: c.width ? { size: c.width, type: WidthType.DXA } : undefined,
      shading: isHeader ? { fill: i === 1 ? ORANGE : BLACK, type: ShadingType.CLEAR } :
               c.shading ? { fill: c.shading, type: ShadingType.CLEAR } : undefined,
      children: [new Paragraph({ children: Array.isArray(c.content) ? c.content : [
        new TextRun({ text: c.text || '', bold: isHeader || c.bold, color: isHeader ? WHITE : (c.color || BLACK), size: c.size || 19 })
      ] })]
    }))
  });
}

// ════════════════════════════════════════════════════════════
//  DOCUMENT 1: Pourquoi ?
// ════════════════════════════════════════════════════════════
function createPourquoi() {
  const children = [
    // Title
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
      teal('Colorisation PLAI', { size: 36 }), t(' pour OnlyOffice \u2014 Pourquoi ?', { size: 36, bold: true }),
    ] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } },
      children: [gray('P\u00d4LE LI\u00c9GEOIS D\'ACCOMPAGNEMENT VERS UNE \u00c9COLE INCLUSIVE')] }),

    // Section 1
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('1. Un outil scientifiquement fond\u00e9')] }),
    p([t('Le plugin '), bold('Colorisation PLAI'), t(' colorise les phon\u00e8mes, les syllabes et propose des aides visuelles \u00e0 la lecture pour les \u00e9l\u00e8ves pr\u00e9sentant des difficult\u00e9s d\'apprentissage (dyslexie, etc.). Bas\u00e9 sur '), t('Colorization.ch', { italics: true }), t(' de Pierre-Alain Etique (GPL-3.0).')]),
    p(t('La litt\u00e9rature scientifique francophone confirme l\'int\u00e9r\u00eat de ces adaptations :')),
    bullet([bold('Chenouna (2021)'), t(' \u2014 la colorisation syllabique et vocalique am\u00e9liore la vitesse et la pr\u00e9cision de lecture chez les \u00e9l\u00e8ves dyslexiques.')]),
    bullet([bold('Roullet, Auzimour, Cavalli & Gomez (2025)'), t(' \u2014 les adaptations graphiques individualis\u00e9es (colorisation, contraste entre lignes) am\u00e9liorent l\'accessibilit\u00e9.')]),
    bullet([bold('Krupa, Bard & Hamon (2023)'), t(' \u2014 interface FROG : les \u00e9l\u00e8ves appr\u00e9cient la colorisation des syllabes et le surlignage altern\u00e9 des lignes.')]),
    bullet([bold('Lassault & Ziegler (2018)'), t(' \u2014 revue des outils num\u00e9riques d\'aide \u00e0 la lecture.')]),
    bullet([bold('Gala et al. (2020)'), t(' \u2014 recommandations : espacement, interligne et couleur am\u00e9liorent la lisibilit\u00e9.')]),

    // Section 2
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('2. Adapt\u00e9 \u00e0 la phonologie belge')] }),
    p([t('En Belgique francophone, \u00ab\u00a0'), bold('o'), t('\u00a0\u00bb ne se prononce pas comme \u00ab\u00a0'), bold('eau'), t('\u00a0\u00bb ou \u00ab\u00a0'), bold('au'), t('\u00a0\u00bb (distinction absente en France standard).')]),
    bullet([t('Phonologie belge '), bold('native'), t(' gr\u00e2ce au syst\u00e8me de \u00ab\u00a0graph\u00e8mes li\u00e9s\u00a0\u00bb.')]),
    bullet([t('Chaque graphème peut \u00eatre '), bold('activ\u00e9/d\u00e9sactiv\u00e9'), t(' individuellement selon la le\u00e7on.')]),
    bullet([t('Basculement '), bold('BE \u2194 FR en 1\u00a0clic'), t(' via les pr\u00e9r\u00e9glages int\u00e9gr\u00e9s.')]),

    // Section 3
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('3. RGPD by design \u2014 Z\u00e9ro donn\u00e9e collect\u00e9e')] }),
    p([bold('Froidevaux, Ganascia & Kirchner (2024)'), t(' recommandent de traiter les donn\u00e9es p\u00e9dagogiques comme sensibles.')]),
    bullet([bold('Traitement 100\u00a0% local'), t(' \u2014 aucun texte ne quitte l\'ordinateur.')]),
    bullet([t('Z\u00e9ro appel r\u00e9seau, z\u00e9ro cookie, z\u00e9ro pistage, '), bold('aucun compte requis'), t('.')]),
    bullet([bold('Open source'), t(' (GPL-3.0) \u2014 enti\u00e8rement auditable.')]),
    bullet([t('OnlyOffice : solution '), bold('europ\u00e9enne'), t(', conforme RGPD, data centers neutres en carbone.')]),

    // Section 4: Comparison table
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('4. OnlyOffice : une alternative europ\u00e9enne')] }),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2400, 3313, 3313],
      rows: [
        tableRow([{ text: 'Caract\u00e9ristique', width: 2400 }, { text: 'Colorisation PLAI', width: 3313 }, { text: 'Colorization.ch (Word)', width: 3313 }], true),
        tableRow([{ text: 'Prix' }, { text: 'Gratuit', bold: true, color: '076E54' }, { text: 'Gratuit' }]),
        tableRow([{ text: 'Suite bureautique' }, { text: 'OnlyOffice (gratuit, open source)', bold: true, color: '076E54' }, { text: 'Microsoft Office (payant)' }]),
        tableRow([{ text: 'Donn\u00e9es envoy\u00e9es' }, { text: '\u2713 Aucune', bold: true, color: '16A34A' }, { text: 'Variable' }]),
        tableRow([{ text: 'Phonologie belge' }, { text: '\u2713 Native (1 clic)', bold: true, color: '16A34A' }, { text: 'Param\u00e9trage manuel' }]),
        tableRow([{ text: 'Compte requis' }, { text: '\u2713 Non', bold: true, color: '16A34A' }, { text: 'Compte Microsoft' }]),
      ]
    }),

    // RISS badge
    p([t('\u2705 R\u00e9f\u00e9rences scientifiques v\u00e9rifi\u00e9es dans le corpus RISS (522\u00a0627 articles francophones)', { size: 16, color: '076E54', italics: true })], { spacing: { before: 200 } }),
  ];

  return new Document({
    styles: baseStyles, numbering,
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1100, right: 1300, bottom: 1100, left: 1300 } } }, ...headerFooter('Pourquoi ?'), children }]
  });
}

// ════════════════════════════════════════════════════════════
//  DOCUMENT 2: Guide d'installation
// ════════════════════════════════════════════════════════════
function createInstallation() {
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
      t('Guide d\'installation \u2014 ', { size: 36, bold: true }),
      teal('Colorisation PLAI', { size: 36 }), t(' pour OnlyOffice', { size: 36, bold: true }),
    ] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } },
      children: [gray('P\u00d4LE LI\u00c9GEOIS D\'ACCOMPAGNEMENT VERS UNE \u00c9COLE INCLUSIVE')] }),

    // Pr\u00e9requis
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Pr\u00e9requis')] }),
    bullet(t('Windows 10 ou 11')),
    bullet(t('Connexion internet au moment de l\u2019installation, puis \u00e0 chaque fois que possible ensuite \u2014 le plugin charge son contenu en ligne et se met \u00e0 jour tout seul\u00a0; il reste utilisable hors ligne une fois qu\u2019il a pu se charger au moins une fois')),

    // \u00c9tape 1
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [teal('\u00c9tape 1 \u2014 ', { size: 32 }), t('T\u00e9l\u00e9charger OnlyOffice Desktop Editors')] }),
    p([t('OnlyOffice est une suite bureautique '), bold('gratuite, open source et europ\u00e9enne'), t('.')]),
    p([t('https://www.onlyoffice.com/fr/download-desktop.aspx', { color: TEAL })]),
    numbered(t('T\u00e9l\u00e9charger l\'installeur Windows (.exe)')),
    numbered(t('Lancer l\'installeur et suivre l\'assistant')),
    numbered(t('Ouvrir OnlyOffice pour v\u00e9rifier qu\'il fonctionne')),

    // \u00c9tape 2
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [teal('\u00c9tape 2 \u2014 ', { size: 32 }), t('R\u00e9cup\u00e9rer le fichier du plugin')] }),
    p([t('Le plugin est fourni par l\u2019\u00e9quipe PLAI sous la forme d\u2019un seul fichier\u00a0: '), bold('colorisation-plai.plugin')]),
    numbered(t('R\u00e9cup\u00e9rer ce fichier aupr\u00e8s de l\u2019\u00e9quipe PLAI (email, partage r\u00e9seau, cl\u00e9 USB\u2026)')),
    numbered(t('L\u2019enregistrer n\u2019importe o\u00f9 sur l\u2019ordinateur (Bureau ou T\u00e9l\u00e9chargements) \u2014 il ne doit pas \u00eatre d\u00e9compress\u00e9')),
    p([gray('Code source (r\u00e9f\u00e9rence technique, pas de t\u00e9l\u00e9chargement)\u00a0: github.com/jfb4plai/colorisation-plai-onlyoffice')], { spacing: { before: 80 } }),

    // \u00c9tape 3
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [teal('\u00c9tape 3 \u2014 ', { size: 32 }), t('Installer le plugin dans OnlyOffice')] }),
    numbered([t('Ouvrir OnlyOffice et ouvrir n\u2019importe quel document '), bold('Word (.docx)')]),
    numbered([t('Onglet '), bold('Modules compl\u00e9mentaires'), t(' \u2192 '), bold('Gestionnaire de Plugins')]),
    numbered([t('Cliquer sur '), bold('Installer le plugin manuellement'), t(' (en haut \u00e0 droite)')]),
    numbered([t('S\u00e9lectionner le fichier '), bold('colorisation-plai.plugin'), t(' puis '), bold('Ouvrir')]),
    p([teal('Une seule fois\u00a0: ', { size: 19 }), t('cette installation ne se fait qu\u2019une fois par ordinateur. Les mises \u00e0 jour arrivent ensuite automatiquement \u2014 voir l\u2019\u00e9tape 5.')],
      { shading: { fill: LIGHT_YELLOW, type: ShadingType.CLEAR } }),

    // \u00c9tape 4
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [teal('\u00c9tape 4 \u2014 ', { size: 32 }), t('V\u00e9rifier l\'installation')] }),
    numbered([t('Onglet '), bold('Modules compl\u00e9mentaires'), t(' \u2192 l\'ic\u00f4ne Colorisation PLAI doit appara\u00eetre (sur un document Word)')]),
    numbered(t('Cliquer dessus \u2192 le panneau s\'ouvre dans une fen\u00eatre')),
    numbered([t('Tester rapidement\u00a0: bouton '), bold('Coloriser les phon\u00e8mes'), t(' sur un texte')]),
    p([teal('Important\u00a0: ', { size: 19 }), t('ce premier chargement se fait en ligne \u2014 rester connect\u00e9 lors de ce premier essai. Une fois charg\u00e9 avec succ\u00e8s, le plugin reste utilisable hors connexion.')],
      { shading: { fill: LIGHT_YELLOW, type: ShadingType.CLEAR } }),

    // \u00c9tape 5
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [teal('\u00c9tape 5 \u2014 ', { size: 32 }), t('Mises \u00e0 jour automatiques')] }),
    p([t('Le plugin se met \u00e0 jour '), bold('tout seul'), t(', en arri\u00e8re-plan, sans rien r\u00e9installer\u00a0:')]),
    bullet(t('Connect\u00e9 \u00e0 internet, chaque ouverture du panneau v\u00e9rifie discr\u00e8tement s\u2019il existe une version plus r\u00e9cente')),
    bullet([t('Si oui, elle est t\u00e9l\u00e9charg\u00e9e en t\u00e2che de fond et prend effet \u00e0 la '), bold('prochaine'), t(' ouverture \u2014 jamais en interrompant un travail en cours')]),
    bullet(t('Sans connexion, le plugin continue de fonctionner avec la derni\u00e8re version d\u00e9j\u00e0 enregistr\u00e9e')),
    p([teal('En clair\u00a0: ', { size: 19 }), t('une fois cette installation faite, plus besoin de la refaire \u2014 sauf annonce contraire de l\u2019\u00e9quipe PLAI (changement majeur, nouvel ordinateur\u2026).')],
      { shading: { fill: LIGHT_YELLOW, type: ShadingType.CLEAR } }),

    // D\u00e9pannage
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('En cas de probl\u00e8me')] }),
    bullet([bold('\u00ab\u00a0Installer le plugin manuellement\u00a0\u00bb n\u2019appara\u00eet pas\u00a0?'), t(' \u2192 V\u00e9rifier la version d\u2019OnlyOffice (Aide \u2192 \u00c0 propos) et la mettre \u00e0 jour si besoin.')]),
    bullet([bold('Panneau vide ou erreur au premier lancement\u00a0?'), t(' \u2192 V\u00e9rifier la connexion internet, r\u00e9essayer une fois connect\u00e9.')]),
    bullet([bold('L\u2019ic\u00f4ne n\u2019appara\u00eet que sur certains documents\u00a0?'), t(' \u2192 Normal\u00a0: le plugin ne s\u2019active que sur les documents Word (.docx).')]),
    bullet([bold('Une mise \u00e0 jour ne semble jamais arriver\u00a0?'), t(' \u2192 Rouvrir le panneau avec une connexion internet active.')]),
    bullet([bold('Besoin d\'aide ?'), t(' \u2192 plai@provincedeliege.be')]),
  ];

  return new Document({
    styles: baseStyles, numbering,
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1100, right: 1300, bottom: 1100, left: 1300 } } }, ...headerFooter('Guide d\'installation'), children }]
  });
}

// ════════════════════════════════════════════════════════════
//  DOCUMENT 3: Mode d'emploi
// ════════════════════════════════════════════════════════════
function createModeEmploi() {
  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [
      t('Mode d\'emploi \u2014 Colorisation ', { size: 36, bold: true }), teal('PLAI', { size: 36 }), t(' pour OnlyOffice', { size: 36, bold: true }),
    ] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } },
      children: [gray('Plugin d\'aide \u00e0 la lecture pour les enseignants de la F\u00e9d\u00e9ration Wallonie-Bruxelles')] }),

    // Vue d'ensemble
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Vue d\'ensemble')] }),
    p([t('Le plugin s\'ouvre sous forme de '), bold('fen\u00eatre flottante'), t(' \u00e0 c\u00f4t\u00e9 de votre document :')]),
    bullet([t('Une '), bold('barre globale'), t(' toujours visible en haut (surlignage, d\u00e9coupe, nettoyage)')]),
    bullet([bold('4 onglets'), t(' : Phon\u00e8mes \u00b7 Syllabes \u00b7 Lettres \u00b7 Config')]),

    // Barre globale
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('La barre globale')] }),
    p(t('Toujours affich\u00e9e en haut, elle donne acc\u00e8s aux fonctions transversales :')),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2800, 6226],
      rows: [
        tableRow([{ text: 'Bouton', width: 2800 }, { text: 'Fonction', width: 6226 }], true),
        tableRow([{ text: '\u2630 1 ligne / 2' }, { text: 'Surligne un paragraphe sur deux. Couleur personnalisable.' }]),
        tableRow([{ text: '\u2702 1 phrase = 1 ligne' }, { text: 'D\u00e9coupe chaque paragraphe en une phrase par paragraphe.' }]),
        tableRow([{ text: '\u2715 (surlignage)' }, { text: 'Retire le surlignage (fond) sans toucher aux couleurs.' }]),
        tableRow([{ text: '\ud83d\uddd1 Couleurs' }, { text: 'Efface toutes les couleurs (texte + fond) du document.' }]),
      ]
    }),
    // Note limitation
    p([bold('\u26a0 Limitation API : ', { color: 'F9A825' }), t('le surlignage travaille par '), t('paragraphe', { italics: true }), t(' et non par ligne visuelle. Utilisez d\'abord \u00ab\u00a0\u2702 1 phrase = 1 ligne\u00a0\u00bb.')], { spacing: { before: 120 },
      shading: { fill: 'FFF8E1', type: ShadingType.CLEAR } }),

    // Onglet Phon\u00e8mes
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Onglet Phon\u00e8mes')] }),
    p(t('L\'onglet principal. Il colorise les sons du texte pour faciliter le d\u00e9codage.')),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Preset')] }),
    bullet([bold('CERAS ros\u00e9'), t(' (recommand\u00e9) \u2014 ne colorise que les sons complexes')]),
    bullet([bold('CERAS standard'), t(' \u2014 colorise tous les phon\u00e8mes')]),
    bullet([bold('Personnalis\u00e9'), t(' \u2014 vous choisissez chaque son')]),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Grille des sons')] }),
    p([t('Chaque son a une '), bold('case \u00e0 cocher'), t(' (activer/d\u00e9sactiver) et un '), bold('s\u00e9lecteur de couleur'), t('.')]),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Graph\u00e8mes li\u00e9s (\u25b8)')] }),
    p([t('Certains sons poss\u00e8dent plusieurs graph\u00e8mes. Cliquez '), bold('\u25b8'), t(' pour d\u00e9plier et activer/d\u00e9sactiver chaque graph\u00e8me.')]),
    // Tip box
    p([teal('Exemple Belgique : ', { size: 19 }), t('le son [o] regroupe \u00ab\u00a0o\u00a0\u00bb simple et \u00ab\u00a0eau/au\u00a0\u00bb. En mode BE, \u00ab\u00a0o\u00a0\u00bb simple est d\u00e9sactiv\u00e9 tandis que \u00ab\u00a0eau/au\u00a0\u00bb est activ\u00e9.')],
      { shading: { fill: LIGHT_TEAL, type: ShadingType.CLEAR } }),
    p([teal('Graphies distinctes an/in : ', { size: 19 }), t('pour les sons \u00ab\u00a0an\u00a0\u00bb et \u00ab\u00a0in\u00a0\u00bb, le panneau d\u00e9pli\u00e9 propose une orthographe par ligne (an, am, en, em \u2014 ou in, im, ain, ein, en apr\u00e8s i, yn/ym) au lieu d\u2019un seul phon\u00e8me global. Vous pouvez ainsi coloriser uniquement les mots en \u00ab\u00a0-an\u00a0\u00bb sans les mots en \u00ab\u00a0-en\u00a0\u00bb, par exemple pour un exercice cibl\u00e9 sur une seule graphie.')],
      { spacing: { before: 100 }, shading: { fill: LIGHT_TEAL, type: ShadingType.CLEAR } }),

    // Example
    p([t('L\''), t('oi', { color: '2196F3', bold: true }), t('seau b'), t('oi', { color: '2196F3', bold: true }), t('t de l\''),
      t('eau', { color: 'E06000', bold: true }), t(' d'), t('an', { color: '9C27B0', bold: true }), t('s '),
      t('un', { color: 'FF5722', bold: true }), t(' b'), t('o', { bold: true }), t('l.')],
      { spacing: { before: 100 }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR } }),
    p([gray('\u2191 \u00ab\u00a0eau\u00a0\u00bb color\u00e9 en orange, \u00ab\u00a0oi\u00a0\u00bb en bleu, \u00ab\u00a0an\u00a0\u00bb en violet, \u00ab\u00a0un\u00a0\u00bb en rouge \u2014 mais le \u00ab\u00a0o\u00a0\u00bb de \u00ab\u00a0bol\u00a0\u00bb reste en noir.')]),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Workflow recommand\u00e9')] }),
    numbered(t('Tapez ou collez votre texte.')),
    numbered(t('S\u00e9lectionnez la portion \u00e0 coloriser (ou rien pour tout le document).')),
    numbered(t('V\u00e9rifiez preset et r\u00e9gion dans l\'onglet Config.')),
    numbered([t('Cliquez '), bold('Coloriser les phon\u00e8mes'), t('.')]),

    // Page break
    new Paragraph({ children: [new PageBreak()] }),

    // Onglet Syllabes
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Onglet Syllabes')] }),
    p(t('Colorise les syllabes en alternance pour aider au d\u00e9coupage syllabique.')),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [3000, 6026],
      rows: [
        tableRow([{ text: 'R\u00e9glage', width: 3000 }, { text: 'Description', width: 6026 }], true),
        tableRow([{ text: 'Mode' }, { text: '\u00c9crit (orthographique) ou Oral (phonologique)' }]),
        tableRow([{ text: 'Couleurs' }, { text: '2, 3 ou 4 couleurs configurables' }]),
        tableRow([{ text: 'Monosyllabes' }, { text: 'Option : ignorer les mots d\'une syllabe' }]),
      ]
    }),
    p([t('Exemple : '), t('pa', { color: TEAL, bold: true }), t('pi', { color: '2196F3', bold: true }),
      t('llon', { color: TEAL, bold: true }), t(' \u2014 '),
      t('cho', { color: TEAL, bold: true }), t('co', { color: '2196F3', bold: true }),
      t('lat', { color: TEAL, bold: true }), t(' \u2014 '),
      t('\u00e9', { color: TEAL, bold: true }), t('l\u00e9', { color: '2196F3', bold: true }),
      t('phant', { color: TEAL, bold: true })],
      { spacing: { before: 100 }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR } }),

    // Onglet Lettres
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Onglet Lettres')] }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Lettres à discriminer')] }),
    p([t('Liste '), bold('éditable'), t(' : b/d/p/q par défaut (lettres miroir), mais vous pouvez retirer une lettre (croix ×) ou en ajouter d’autres avec leur propre couleur — par exemple v/f, t/d ou m/n — pour cibler la paire qui pose problème à un élève ou un groupe donné.')]),
    p([t('une '), t('b', { color: TEAL, bold: true }), t('alle et une '),
      t('d', { color: '2196F3', bold: true }), t('anse, un '),
      t('p', { color: '4CAF50', bold: true }), t('ont et une '),
      t('q', { color: 'FF9800', bold: true }), t('uestion')],
      { shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR } }),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('Voyelles / Consonnes')] }),
    p(t('Colorise voyelles et consonnes en deux couleurs.')),

    // Onglet Config
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Onglet Config')] }),
    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('R\u00e9gion : Belgique (FWB) / France')] }),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2000, 3513, 3513],
      rows: [
        tableRow([{ text: '', width: 2000 }, { text: 'Belgique (FWB)', width: 3513 }, { text: 'France', width: 3513 }], true),
        tableRow([{ text: 'o / eau' }, { text: 'Sons diff\u00e9rents' }, { text: 'M\u00eame son' }]),
        tableRow([{ text: 'w' }, { text: 'Prononc\u00e9 [w]' }, { text: 'Parfois [v]' }]),
      ]
    }),

    new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t('R\u00e8gle \u00ab\u00a0ill\u00a0\u00bb / Profils')] }),
    bullet([bold('CERAS'), t(' : \u00ab\u00a0ill\u00a0\u00bb = un seul son. '), bold('LireCouleur'), t(' : \u00ab\u00a0ill\u00a0\u00bb = i + j.')]),
    bullet([t('Sauvegardez, chargez ou exportez votre configuration personnalis\u00e9e.')]),

    // Conseils
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t('Conseils p\u00e9dagogiques')] }),
    bullet([bold('Commencez avec CERAS ros\u00e9'), t(' \u2014 il ne colorise que les sons complexes.')]),
    bullet([bold('Activez les sons progressivement'), t(' au fil des le\u00e7ons.')]),
    bullet([bold('En Belgique'), t(', laissez \u00ab\u00a0o\u00a0\u00bb simple d\u00e9sactiv\u00e9 (r\u00e9glage par d\u00e9faut).')]),
    bullet([bold('Pour la rem\u00e9diation'), t(' : s\u00e9lectionnez uniquement le passage difficile.')]),
    bullet([bold('Combinez les outils'), t(' : surlignage + colorisation pour les lecteurs les plus en difficult\u00e9.')]),
    bullet([t('Utilisez '), bold('\u2702 1 phrase = 1 ligne'), t(' avant le surlignage pour un r\u00e9sultat optimal.')]),
  ];

  return new Document({
    styles: baseStyles, numbering,
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1100, right: 1300, bottom: 1100, left: 1300 } } }, ...headerFooter('Mode d\'emploi'), children }]
  });
}

// ════════════════════════════════════════════════════════════
//  Generate all 3
// ════════════════════════════════════════════════════════════
const docsDir = dirname(fileURLToPath(import.meta.url));

const docs = [
  { name: 'pourquoi-colorisation-plai', fn: createPourquoi },
  { name: 'guide-installation', fn: createInstallation },
  { name: 'mode-emploi', fn: createModeEmploi },
];

for (const doc of docs) {
  const d = doc.fn();
  const buffer = await Packer.toBuffer(d);
  const path = `${docsDir}/${doc.name}.docx`;
  writeFileSync(path, buffer);
  console.log(`✅ ${doc.name}.docx (${Math.round(buffer.length / 1024)} Ko)`);
}
console.log('Done!');
