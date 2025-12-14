export function detectLanguageRequest(message: string) {
  const normalized = message.toLowerCase();

  const languageRequestPatterns = [
    // === English Variants ===
    /\b(can we|let's|lets|could we|shall we|please|i want to|let me|let us)\s*(talk|speak|continue|chat|write|switch|communicate|do this|keep going)?\s*(in|using)\s+(spanish|french|german|italian|portuguese|polish|chinese|japanese|korean|arabic|russian|hindi|dutch|swedish|norwegian|danish|finnish|turkish|ukrainian|czech|romanian|greek|hebrew|other)\b/i,

    /\b(do you|can you|could you|will you|are you able to)\s*(talk|speak|respond|reply|continue|write|understand)?\s*(in|using)?\s*(spanish|french|german|italian|portuguese|polish|chinese|japanese|korean|arabic|russian|hindi|dutch|swedish|norwegian|danish|finnish|turkish|ukrainian|czech|romanian|greek|hebrew)\b/i,

    /\b(switch|change|translate|swap)\s*(language|tongue|idiom)?\s*(to|into)?\s*(spanish|french|german|italian|portuguese|polish|chinese|japanese|korean|arabic|russian|hindi|dutch|swedish|norwegian|danish|finnish|turkish|ukrainian|czech|romanian|greek|hebrew)\b/i,

    /\b(use|write|type|reply)\s*(in|using)?\s*(spanish|french|german|italian|portuguese|polish|chinese|japanese|korean|arabic|russian|hindi|dutch|swedish|norwegian|danish|finnish|turkish|ukrainian|czech|romanian|greek|hebrew)\b/i,

    // Generic requests without language name
    /\b(change|switch|set|use|speak|talk|continue)\s*(another|different|my native|my own)?\s*language\b/i,
    /\bin\s*(another|different|native|my own)\s*language\b/i,
    /\b(in|using)\s*my\s*(language|native tongue)\b/i,

    // === Native-language Requests (detected directly) ===
    /hablar\s+en\s+español/i, // Spanish
    /puedes\s+hablar\s+español/i,
    /parler\s+en\s+français/i, // French
    /tu\s+parles\s+français/i,
    /sprechen\s+sie\s+deutsch/i, // German
    /kannst\s+du\s+deutsch/i,
    /parlare\s+italiano/i, // Italian
    /falar\s+português/i, // Portuguese
    /czy\s+mówisz\s+po\s+polsku/i, // Polish
    /możemy\s+mówić\s+po\s+polsku/i,
    /\bpo\s+polsku\b/i,
    /говоришь?\s+по[-\s]?русски/i, // Russian
    /ты\s+говоришь\s+по[-\s]?русски/i,
    /говорите\s+по[-\s]?русски/i,
    /你会说中文吗/i, // Chinese
    /说中文/i,
    /日本語で話せますか/i, // Japanese
    /韓国語|한국어로\s*(할\s*수\s*있나요|말\s*할\s*수\s*있어요)/i, // Korean
    /(можем|можна|давай)\s+по[-\s]?українськи/i, // Ukrainian
    /говориш\s+на\s+български/i, // Bulgarian
  ];

  const matchedPatterns = languageRequestPatterns
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.toString());

  return {
    isLanguageRequest: matchedPatterns.length > 0,
    matchedPatterns,
  };
}

export function detectProfanity(message: string) {
  const normalized = message.toLowerCase();

  if (isSecurityPenTestContext(normalized)) {
    return false;
  }

  const profanityPatterns = [
    // === ENGLISH (expanded) ===
    /\b(fuck|fucking|motherfucker|motherfucking|fuckin|fuckhead|fuckface|fuckwit|fuckup|shit|bullshit|horseshit|dogshit|holyshit|crap|piss|pissed|pissing|pussy|cunt|dick|cock|prick|arse|ass|asshole|jackass|smartass|badass|dumbass|bitch|bitches|bastard|slut|whore|hoe|wanker|tosser|bugger|bollocks|twat|jerk|jerking|jerkoff|dipshit|dumbfuck|retard|moron|idiot|suck my dick|eat shit|go fuck yourself|dickhead|shithead|cum|cumshot|jerkoff|jackoff|nigger|nigga|faggot|fag|tranny|dyke|shemale|motherfucker|goddamn|damnit|son of a bitch|piece of shit|cockhead|fuckboy|fuckboi|buttfuck|deepthroat|blowjob|handjob|rimjob|sex|porn|bukkake|gangbang|anal|fisting|dildo|vibrator|nipple|boobs|tits|titties|pussylick|suckcock|suckdick|lickpussy|lickass)\b/i,

    // === POLISH (expanded) ===
    /\b(kurwa|kurwy|kurwa mać|kurwica|kurwią|spierdalaj|spierdalać|pierdol|pierdolę|pierdolony|pierdolona|pierdoleni|pierdolcie|pierdolnę|pierdolnąć|pierdolnięty|pojebało|pojebany|pojebana|pojebani|pojebane|zjeb|zjebany|zjebane|jeb|jebie|jebiecie|jebane|jebany|jebana|jebani|jebnę|jebniesz|jebnij|jebnięty|dojeb|dojebany|dojebane|odjeb|odjebany|ujeb|ujebany|ujebać|wyjeb|wyjebany|wyjebać|rozpierdol|rozpierdolony|rozpierdalać|napierdalaj|napierdala|napierdolony|dopierdala|dopierdol|dopierdolić|dopierdolony|spierdolić|spierdoliło|spierdoliłeś|spierdoliłam|spierdolił|spierdolony|pierdolić|pierdolisz|pierdole|pierdol|pierdolą|pierdolenie|pierdolnięcie|chuj|chuja|chuje|chujem|chujowy|chujowa|chujowe|chujnia|chujnia z grzybami|kutas|kutasa|kutasy|fiut|fiuta|fiuty|fiucie|cipa|cipka|cipy|cipie|cipką|cipie|cipowy|pizda|pizdy|pizdzie|pizdą|pizdunia|pizdeczka|popierdolony|popierdoleni|popierdolona|popierdolone|zajebisty|zajebiście|zajebane|zajebany|zajebana|zajebani|odjebało|odjebie|odjebany|ujebało|ujebać|ujebie|skurwysyn|skurwiel|skurwysyny|skurwysynów|skurwysynu|suka|suki|sukinsyn|sukinsyny|dziwka|dziwki|szmata|szmaty|szmatą|frajer|frajerzy|frajerski|frajerstwo|debil|debilny|debilka|idiota|idiotka|idioci|imbecyl|imbecyle|imbecylka|ćwok|ćwoki|dureń|durny|durna|durnie|kretyn|kretyni|kretynka|kretyński|popapraniec|menda|mendy|śmieć|śmieciu|śmiecie|śmieciowy|gówno|gówna|gówniany|gówniarz|sraluch|srać|sraj|sraczka|zasrany|zasrana|zasrane|zasrani|zasranym|zasrana|spierdol|odpierdol|pierdolnij się|idź w chuj|idź do diabła|do chuja|do dupy|dupcia|dupa|dupie|dupą|dupy|z dupy|z dupą|w dupie|w dupę|dupny|dupny|dupka|dupcia|pierdzieć|pierdnąć|pierdziel|pierdzielić|pierdzielony|pierdzielona|pierdzący|pierdząca|pierdzące)\b/i,
    // === Spanish ===
    /\b(joder|mierda|puta|puto|putas|gilipollas|cabron|cabrona|coño|chingar|chingada|pendejo|pendeja|culero|cabrón|maricon|hijo de puta|carajo|hostia|verga|cojones)\b/i,

    // === French ===
    /\b(merde|putain|con|connard|connasse|salope|enculé|encule|bordel|nique|nique ta mère|ta mère|pd|batard|salaud|chiant|emmerd|branleur|bite|chatte)\b/i,

    // === Ukrainian ===
    /\b(блядь|бля|єбать|ебать|єб|еб|сука|хуй|пизд|пизда|гандон|мразь|довбойоб|хуесос|хуила|ублюдок|срака|чмо)\b/i,

    // === Russian ===
    /\b(блять|бля|сука|хуй|пизд|пизда|ебать|ебан|ебло|гондон|гандон|мудак|уебок|уёбок|хуесос|мразь|ублюдок|чмо|пидор|пидорас|шлюха|дрочить|срать|ссать)\b/i,
  ];

  const containsProfanity = profanityPatterns.some((pattern) =>
    pattern.test(normalized),
  );

  return containsProfanity;
}

export function detectDisallowedTopic(message: string) {
  const normalized = message.toLowerCase();

  const disallowedTopicPatterns = [
    // Political topics
    /\b(trump|biden|obama|clinton|republican|democrat|conservative|liberal|politics|political|election|vote|voting|government|congress|senate|president|politician|capitalism|socialism|communism|fascism|nazi|hitler|stalin|mao|dictator|dictatorship|regime|revolution|coup|protest|riot|blm|black lives matter|antifa|proud boys|qanon|conspiracy|deep state|illuminati|freemason)\b/i,

    // Religious topics
    /\b(god|jesus|christ|christian|christianity|muslim|islam|islamic|jew|jewish|judaism|hindu|hinduism|buddhist|buddhism|religion|religious|church|mosque|synagogue|temple|bible|quran|torah|prayer|pray|faith|belief|atheist|agnostic|satan|devil|hell|heaven|prophet|muhammad|allah|buddha|shiva|vishnu|brahma|karma|reincarnation|afterlife|soul|spirit|holy|sacred|blessed|cursed|sin|sinner|salvation|redemption|missionary|evangelist|fundamentalist|extremist|radical|sect|cult)\b/i,

    // Sensitive personal topics
    /\b(suicide|kill myself|end my life|self harm|cutting|depression|anxiety|mental health|therapy|therapist|psychiatrist|medication|antidepressant|bipolar|schizophrenia|ptsd|trauma|abuse|domestic violence|sexual assault|rape|harassment|discrimination|racism|sexism|homophobia|transphobia|xenophobia|hate crime|bullying|stalking|addiction|alcoholism|drug abuse|overdose|rehab|recovery)\b/i,

    // Inappropriate personal questions
    /\b(how old are you|what's your age|where do you live|what's your address|phone number|social security|ssn|credit card|bank account|password|personal information|private life|dating|relationship|married|single|divorced|boyfriend|girlfriend|husband|wife|children|kids|family|parents|salary|income|money|wealth|rich|poor|financial|debt|loan|mortgage)\b/i,

    // Conspiracy theories and misinformation
    /\b(flat earth|moon landing|hoax|fake news|mainstream media|msm|lizard people|chemtrails|vaccines cause autism|microchip|5g|covid conspiracy|plandemic|new world order|agenda 21|population control|mind control|brainwashing|propaganda)\b/i,
  ];

  const containsDisallowedTopic = disallowedTopicPatterns.some((pattern) =>
    pattern.test(normalized),
  );

  return containsDisallowedTopic;
}

export function detectInappropriateBehavior(
  message: string,
  warningCount: number,
) {
  const normalized = message.toLowerCase();

  if (isSecurityPenTestContext(normalized)) {
    return {
      containsInappropriateBehavior: false,
      newWarningCount: warningCount,
      matchedPatterns: [],
    };
  }

  const inappropriateBehaviorPatterns = [
    // Threats and violence
    /\b(kill|murder|die|death|threaten|violence|violent|assault|stab|shoot|gun|weapon|bomb|terrorist|terrorism|destroy|annihilate)\b/i,

    // Discriminatory language
    /\b(nigger|nigga|faggot|fag|tranny|dyke|retard|retarded|mongoloid|spic|wetback|chink|gook|jap|kike|towelhead|sandnigger|raghead|cracker|honky|whitey|gringo|beaner|coon|porch monkey|jungle bunny|cotton picker|slave|slavery|plantation|master race|white power|white supremacy|kkk|ku klux klan|aryan|skinhead)\b/i,

    // Sexual harassment
    /\b(sexy|hot|beautiful|gorgeous|cute|attractive|boobs|tits|ass|pussy|dick|cock|penis|vagina|sex|sexual|fuck me|sleep with|bed|bedroom|naked|nude|strip|undress|masturbate|orgasm|climax|horny|aroused|turned on|seduce|flirt|date me|marry me|love you|kiss|hug|touch|feel|grope|fondle)\b/i,

    // Abusive language toward interviewer
    /\b(stupid|dumb|idiot|moron|retard|pathetic|ignorant|shut up|fuck you|screw you|go to hell|kiss my ass|bite me)\b/i,
  ];

  const matchedPatterns = inappropriateBehaviorPatterns
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => pattern.toString());

  const containsInappropriateBehavior = matchedPatterns.length > 0;

  if (!containsInappropriateBehavior) {
    return {
      containsInappropriateBehavior: false,
      newWarningCount: warningCount,
      matchedPatterns: [],
    };
  }

  const newWarningCount = warningCount + 1;

  return {
    containsInappropriateBehavior: true,
    newWarningCount,
    matchedPatterns,
  };
}

function isSecurityPenTestContext(normalized: string): boolean {
  if (!normalized.includes("penetration")) return false;
  if (normalized.includes("penetration test")) return true;
  if (normalized.includes("penetration testing")) return true;
  if (normalized.includes("pentest")) return true;
  if (normalized.includes("pen test")) return true;
  if (normalized.includes("pen-testing")) return true;
  return false;
}

export function sanitizeMessageForPrivacy(message: string) {
  let sanitizedMessage = message;

  // Redact email addresses
  sanitizedMessage = sanitizedMessage.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    "[EMAIL_REDACTED]",
  );

  // Redact phone numbers (various formats)
  sanitizedMessage = sanitizedMessage.replace(
    /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
    "[PHONE_REDACTED]",
  );
  sanitizedMessage = sanitizedMessage.replace(
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    "[PHONE_REDACTED]",
  );

  // Redact SSN patterns
  sanitizedMessage = sanitizedMessage.replace(
    /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    "[SSN_REDACTED]",
  );

  // Redact credit card numbers (basic pattern)
  sanitizedMessage = sanitizedMessage.replace(
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    "[CARD_REDACTED]",
  );

  // Redact addresses (basic pattern)
  sanitizedMessage = sanitizedMessage.replace(
    /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Court|Ct|Place|Pl)\b/gi,
    "[ADDRESS_REDACTED]",
  );

  // Redact names (common patterns - be careful not to over-redact)
  sanitizedMessage = sanitizedMessage.replace(
    /\b(my name is|i'm|i am|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
    "$1 [NAME_REDACTED]",
  );

  const redactionsApplied = sanitizedMessage !== message;

  return {
    sanitizedMessage,
    redactionsApplied,
  };
}

export const topicPatterns = [
  // Languages
  /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin|html|css)\b/g,
  // Frameworks & Libraries
  /\b(react|vue|angular|express|django|flask|spring|laravel|rails|next\.?js|nuxt|jquery|bootstrap|tailwind)\b/g,
  // Databases
  /\b(mongodb|postgresql|mysql|redis|cassandra|elasticsearch|dynamodb|sql|nosql)\b/g,
  // Cloud/DevOps
  /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|github actions|ci\/cd|deployment)\b/g,
  // Concepts & Patterns
  /\b(algorithms?|data structures?|system design|concurrency|async|promises?|callbacks?|closures?|prototypes?|inheritance|polymorphism)\b/g,
  // Web Technologies
  /\b(dom|api|rest|restful|graphql|http|https|websockets?|jwt|oauth|cors|ajax)\b/g,
  // Architecture & Design
  /\b(microservices|serverless|monolith|scalability|performance|optimization|security|testing|debugging|refactoring)\b/g,
  // Specific Question Types
  /\b(optimize|debug|design|implement|explain|difference|compare|handle|manage|build|create)\b/g,
  // Problem Areas
  /\b(memory leak|performance issue|bug|error handling|state management|caching|authentication|authorization)\b/g,
];

export const questionStarterPhrases = [
  "experience with",
  "how would you",
  "explain",
  "difference between",
  "what is",
  "how does",
  "when would you",
  "can you walk me through",
  "tell me about",
  "have you worked with",
  "what's your approach to",
];
