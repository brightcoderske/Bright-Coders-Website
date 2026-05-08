import * as Lms from "../Database/Config/lmsQueries.js";
import { query } from "../Database/Config/config.db.js";

export const getLmsOverview = async (req, res) => {
  try {
    const overview = await Lms.getAdminLmsOverview();
    const leaderboard = await Lms.getLeaderboard("web-development");
    return res.status(200).json({ ...overview, leaderboard });
  } catch (error) {
    console.error("ADMIN_LMS_OVERVIEW_ERROR:", error);
    return res.status(500).json({ message: "Failed to load LMS overview." });
  }
};

export const getAdminCourseTree = async (req, res) => {
  try {
    const rows = await query(
      `
      SELECT c.id AS course_id, c.slug, c.title AS course_title,
             m.id AS module_id, m.title AS module_title, m.module_order,
             l.id AS lesson_id, l.title AS lesson_title, l.lesson_order,
             l.notes, l.task_prompt, l.example_html, l.example_css, l.example_js,
             l.tasks, l.min_study_seconds, l.unlock_at, l.is_locked,
             l.is_published, l.content_locked_by_admin
      FROM lms_courses c
      LEFT JOIN lms_modules m ON m.course_id = c.id
      LEFT JOIN lms_lessons l ON l.module_id = m.id
      ORDER BY c.created_at ASC, m.module_order ASC, l.lesson_order ASC
      `,
    );
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load course content." });
  }
};

export const updateLessonContent = async (req, res) => {
  try {
    const {
      title,
      notes,
      taskPrompt,
      exampleHtml,
      exampleCss,
      exampleJs,
      tasks,
      minStudySeconds,
      unlockAt,
      isLocked,
      isPublished,
    } = req.body;

    let parsedTasks = null;
    if (tasks !== undefined) {
      if (!Array.isArray(tasks)) {
        return res.status(400).json({ message: "Tasks must be an array." });
      }
      parsedTasks = JSON.stringify(tasks);
    }

    const rows = await query(
      `
      UPDATE lms_lessons
      SET title = COALESCE($1, title),
          notes = COALESCE($2, notes),
          task_prompt = COALESCE($3, task_prompt),
          example_html = COALESCE($4, example_html),
          example_css = COALESCE($5, example_css),
          example_js = COALESCE($6, example_js),
          tasks = COALESCE($7::jsonb, tasks),
          min_study_seconds = COALESCE($8, min_study_seconds),
          unlock_at = $9,
          is_locked = COALESCE($10, is_locked),
          is_published = COALESCE($11, is_published),
          content_locked_by_admin = true
      WHERE id = $12
      RETURNING *
      `,
      [
        title,
        notes,
        taskPrompt,
        exampleHtml,
        exampleCss,
        exampleJs,
        parsedTasks,
        Number.isFinite(Number(minStudySeconds)) ? Number(minStudySeconds) : null,
        unlockAt ? new Date(unlockAt) : null,
        typeof isLocked === "boolean" ? isLocked : null,
        typeof isPublished === "boolean" ? isPublished : null,
        req.params.id,
      ],
    );

    if (!rows[0]) return res.status(404).json({ message: "Lesson not found." });
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("UPDATE_LMS_LESSON_ERROR:", error);
    return res.status(500).json({ message: "Failed to update lesson." });
  }
};
