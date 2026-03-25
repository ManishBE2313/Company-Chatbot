// src/controllers/batchIngest.ts
import { Response, NextFunction } from "express";
import { validateQueryParams, QueryValidationRules } from "../utils/validation";
import { runtimeConfig } from "../config/runtime";

export class BatchIngestController {
  /**
   * Triggers the batch resume ingestion process from a SharePoint/OneDrive folder.
   * This forwards the payload to the FastAPI layer and responds immediately to the client.
   */
  public static async triggerSharepointSync(req: any, res: Response, next: NextFunction) {
    try {
      // 1. Validate the incoming payload using your existing validation utility
      const validationRules: QueryValidationRules = {
        jobId: { type: "uuid", required: true },
        folderUrl: { type: "string", required: true },
      };

      // We merge params and body so we can validate the jobId from the URL and folderUrl from the body
      validateQueryParams({ ...req.params, ...req.body }, validationRules);

      const { jobId } = req.params;
      const { folderUrl } = req.body;

      // 2. Point to the FastAPI endpoint we created in Step 1
      const fastApiEndpoint = `${runtimeConfig.fastApiBaseUrl}/api/batch-ingest/sharepoint-folder`;

      // 3. Fire and forget: Trigger the FastAPI process in the background.
      // We do not await a successful processing of all files, just the trigger payload.
      fetch(fastApiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId, folderUrl }),
      })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Batch Ingest] FastAPI rejected the trigger: ${errorText}`);
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[Batch Ingest] Failed to reach FastAPI: ${message}`);
      });

      // 4. Immediately return a 202 Accepted to the frontend
      res.status(202).json({
        message: "SharePoint batch import initiated. Resumes will appear in the pipeline as they are processed.",
        status: "processing"
      });
    } catch (error) {
      next(error);
    }
  }
}