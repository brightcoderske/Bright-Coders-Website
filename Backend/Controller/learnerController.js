import jwt from "jsonwebtoken";
import * as Lms from "../Database/Config/lmsQueries.js";
import {
  learnerCookieOptions,
} from "../Middleware/learnerAuthMiddleware.js";
import { sendLessonCompletionEmail } from "../Utils/mailer.js";

const scoreCode = (lesson, html = "", css = "", js = "") => {
  const checks = [
    ...(lesson.required_html || []).map((item) => ({
      area: "HTML",
      item,
      ok: html.toLowerCase().includes(String(item).toLowerCase()),
    })),
    ...(lesson.required_css || []).map((item) => ({
      area: "CSS",
      item,
      ok: css.toLowerCase().includes(String(item).toLowerCase()),
    })),
    ...(lesson.required_js || []).map((item) => ({
      area: "JavaScript",
      item,
      ok: js.toLowerCase().includes(String(item).toLowerCase()),
    })),
  ];

  if (!checks.length) return { score: 100, missing: [] };
  const passed = checks.filter((check) => check.ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    missing: checks.filter((check) => !check.ok),
  };
};

const generateLearnerToken = (id) => {
  return jwt.sign({ id, role: "learner" }, process.env.JWT_SECRET, {
    expiresIn: "6h",
  });
};

export const learnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const learner = await Lms.findLearnerByEmail(email);
    if (!learner || !learner.is_active) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await Lms.compareLearnerPassword(password, learner.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateLearnerToken(learner.id);
    res.cookie("learner_token", token, learnerCookieOptions);

    const { password_hash, ...safeLearner } = learner;
    return res.status(200).json({ learner: safeLearner });
  } catch (error) {
    console.error("LEARNER_LOGIN_ERROR:", error);
    return res.status(500).json({ message: "Login failed." });
  }
};

export const learnerLogout = async (req, res) => {
  res.clearCookie("learner_token", learnerCookieOptions);
  return res.status(200).json({ message: "Logged out." });
};

export const learnerMe = async (req, res) => {
  return res.status(200).json({ learner: req.learner });
};

export const learnerDashboard = async (req, res) => {
  const dashboard = await Lms.getLearnerDashboard(req.learner.id);
  return res.status(200).json({
    learner: req.learner,
    ...dashboard,
  });
};

export const learnerCourse = async (req, res) => {
  const course = await Lms.getCourseTreeForLearner(
    req.learner.id,
    req.params.slug,
  );
  if (!course) return res.status(404).json({ message: "Course not found." });
  return res.status(200).json(course);
};

export const learnerLesson = async (req, res) => {
  const lesson = await Lms.getLessonForLearner(req.learner.id, req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found." });
  return res.status(200).json(lesson);
};

export const saveCode = async (req, res) => {
  const { html, css, js } = req.body;
  const saved = await Lms.saveLearnerCode({
    learnerId: req.learner.id,
    lessonId: req.params.id,
    html,
    css,
    js,
  });
  return res.status(200).json(saved);
};

export const submitLesson = async (req, res) => {
  try {
    const { html = "", css = "", js = "", answers = {} } = req.body;
    const lesson = await Lms.getLessonForLearner(req.learner.id, req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found." });

    const correctAnswers = await Lms.getQuizAnswers(req.params.id);
    const correctCount = correctAnswers.filter((answer) => {
      return (
        String(answers[answer.id] || "").trim().toLowerCase() ===
        String(answer.correct_answer || "").trim().toLowerCase()
      );
    }).length;
    const quizScore = correctAnswers.length
      ? Math.round((correctCount / correctAnswers.length) * 100)
      : 100;

    const codeResult = scoreCode(lesson, html, css, js);
    const completionScore = html.trim() || css.trim() || js.trim() ? 100 : 0;
    const totalScore = Math.round(
      quizScore * 0.4 + codeResult.score * 0.5 + completionScore * 0.1,
    );
    const pointsAwarded = Math.round((lesson.points_available || 100) * (totalScore / 100));

    const progress = await Lms.completeLesson({
      learnerId: req.learner.id,
      lessonId: req.params.id,
      html,
      css,
      js,
      quizScore,
      codeScore: codeResult.score,
      completionScore,
      totalScore,
      pointsAwarded,
      strengths:
        codeResult.score >= 80
          ? "Strong code structure and good lesson completion."
          : "Good effort starting the lesson task.",
      improvements: codeResult.missing.length
        ? `Review missing requirements: ${codeResult.missing
            .map((item) => `${item.area} ${item.item}`)
            .join(", ")}.`
        : "Try improving design polish and readability.",
    });

    const workUrl = `${process.env.SITE_URL || ""}/learn/dashboard`;
    sendLessonCompletionEmail({
      learner: req.learner,
      lesson,
      progress,
      workUrl,
    })
      .then(() =>
        Lms.logParentEmail({
          learnerId: req.learner.id,
          lessonId: lesson.id,
          parentEmail: req.learner.parent_email,
          childEmail: req.learner.child_email,
          subject: `${req.learner.display_name} completed: ${lesson.title}`,
          status: "sent",
        }),
      )
      .catch((error) =>
        Lms.logParentEmail({
          learnerId: req.learner.id,
          lessonId: lesson.id,
          parentEmail: req.learner.parent_email,
          childEmail: req.learner.child_email,
          subject: `${req.learner.display_name} completed: ${lesson.title}`,
          status: "failed",
          errorMessage: error.message,
        }),
      );

    return res.status(200).json({
      progress,
      checks: {
        missing: codeResult.missing,
      },
    });
  } catch (error) {
    console.error("SUBMIT_LESSON_ERROR:", error);
    return res.status(500).json({ message: "Could not submit lesson." });
  }
};

export const leaderboard = async (req, res) => {
  const rows = await Lms.getLeaderboard(req.params.slug || "web-development");
  return res.status(200).json(
    rows.map((row, index) => ({
      rank: index + 1,
      ...row,
    })),
  );
};
