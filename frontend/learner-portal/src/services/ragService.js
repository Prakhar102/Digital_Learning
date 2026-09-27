import { getAllCourses, getCourseDetails } from "./courseService.js";
import { getLearnerRagContext } from "./learnerRagContext.js";
import { getCurrentUser } from "./userService.js";

const DOMAIN_METADATA = [
  { id: "course-materials", title: "Course Materials", description: "Course, module, and lesson content currently available in the LMS." },
];

let knowledgeCache = Object.fromEntries(DOMAIN_METADATA.map(({ id }) => [id, []]));
let lastSyncAt = null;

const asArray = (value) => (Array.isArray(value) ? value : []);
const textValue = (...values) => values.find((value) => typeof value === "string" && value.trim())?.trim() || "";

export const syncLiveKnowledgeFromBackend = async () => {
  const courses = asArray(await getAllCourses());
  const courseDetails = await Promise.all(courses.map(async (course) => {
    try {
      return await getCourseDetails(course.id);
    } catch {
      return course;
    }
  }));

  const documents = [];
  courseDetails.forEach((course) => {
    const courseTitle = textValue(course.title) || `Course #${course.id}`;
    const courseDescription = textValue(course.description, course.summary, course.content);
    const category = typeof course.category === "string" ? course.category : course.category?.name;

    if (courseDescription) {
      documents.push({
        id: `course-${course.id}`,
        title: courseTitle,
        category: category || "Course",
        courseId: course.id,
        source: `LMS course catalog · ${courseTitle}`,
        content: courseDescription,
        tags: [category, course.level].filter(Boolean),
        lastUpdated: course.updatedAt || course.createdAt || null,
        domain: "course-materials",
      });
    }

    asArray(course.modules).forEach((module) => {
      const moduleTitle = textValue(module.title, module.name);
      const moduleContent = textValue(module.description, module.summary, module.content, module.notes);
      if (moduleTitle || moduleContent) {
        documents.push({
          id: `module-${module.id}`,
          title: moduleTitle || `Module in ${courseTitle}`,
          category: category || "Course Module",
          courseId: course.id,
          source: `LMS course content · ${courseTitle}`,
          content: [moduleTitle, moduleContent].filter(Boolean).join("\n\n"),
          tags: [category, courseTitle].filter(Boolean),
          lastUpdated: module.updatedAt || module.createdAt || null,
          domain: "course-materials",
        });
      }

      asArray(module.lessons).forEach((lesson) => {
        const lessonTitle = textValue(lesson.title, lesson.name);
        const lessonContent = textValue(lesson.description, lesson.summary, lesson.content, lesson.notes, lesson.transcript);
        if (!lessonTitle && !lessonContent) return;
        documents.push({
          id: `lesson-${lesson.id}`,
          title: lessonTitle || `Lesson in ${moduleTitle || courseTitle}`,
          category: category || "Course Lesson",
          courseId: course.id,
          source: `LMS lesson · ${courseTitle}${moduleTitle ? ` · ${moduleTitle}` : ""}`,
          content: [lessonTitle, lessonContent].filter(Boolean).join("\n\n"),
          tags: [category, courseTitle, moduleTitle].filter(Boolean),
          lastUpdated: lesson.updatedAt || lesson.createdAt || null,
          domain: "course-materials",
        });
      });
    });
  });

  knowledgeCache = Object.fromEntries(DOMAIN_METADATA.map(({ id }) => [
    id,
    id === "course-materials" ? documents : [],
  ]));
  lastSyncAt = new Date().toISOString();
  return documents;
};

export const searchKnowledgeBase = async ({ query, domain = "all", courseId = null, limit = 6 }) => {
  const documents = await syncLiveKnowledgeFromBackend();
  const queryTerms = String(query || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 1);
  if (!queryTerms.length) return [];

  const candidates = documents.filter((document) =>
    (domain === "all" || document.domain === domain)
    && (!courseId || String(document.courseId) === String(courseId))
  );

  return candidates.map((document) => {
    const searchableText = `${document.title} ${document.content} ${document.tags.join(" ")} ${document.category}`.toLowerCase();
    const matchedTerms = queryTerms.filter((term) => searchableText.includes(term));
    const score = matchedTerms.reduce((total, term) => {
      const titleBoost = document.title.toLowerCase().includes(term) ? 3 : 0;
      const tagBoost = document.tags.some((tag) => tag.toLowerCase().includes(term)) ? 2 : 0;
      return total + 1 + titleBoost + tagBoost;
    }, 0);
    const excerpt = document.content.split(/(?<=[.!?])\s+/).find((sentence) =>
      queryTerms.some((term) => sentence.toLowerCase().includes(term))
    ) || document.content.slice(0, 320);

    return {
      ...document,
      searchScore: score,
      matchedTermCount: matchedTerms.length,
      matchedExcerpt: excerpt,
      citation: `${document.title} (${document.source})`,
    };
  }).filter((document) => document.matchedTermCount > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, limit);
};

export const getKnowledgeByDomain = (domainKey) => knowledgeCache[domainKey] || [];

export const getAllKnowledgeDomains = () => DOMAIN_METADATA.map((domain) => ({
  ...domain,
  count: knowledgeCache[domain.id]?.length || 0,
}));

const personalQuery = (query) => {
  const normalized = String(query || "").toLowerCase();
  return /\b(my|mine|me|i|i'm|i am|myself|mera|meri|mere|mujhe|maine|main|mai|apna|apni|apne|kitne|kitni|kitna|hu|hoon|hun)\b/.test(normalized)
    || normalized.includes("my ")
    || normalized.includes("about me");
};

const getPersonalAnswer = (query, context) => {
  const normalized = query.toLowerCase();
  if (!personalQuery(normalized)) return null;

  const requested = [];
  if (/\b(name|email|profile|who am i|naam|kaun)\b/.test(normalized)) requested.push("Your Profile");
  if (/\b(course|courses|enroll|enrolled|ongoing|completed|complete|progress|padh)\b/.test(normalized)) requested.push("Your Courses");
  if (/\b(certificate|certificates|certification|certifications)\b/.test(normalized)) requested.push("Your Certificates");
  if (/\b(assessment|assessments|quiz|quizzes|test|tests|pass|passed|fail|failed|score|attempt|attempts|exam|exams)\b/.test(normalized)) requested.push("Your Assessment Attempts");
  if (/\b(assignment|assignments|due|submission|submissions|homework)\b/.test(normalized)) requested.push("Your Course Assignments");

  const selected = requested.length
    ? context.sources.filter((item) => requested.includes(item.title))
    : context.sources;
  const totals = context.totals;
  const countSummary = requested.includes("Your Courses")
    ? `Courses: ${totals.enrolledCourses} enrolled, ${totals.completedCourses} completed, ${totals.ongoingCourses} ongoing.`
    : requested.includes("Your Assessment Attempts")
      ? `Assessment attempts: ${totals.assessmentAttempts} total, ${totals.passedAssessments} passed, ${totals.failedAssessments} failed.`
      : requested.includes("Your Certificates")
        ? `Certificates: ${totals.certificates}.`
        : requested.includes("Your Course Assignments")
          ? `Assignments across your enrolled courses: ${totals.assignments}.`
          : "";
  return {
    answer: [countSummary, ...selected.map((item) => `**${item.title}**\n${item.content}`)].filter(Boolean).join("\n\n"),
    sources: selected,
  };
};

export const askRAGMentor = async ({ query, courseId = null, domain = "all", learnerId = null, learner = null }) => {
  if (personalQuery(query)) {
    let activeLearner = learner;
    let activeLearnerId = learnerId;
    if (activeLearnerId === null || activeLearnerId === undefined) {
      activeLearner = activeLearner || await getCurrentUser();
      activeLearnerId = activeLearner?.id;
    }
    if (activeLearnerId !== null && activeLearnerId !== undefined) {
      const context = await getLearnerRagContext(activeLearnerId, activeLearner);
      const answer = getPersonalAnswer(query, context);
      if (answer) return { ...answer, generatedAt: new Date().toISOString() };
    }
  }

  const sources = await searchKnowledgeBase({ query, domain, courseId, limit: 3 });
  const answer = sources.length
    ? `I found relevant LMS course material in **${sources[0].source}**.\n\n${sources.map((source) => source.matchedExcerpt).join("\n\n")}`
    : "I couldn't find matching material in the course content currently available in the LMS. Add course descriptions, module notes, or lesson content to make this topic searchable.";

  return {
    answer,
    sources,
    generatedAt: new Date().toISOString(),
  };
};

export const getKnowledgeLastSyncAt = () => lastSyncAt;
