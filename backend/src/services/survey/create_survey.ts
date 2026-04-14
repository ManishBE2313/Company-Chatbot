import { sequelize } from "../../config/database";
import { Transaction } from "sequelize";

import { SurveyRepository } from "../../repositories/survey/create_survey";
import { QuestionRepository } from "../../repositories/survey/create_survey_question";
import { OptionRepository } from "../../repositories/survey/question_options";
import { SurveyDepartmentRepository } from "../../repositories/survey/survey_department";

interface CreateSurveyPayload {
  title: string;
  surveyType: "ATTRIBUTED" | "ANONYMOUS";
  startAt: Date;
  endAt: Date;

  departmentIds?: string[];
  isForAllDepartments?: boolean;

  questions: {
    questionText: string;
    type: "rating" | "text" | "mcq";
    options?: { text: string }[];
  }[];
}

export class SurveyService {

  static async createSurvey(data: CreateSurveyPayload) {
    let transaction: Transaction | null = null;

    try {
      transaction = await sequelize.transaction();

      const survey = await SurveyRepository.createSurvey(
        {
          title: data.title,
          surveyType: data.surveyType,
          startAt: new Date(data.startAt),
          endAt: new Date(data.endAt),
          isForAllDepartments: data.isForAllDepartments ?? false,
        },
        transaction
      );

      if (!data.isForAllDepartments && data.departmentIds?.length) {
        const mappings = data.departmentIds.map((depId) => ({
          surveyId: survey.id,
          departmentId: depId,
        }));

        await SurveyDepartmentRepository.bulkCreate(mappings, transaction);
      }

      const questionsData = data.questions.map((q) => ({
        surveyId: survey.id,
        questionText: q.questionText,
        type: q.type,
      }));

      const createdQuestions = await QuestionRepository.bulkCreate(
        questionsData,
        transaction
      );

      const optionsToCreate: { questionId: string; text: string }[] = [];

      createdQuestions.forEach((createdQ: any, index: number) => {
        const originalQ = data.questions[index];

        if (originalQ.type === "mcq" && originalQ.options) {
          originalQ.options.forEach((opt) => {
            optionsToCreate.push({
              questionId: createdQ.id,
              text: opt.text,
            });
          });
        }
      });

      if (optionsToCreate.length > 0) {
        await OptionRepository.bulkCreate(optionsToCreate, transaction);
      }

      await transaction.commit();

      return survey;
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }
  }

  static async getSurveyById(id: string) {
    const survey = await SurveyRepository.findById(id);

    if (!survey) {
      throw new Error("Survey not found");
    }

    const now = new Date();

    let status: "UPCOMING" | "ACTIVE" | "EXPIRED";

    if (survey.startAt > now) status = "UPCOMING";
    else if (survey.startAt <= now && survey.endAt >= now) status = "ACTIVE";
    else status = "EXPIRED";

    return {
      ...survey.toJSON(),
      status,
    };
  }

  static async getAllSurveys(params: {
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    order: "ASC" | "DESC";
    departmentIds?: string[];
  }) {
    const result = await SurveyRepository.getAllSurveys(params);

    const now = new Date();

    const rowsWithStatus = result.rows.map((survey: any) => {
      let surveyStatus: "UPCOMING" | "ACTIVE" | "EXPIRED";

      if (survey.startAt > now) surveyStatus = "UPCOMING";
      else if (survey.startAt <= now && survey.endAt >= now)
        surveyStatus = "ACTIVE";
      else surveyStatus = "EXPIRED";

      return {
        ...survey.toJSON(),
        status: surveyStatus,
      };
    });

    return {
      count: result.count,
      rows: rowsWithStatus,
    };
  }

  static async updateSurvey(id: string, data: any) {
    const transaction = await sequelize.transaction();

    try {
      const survey = await SurveyRepository.findById(id);

      const updatePayload: any = {};

      if (data.title !== undefined) updatePayload.title = data.title;
      if (data.surveyType !== undefined)
        updatePayload.surveyType = data.surveyType;
      if (data.startAt !== undefined) updatePayload.startAt = data.startAt;
      if (data.endAt !== undefined) updatePayload.endAt = data.endAt;
      if (data.isForAllDepartments !== undefined)
        updatePayload.isForAllDepartments = data.isForAllDepartments;

      if (Object.keys(updatePayload).length > 0) {
        await SurveyRepository.updateSurvey(id, updatePayload, transaction);
      }

      if (data.isForAllDepartments !== undefined || data.departmentIds) {
        await SurveyDepartmentRepository.deleteBySurveyId(id, transaction);

        if (!data.isForAllDepartments && data.departmentIds?.length) {
          const mappings = data.departmentIds.map((depId: string) => ({
            surveyId: id,
            departmentId: depId,
          }));

          await SurveyDepartmentRepository.bulkCreate(
            mappings,
            transaction
          );
        }
      }

      if (data.questions) {
        for (const q of data.questions) {
          let questionId = q.id;

          if (q.id) {
            await QuestionRepository.updateQuestion(
              q.id,
              {
                questionText: q.questionText,
                type: q.type,
              },
              transaction
            );
          } else {
            const newQ = await QuestionRepository.create(
              {
                surveyId: id,
                questionText: q.questionText,
                type: q.type,
              },
              transaction
            );
            questionId = newQ.id;
          }

          if (q.type === "mcq" && q.options) {
            for (const opt of q.options) {
              if (opt.id) {
                await OptionRepository.updateOption(
                  opt.id,
                  { text: opt.text },
                  transaction
                );
              } else {
                await OptionRepository.createOption(
                  { questionId, text: opt.text },
                  transaction
                );
              }
            }
          }
        }
      }

      await transaction.commit();

      return SurveyRepository.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}