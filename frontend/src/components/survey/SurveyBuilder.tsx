"use client";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { SearchableDropdown } from "@/components/ui/SearchableDropdown";
import { TextArea } from "@/components/ui/TextArea";
import { QuestionRenderer } from "./QuestionRenderer";
import { SurveyDraft, SurveyDepartmentRef, SurveyQuestionType } from "@/types/survey";
import { Plus, Trash2 } from "lucide-react";

interface SurveyBuilderProps {
  draft: SurveyDraft;
  departmentOptions: SurveyDepartmentRef[];
  onDraftChange: (updates: Partial<SurveyDraft>) => void;
  onQuestionChange: (questionId: string, updates: { questionText?: string; type?: SurveyQuestionType }) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (questionId: string) => void;
  onAddOption: (questionId: string) => void;
  onOptionChange: (questionId: string, optionId: string, text: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
  onAddDepartment: (departmentId: string) => void;
  onRemoveDepartment: (departmentId: string) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onCancel: () => void;
  isPublishing?: boolean;
}

export function SurveyBuilder({
  draft,
  departmentOptions,
  onDraftChange,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onAddOption,
  onOptionChange,
  onRemoveOption,
  onAddDepartment,
  onRemoveDepartment,
  onSaveDraft,
  onPublish,
  onCancel,
  isPublishing = false,
}: SurveyBuilderProps) {
  const availableDepartments = departmentOptions.filter(
    (department) => !draft.departmentIds.includes(department.id)
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Survey builder</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Compose a survey that feels deliberate and easy to complete.</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            Drafts stay local in Redux until you publish. Once published, the survey is handed to the backend and treated as live.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" className="rounded-2xl" onClick={onCancel}>Back to Dashboard</Button>
          <Button variant="outline" className="rounded-2xl border-slate-200" onClick={onSaveDraft}>Save Draft</Button>
          <Button className="rounded-2xl bg-sky-600 text-white hover:bg-sky-700" isLoading={isPublishing} onClick={onPublish}>Publish</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-950">Setup</CardTitle>
              <CardDescription className="text-slate-500">Give the survey a clear title, schedule, and transparency framing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <input
                    value={draft.title}
                    onChange={(event) => onDraftChange({ title: event.target.value })}
                    placeholder="Quarterly engagement pulse"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <TextArea
                    value={draft.description}
                    onChange={(event) => onDraftChange({ description: event.target.value })}
                    placeholder="Share the intent of the survey so employees know why they are being asked."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Start</label>
                  <input
                    type="datetime-local"
                    value={draft.startAt}
                    onChange={(event) => onDraftChange({ startAt: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">End</label>
                  <input
                    type="datetime-local"
                    value={draft.endAt}
                    onChange={(event) => onDraftChange({ endAt: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Survey type</label>
                  <select
                    value={draft.surveyType}
                    onChange={(event) => onDraftChange({ surveyType: event.target.value as SurveyDraft["surveyType"] })}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="ANONYMOUS">Anonymous</option>
                    <option value="ATTRIBUTED">Normal (Confidential)</option>
                  </select>
                  <p className="text-xs leading-5 text-slate-500">
                    {draft.surveyType === "ANONYMOUS"
                      ? "True Anonymous surveys emphasize identity stripping and aggregated manager reporting."
                      : "Normal surveys remain confidential while still letting HR segment responses for organizational insight."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-950">Targeting</CardTitle>
              <CardDescription className="text-slate-500">Choose whether the survey reaches the full company or specific departments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onDraftChange({ isForAllDepartments: true, departmentIds: [], departments: [] })}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${draft.isForAllDepartments ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                >
                  All Company
                </button>
                <button
                  type="button"
                  onClick={() => onDraftChange({ isForAllDepartments: false })}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${!draft.isForAllDepartments ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                >
                  Selected Departments
                </button>
              </div>

              {!draft.isForAllDepartments ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                  <SearchableDropdown
                    options={availableDepartments}
                    onSelect={onAddDepartment}
                    placeholder="+ add department"
                  />

                  <div className="flex flex-wrap gap-2">
                    {draft.departments.map((department) => (
                      <button
                        key={department.id}
                        type="button"
                        onClick={() => onRemoveDepartment(department.id)}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        {department.name} x
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Questions</h2>
                <p className="text-sm text-slate-500">Create a crisp sequence that is fast to answer and easy to trust.</p>
              </div>
              <Button variant="outline" className="rounded-2xl border-slate-200" onClick={onAddQuestion}>
                <Plus size={14} className="mr-2" />
                Add Question
              </Button>
            </div>

            {draft.questions.map((question, index) => (
              <Card key={question.id} className="rounded-[28px] border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base text-slate-950">Question {index + 1}</CardTitle>
                    <CardDescription className="text-slate-500">Choose the input type and keep the wording direct.</CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(question.id)}
                    className="rounded-2xl border border-slate-200 p-2 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Prompt</label>
                      <input
                        value={question.questionText}
                        onChange={(event) => onQuestionChange(question.id, { questionText: event.target.value })}
                        placeholder="How supported do you feel by your team this month?"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Type</label>
                      <select
                        value={question.type}
                        onChange={(event) => onQuestionChange(question.id, { type: event.target.value as SurveyQuestionType })}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                      >
                        <option value="text">Text</option>
                        <option value="mcq">Multiple choice</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                  </div>

                  {question.type === "mcq" ? (
                    <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-800">Options</h3>
                        <Button variant="ghost" className="rounded-2xl text-sky-700" onClick={() => onAddOption(question.id)}>
                          <Plus size={14} className="mr-2" />
                          Add Option
                        </Button>
                      </div>

                      {(question.options ?? []).map((option) => (
                        <div key={option.id} className="flex gap-3">
                          <input
                            value={option.text}
                            onChange={(event) => onOptionChange(question.id, option.id, event.target.value)}
                            placeholder="Option copy"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveOption(question.id, option.id)}
                            className="rounded-2xl border border-slate-200 p-3 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6 rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-950">Live preview</CardTitle>
              <CardDescription className="text-slate-500">Use the same renderer employees will see when they respond.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
                {draft.surveyType === "ANONYMOUS"
                  ? "This is a True Anonymous survey. Your identity is cryptographically stripped. Managers will only see aggregated data."
                  : "This is a Confidential survey. Your department/tenure is used for grouping, but your manager cannot see individual answers."}
              </div>

              {draft.questions.map((question) => (
                <div key={question.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <QuestionRenderer question={question} disabled />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
