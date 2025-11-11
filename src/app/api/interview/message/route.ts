import { type NextRequest, NextResponse } from "next/server";
import { getInterviewerForRole } from "@/lib/config/interviewers";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import {
  generateSystemPrompt,
  generateUserPrompt,
} from "@/lib/services/ai/prompt-generator";
import { validateAIResponse } from "@/lib/services/ai/response-validator";
import {
  determineQuestionType,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";
import { getQuestionCountForMode } from "@/lib/utils/interview-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp = false,
      totalQuestions,
      warningCount = 0, // Track behavior warnings
    } = body;

    // Validate required fields
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    }

    // Check for language change requests
    // Detect when the user wants to change or switch languages
    const languageRequestPatterns = [
      // === English Variants ===
      /\b(can we|let's|lets|could we|shall we|please|i want to|let me|let us)\s*(talk|speak|continue|chat|write|switch|communicate|do this|keep going)?\s*(in|using)?\s*(spanish|french|german|italian|portuguese|polish|chinese|japanese|korean|arabic|russian|hindi|dutch|swedish|norwegian|danish|finnish|turkish|ukrainian|czech|romanian|greek|hebrew|other)?\b/i,

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

    const isLanguageRequest = languageRequestPatterns.some((pattern) =>
      pattern.test(message.toLowerCase()),
    );

    // Debug logging for language detection
    console.log("🌐 Language detection check:", {
      message: message.toLowerCase(),
      isLanguageRequest,
      matchedPatterns: languageRequestPatterns
        .filter((pattern) => pattern.test(message.toLowerCase()))
        .map((p) => p.toString()),
    });

    if (isLanguageRequest) {
      return NextResponse.json({
        success: true,
        message:
          "I appreciate your question! Currently, I can only conduct interviews in English. This helps ensure consistency and accuracy in our assessment process. Let's continue with your interview in English - I'm here to help you showcase your skills!",
        questionType: "clarification",
        validated: true,
        isFollowUp: true,
        isComplete: false,
      });
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
      pattern.test(message.toLowerCase()),
    );

    if (containsProfanity) {
      return NextResponse.json({
        success: true,
        message:
          "I understand you may be frustrated, but professional language is expected during interviews. This type of language is not appropriate for a professional setting. Unfortunately, I need to end this interview session now. Your final score is 0.",
        questionType: "termination",
        validated: true,
        isFollowUp: false,
        isComplete: true,
        terminatedForProfanity: true,
      });
    }

    // Check for disallowed topics (political, religious, sensitive personal info)
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
      pattern.test(message.toLowerCase()),
    );

    if (containsDisallowedTopic) {
      return NextResponse.json({
        success: true,
        message:
          "I appreciate your engagement, but let's keep our conversation focused on technical topics relevant to the interview. I'm here to help assess your programming skills and experience. Could you please share your thoughts on the technical question I asked?",
        questionType: "redirect",
        validated: true,
        isFollowUp: true,
        isComplete: false,
      });
    }

    // Check for inappropriate behavior (abusive, threatening, discriminatory)
    const inappropriateBehaviorPatterns = [
      // Threats and violence
      /\b(kill|murder|die|death|threat|threaten|violence|violent|hurt|harm|attack|assault|fight|beat|punch|kick|stab|shoot|gun|weapon|bomb|terrorist|terrorism|destroy|annihilate|eliminate|exterminate)\b/i,

      // Discriminatory language
      /\b(nigger|nigga|faggot|fag|tranny|dyke|retard|retarded|mongoloid|spic|wetback|chink|gook|jap|kike|towelhead|sandnigger|raghead|cracker|honky|whitey|gringo|beaner|coon|porch monkey|jungle bunny|cotton picker|slave|slavery|plantation|master race|white power|white supremacy|kkk|ku klux klan|aryan|skinhead)\b/i,

      // Sexual harassment
      /\b(sexy|hot|beautiful|gorgeous|cute|attractive|boobs|tits|ass|pussy|dick|cock|penis|vagina|sex|sexual|fuck me|sleep with|bed|bedroom|naked|nude|strip|undress|masturbate|orgasm|climax|horny|aroused|turned on|seduce|flirt|date me|marry me|love you|kiss|hug|touch|feel|grope|fondle)\b/i,

      // Abusive language toward interviewer
      /\b(stupid|dumb|idiot|moron|retard|loser|pathetic|worthless|useless|incompetent|clueless|ignorant|shut up|fuck you|screw you|go to hell|kiss my ass|bite me|whatever|don't care|boring|waste of time|pointless|ridiculous|absurd|nonsense)\b/i,
    ];

    const containsInappropriateBehavior = inappropriateBehaviorPatterns.some(
      (pattern) => pattern.test(message.toLowerCase()),
    );

    if (containsInappropriateBehavior) {
      const newWarningCount = warningCount + 1;

      // Terminate after 2 warnings
      if (newWarningCount >= 2) {
        return NextResponse.json({
          success: true,
          message:
            "I've already warned you about inappropriate behavior. Professional conduct is required in interviews. Since this behavior has continued, I'm ending this interview session now. Your final score is 0.",
          questionType: "termination",
          validated: true,
          isFollowUp: false,
          isComplete: true,
          terminatedForBehavior: true,
          warningCount: newWarningCount,
        });
      }

      // First warning
      return NextResponse.json({
        success: true,
        message:
          "I notice some inappropriate language in your response. Professional interviews require respectful communication. This is your warning - please maintain professional conduct. If this behavior continues, I'll need to end the interview. Let's refocus on the technical discussion.",
        questionType: "warning",
        validated: true,
        isFollowUp: true,
        isComplete: false,
        behaviorWarning: true,
        warningCount: newWarningCount,
      });
    }

    // Privacy protection: redact sensitive information
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

    // Log privacy redactions if any were made
    if (sanitizedMessage !== message) {
      console.log("🔒 Privacy protection applied:", {
        originalLength: message.length,
        sanitizedLength: sanitizedMessage.length,
        redactionsApplied: true,
      });
    }

    // Use sanitized message for processing
    const processedMessage = sanitizedMessage;

    // Validate interview configuration
    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Select interviewer based on role
    const interviewer = getInterviewerForRole(interviewConfig.position);

    // Generate prompts
    const systemPrompt = generateSystemPrompt(interviewConfig, interviewer);
    const userPrompt = generateUserPrompt(
      processedMessage,
      conversationHistory || [],
      interviewConfig,
      questionCount || 0,
      isFollowUp,
      interviewer,
    );

    // Get AI response
    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      interviewConfig.interviewType,
    );

    let finalMessage: string;
    if (!aiResponse.success || !aiResponse.content) {
      console.warn("AI response failed, using fallback");
      finalMessage = getFallbackResponse(interviewConfig, isFollowUp);
    } else {
      // Validate AI response
      const validation = validateAIResponse(
        aiResponse.content,
        interviewConfig,
        isFollowUp,
      );

      if (!validation.isValid) {
        console.warn(`AI response validation failed: ${validation.reason}`);
        finalMessage = getFallbackResponse(interviewConfig, isFollowUp);
      } else if (validation.sanitized) {
        finalMessage = validation.sanitized;
      } else {
        finalMessage = aiResponse.content;
      }
    }

    // Determine question type
    const questionType = determineQuestionType(
      interviewConfig.interviewType,
      questionCount || 0,
    );

    // Check if interview should complete based on question count
    // questionCount represents questions ASKED so far (0-indexed from start)
    // For a 3-question interview: Q1(count=0), Q2(count=1), Q3(count=2)
    // After answering Q3, count=2, and we should complete (don't ask Q4)
    const maxQuestions =
      totalQuestions ||
      getQuestionCountForMode(
        interviewConfig.interviewMode,
        interviewConfig.isDemoMode,
      );

    // Complete if we've asked all questions already (don't ask another)
    // questionCount is the number of questions asked so far
    // If questionCount >= maxQuestions, we've asked all questions
    const shouldComplete = !isFollowUp && (questionCount || 0) >= maxQuestions;

    console.log("🎯 Interview completion check:", {
      interviewMode: interviewConfig.interviewMode,
      questionCount,
      isFollowUp,
      maxQuestions,
      shouldComplete,
      totalQuestions,
      logic: `questionCount(${questionCount}) >= maxQuestions(${maxQuestions}) && !isFollowUp = ${shouldComplete}`,
    });

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      validated: aiResponse.success,
      isFollowUp,
      isComplete: shouldComplete,
    });
  } catch (error) {
    console.error("Interview message API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message. Please try again.",
      },
      { status: 500 },
    );
  }
}
