import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";

export const handleWidthDrawCourse = async (
  course,
  setCourses,
  setIsWithdrawingId
) => {
  // const response = window.confirm(
  //   `Withdraw "${course.title}" from the live website? It will return to Draft status.`
  // );
  // if (!response) return;
  try {
    setIsWithdrawingId(course.id);
    const response = await axiosInstance.post(
      API_PATHS.COURSES.WITHDRAW(course.id)
    );
    if (response.status === 200) {
      const refreshedCourse = response.data.updatedCourse;
      setCourses((prevCourses) =>
        prevCourses.map((c) =>
          c.id === course.id ? { ...c, ...refreshedCourse } : c
        )
      );
      return true; // Return true so the component knows it succeeded
      // alert(`Successfully withdrew ${course.title}.`);
    }
  } catch (error) {
    console.error(error);
    throw error; // Throw error so the component can catch it and show a Toast
  } finally {
    setIsWithdrawingId(null);
  }
};
