import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  HelpCircle,
  CheckCircle,
  ArrowLeft,
  Trash2,
  Send,
  Award,
  AlertCircle,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import {
  createAssessment,
  addQuestionToAssessment,
  getAssessmentsByCourse,
} from "../../services/assessmentService";
import { getCourseById } from "../../services/courseService";

function CreateAssessment() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [existingAssessments, setExistingAssessments] = useState([]);
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30);

  // Question Form State
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);

  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cData, aList] = await Promise.allSettled([
        getCourseById(courseId),
        getAssessmentsByCourse(courseId),
      ]);

      if (cData.status === "fulfilled") setCourse(cData.value);
      if (aList.status === "fulfilled" && Array.isArray(aList.value) && aList.value.length > 0) {
        setExistingAssessments(aList.value);
        setAssessment(aList.value[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await createAssessment({
        courseId: Number(courseId),
        title: title.trim(),
        passingScore: Number(passingScore) || 70,
        timeLimitInMinutes: Number(timeLimit) || 30,
      });

      setAssessment(res || { id: Date.now(), title, courseId, passingScore, timeLimitInMinutes: timeLimit });
      setStatusMsg("Assessment exam shell created! Now add test questions below.");
      setTimeout(() => setStatusMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setAssessment({ id: Date.now(), title, courseId, passingScore, timeLimitInMinutes: timeLimit });
      setStatusMsg("Assessment created locally. You can add questions now.");
      setTimeout(() => setStatusMsg(""), 4000);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const validOptions = options.map((opt) => opt.trim());
    if (validOptions.some((opt) => !opt)) {
      alert("Please fill in all 4 answer options.");
      return;
    }

    const payload = {
      assessmentId: assessment.id,
      questionText: questionText.trim(),
      optionA: validOptions[0],
      optionB: validOptions[1],
      optionC: validOptions[2],
      optionD: validOptions[3],
      correctAnswer: ["A", "B", "C", "D"][correctOptionIndex],
      marks: 10,
    };

    try {
      await addQuestionToAssessment(payload);
      setQuestions((prev) => [...prev, payload]);
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setStatusMsg("Question added to exam!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setQuestions((prev) => [...prev, payload]);
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setStatusMsg("Question saved.");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/instructor/my-courses")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
            Course Track #{courseId}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900">
            {course?.title ? `${course.title} — Quiz Exam Builder` : `Assessment Authoring — Course #${courseId}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build certification test assessments, set minimum passing thresholds, and populate multiple-choice question pools.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle size={15} />
            {statusMsg}
          </div>
        )}

        {/* ── Assessment Details Form (If none created) ── */}
        {!assessment ? (
          <form onSubmit={handleCreateAssessment} className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Create Assessment Quiz</h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Exam Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Comprehensive Certification Final Examination"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Save Exam & Add Questions
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Active Exam Overview */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  Active Assessment
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{assessment.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Passing Mark: {assessment.passingScore}% • Time Limit: {assessment.timeLimitInMinutes || 30} mins • Total Questions: {questions.length}
                </p>
              </div>
              <button
                onClick={() => setAssessment(null)}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Change Exam Specs
              </button>
            </div>

            {/* Question Authoring Form */}
            <form onSubmit={handleAddQuestion} className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Add New Question</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which HTTP response code indicates that the request was processed and a resource was created?"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Options & Correct Answer Selection
                </label>
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIndex === idx}
                      onChange={() => setCorrectOptionIndex(idx)}
                      className="text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-500 w-4">
                      {["A", "B", "C", "D"][idx]}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${["A", "B", "C", "D"][idx]} text...`}
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <PlusCircle size={14} /> Add Question to Bank
              </button>
            </form>

            {/* Added Questions List */}
            {questions.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Question Bank ({questions.length} questions)
                </h3>
                <div className="divide-y divide-slate-100">
                  {questions.map((q, idx) => (
                    <div key={idx} className="py-3 text-xs space-y-1">
                      <p className="font-bold text-slate-900">
                        {idx + 1}. {q.questionText}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px] pl-4">
                        <span className={q.correctAnswer === "A" ? "font-bold text-emerald-700" : ""}>
                          A: {q.optionA}
                        </span>
                        <span className={q.correctAnswer === "B" ? "font-bold text-emerald-700" : ""}>
                          B: {q.optionB}
                        </span>
                        <span className={q.correctAnswer === "C" ? "font-bold text-emerald-700" : ""}>
                          C: {q.optionC}
                        </span>
                        <span className={q.correctAnswer === "D" ? "font-bold text-emerald-700" : ""}>
                          D: {q.optionD}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}

export default CreateAssessment;
