import api from "./api";

export const createAssignment = async (
  assignmentData
) => {
  const response = await api.post(
    "/api/assignments",
    assignmentData
  );

  return response.data;
};

export const getInstructorAssignments =
  async (instructorId) => {

    const response =
      await api.get(
        `/api/assignments/instructor/${instructorId}`
      );

    return response.data;
};

export const getCourseAssignments =
  async (courseId) => {

    const response =
      await api.get(
        `/api/assignments/course/${courseId}`
      );

    return response.data;
};

export const submitAssignment =
  async (submissionData) => {

    const response =
      await api.post(
        "/api/submissions",
        submissionData
      );

    return response.data;
};

export const getAssignmentSubmissions =
  async (assignmentId) => {

    const response =
      await api.get(
        `/api/submissions/assignment/${assignmentId}`
      );

    return response.data;
};

export const gradeSubmission =
  async (
    submissionId,
    gradeData
  ) => {

    const response =
      await api.put(
        `/api/submissions/${submissionId}/grade`,
        gradeData
      );

    return response.data;
};

export const getLearnerSubmissions =
  async (learnerId) => {

    const response =
      await api.get(
        `/api/submissions/learner/${learnerId}`
      );

    return response.data;
};

export const uploadAssignmentFile = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/assignments/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};